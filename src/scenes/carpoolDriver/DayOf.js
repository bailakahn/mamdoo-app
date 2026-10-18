import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  AppState,
  Linking,
} from "react-native";
import { Text, Snackbar, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import * as Location from "expo-location";
import Icon from "@expo/vector-icons/MaterialIcons";
import { Button } from "_atoms";
import { ConductNote } from "_molecules";
import { SosButton } from "_organisms";
import { useCarpool, useCarpoolAuth } from "_hooks/carpoolDriver";
import useCarpoolLocationTracking from "_hooks/carpoolDriver/useCarpoolLocationTracking";
import useCarpoolProxy from "_hooks/carpoolDriver/useCarpoolProxy";
import useDriverPosition from "_hooks/carpoolDriver/useDriverPosition";
import { stopPoint, haversineMeters as metersBetween, etaRange } from "_utils/carpoolRoute";
import { t2 } from "_utils/lang";

const formatTime = (iso) => {
  const d = new Date(iso);
  return `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
};

const mmss = (ms) => {
  const total = Math.max(Math.ceil(ms / 1000), 0);
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
};

// The "you look near this stop" hint shows within this distance.
const NEAR_STOP_METERS = 150;

// Automatic arrival: close to the stop and stopped for a while, then a countdown
// the driver can cancel. Riders are told the car is near when it is about this
// many minutes out. Live position goes to riders at most this often.
const AUTO_ARRIVE_METERS = 60;
const AUTO_STILL_MS = 20000;
const AUTO_COUNTDOWN_MS = 10000;
const APPROACH_MINUTES = 5;
const LIVE_EMIT_MS = 10000;

// The screen a driver uses standing at a stop, often in a hurry.
//
// Every design decision here follows from that: one stop at a time rather than the
// whole route, actions as full-width buttons with words on them, no swipes, no
// long-presses, and destructive actions confirmed. §11 treats this as the least
// forgiving screen in the product.
export default function CarpoolDayOf({ navigation, route }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const carpool = useCarpool();
  const carpoolAuth = useCarpoolAuth();
  const driverId = carpoolAuth.carpoolDriver?.userId;

  const { tripId } = route.params || {};
  const [trip, setTrip] = useState(null);
  const [manifest, setManifest] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [stopIndex, setStopIndex] = useState(0);
  const [graceEndsAt, setGraceEndsAt] = useState(null);
  const [now, setNow] = useState(Date.now());

  const timerRef = useRef(null);

  // The GPS trace that makes automatic dispute adjudication possible — only
  // while this trip is actually running, not for however long the driver
  // happens to have the app open.
  useCarpoolLocationTracking({ active: trip?.status === "in_progress", tripId });

  // Stops where someone still gets on or off, in route order. The simulator drives
  // to these, and the "car is near" push is sent for the boarding ones.
  const targetIndexes = useMemo(
    () =>
      [
        ...new Set(
          manifest
            .filter((b) => ["booked", "aboard"].includes(b.status))
            .flatMap((b) => [b.boardIndex, b.exitIndex])
        ),
      ].sort((a, b) => a - b),
    [manifest]
  );
  const running = trip?.status === "in_progress";
  const position = useDriverPosition({
    active: running,
    stopSequence: trip?.stopSequence,
    targetMeters: targetIndexes.map((i) => trip?.stopSequence?.[i]?.distanceFromOriginMeters || 0),
  });

  // The hint, and automatic arrival, apply to the stop the screen is showing, and
  // only while someone gets on or off there.
  const hintStop = trip?.stopSequence?.[stopIndex];
  const hintActive =
    running &&
    !graceEndsAt &&
    manifest.some(
      (b) =>
        (b.boardIndex === stopIndex && b.status === "booked") ||
        (b.exitIndex === stopIndex && b.status === "aboard")
    );
  const hintPoint = stopPoint(hintStop);
  const distanceToStop = position.fix && hintPoint ? metersBetween(position.fix, hintPoint) : null;
  const nearStop = hintActive && distanceToStop != null && distanceToStop <= NEAR_STOP_METERS;

  const load = useCallback(async () => {
    const result = await carpool.actions.getTrip(tripId);
    if (result?.trip) {
      setTrip(result.trip);
      setManifest(result.manifest || []);
      // Resume at the first stop that still has someone waiting, so backgrounding
      // the app and returning does not lose the driver's place.
      const live = (result.manifest || []).filter((b) =>
        ["booked", "aboard"].includes(b.status)
      );
      if (live.length) {
        // First stop with someone still to board, else the first drop-off.
        const waiting = live.filter((b) => b.status === "booked");
        setStopIndex(
          waiting.length
            ? Math.min(...waiting.map((b) => b.boardIndex))
            : Math.min(...live.map((b) => b.exitIndex))
        );
      }
    }
    setLoading(false);
  }, [tripId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  // Refresh when the driver returns to the app — they may have been away for the
  // whole leg between two stops.
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") load();
    });
    return () => sub.remove();
  }, [load]);

  // A rider confirming arrival is the one thing worth interrupting the driver
  // for — everything else on this screen (aboard, dropped off) just needs to
  // be current whenever they next look, which CARPOOL_TRIP_UPDATED covers.
  // Queued rather than a single slot: with several riders on one trip, a
  // second arrival while the first banner is still up must not silently
  // replace it — each is dismissed on its own.
  const [arrivalNotices, setArrivalNotices] = useState([]);

  const { emit } = useCarpoolProxy({
    userId: driverId,
    onTripUpdated: (data) => {
      if (data?.tripId === tripId) load();
    },
    onRiderArrived: (data) => {
      if (data?.tripId !== tripId) return;
      setArrivalNotices((prev) => [...prev, data]);
    },
  });

  const dismissArrivalNotice = () => setArrivalNotices((prev) => prev.slice(1));

  // Live position for the riders' map. The proxy only forwards it from this
  // trip's own driver while the trip is running.
  const lastEmitRef = useRef(0);
  useEffect(() => {
    if (!running || !position.fix || !driverId) return;
    if (Date.now() - lastEmitRef.current < LIVE_EMIT_MS) return;
    lastEmitRef.current = Date.now();
    emit("TRIP_LOCATION", {
      context: "carpool",
      tripId,
      subjectId: driverId,
      subjectRole: "driver",
      lat: position.fix.latitude,
      lng: position.fix.longitude,
      heading: position.fix.heading,
    });
  }, [position.fix]);

  // "Your car is about 5 minutes away" for riders still waiting ahead. The server
  // sends each rider this once; the ref just avoids asking again every fix.
  const approachedRef = useRef(new Set());
  useEffect(() => {
    if (!running || position.progress == null) return;
    for (const index of targetIndexes) {
      if (approachedRef.current.has(index)) continue;
      if (!manifest.some((b) => b.boardIndex === index && b.status === "booked")) continue;
      const eta = etaRange(
        (trip.stopSequence[index]?.distanceFromOriginMeters || 0) - position.progress,
        position.speedKmh
      );
      if (eta && eta.mid <= APPROACH_MINUTES) {
        approachedRef.current.add(index);
        carpool.actions.notifyApproaching(tripId, index, eta.mid);
      }
    }
  }, [position.progress]);

  // Automatic arrival: near the stop and stopped for AUTO_STILL_MS starts a
  // countdown; at zero it taps "I have arrived" for the driver, unless they said
  // "not yet" for this stop.
  const [clock, setClock] = useState(Date.now());
  const [autoArriveAt, setAutoArriveAt] = useState(null);
  const notYetStopsRef = useRef(new Set());
  useEffect(() => {
    if (!nearStop) return;
    const timer = setInterval(() => setClock(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [nearStop]);
  const readyToAutoArrive =
    hintActive &&
    !busy &&
    distanceToStop != null &&
    distanceToStop <= AUTO_ARRIVE_METERS &&
    position.stillForMs >= AUTO_STILL_MS &&
    !notYetStopsRef.current.has(stopIndex);
  useEffect(() => {
    if (!hintActive || !nearStop) {
      setAutoArriveAt(null);
      return;
    }
    if (readyToAutoArrive && !autoArriveAt) setAutoArriveAt(Date.now() + AUTO_COUNTDOWN_MS);
  }, [readyToAutoArrive, hintActive, nearStop]);
  useEffect(() => {
    if (autoArriveAt && clock >= autoArriveAt) {
      setAutoArriveAt(null);
      onArrive();
    }
  }, [clock, autoArriveAt]);
  const notYet = () => {
    notYetStopsRef.current.add(stopIndex);
    setAutoArriveAt(null);
  };

  // Tick only while a grace window is open. A permanent interval would keep the
  // screen re-rendering for the entire trip for no reason.
  useEffect(() => {
    if (!graceEndsAt) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timerRef.current);
  }, [graceEndsAt]);

  const onStart = async () => {
    setBusy(true);
    const result = await carpool.actions.startTrip(tripId);
    setBusy(false);
    if (result) await load();
  };

  const onArrive = async () => {
    setAutoArriveAt(null);
    setBusy(true);
    // A one-shot fix at the moment of the tap, distinct from the continuous
    // background trace (useCarpoolLocationTracking) — this is a discrete,
    // self-attested "I am here now" for dispute evidence, not a stream. A
    // denied/failed fix still lets arrival through with time-only evidence.
    const coords = await Location.getCurrentPositionAsync({})
      .then((fix) => ({
        lat: fix.coords.latitude,
        lng: fix.coords.longitude,
        accuracy: fix.coords.accuracy,
      }))
      .catch(() => ({}));
    const result = await carpool.actions.arriveAtStop(tripId, stopIndex, coords);
    setBusy(false);
    // Grace is a "someone's waiting to board" concept — a pure drop-off stop has
    // nobody to wait for, so it must not show a countdown that means nothing.
    const boardingAtThisStop = manifest.some(
      (b) => b.boardIndex === stopIndex && b.status === "booked"
    );
    if (result?.graceEndsAt && boardingAtThisStop) {
      setGraceEndsAt(new Date(result.graceEndsAt).getTime());
      setNow(Date.now());
    }
    // Riders exiting here are completed server-side by this same call — reload
    // so they drop out of "getting off here" instead of lingering until the
    // driver happens to refresh some other way.
    if (result?.droppedOff) await load();
  };

  const onAboard = async (booking) => {
    setBusy(true);
    await carpool.actions.markAboard(booking._id);
    setBusy(false);
    await load();
  };

  // Destructive and it costs the rider a strike, so it always confirms — even
  // though the server independently refuses before grace has elapsed.
  const onNoShow = (booking) => {
    Alert.alert(
      t2("carpoolDriver.noShowTitle"),
      t2("carpoolDriver.noShowBody", {
        name: `${booking.rider?.firstName || ""} ${booking.rider?.lastName || ""}`.trim(),
      }),
      [
        { text: t2("carpoolDriver.wait"), style: "cancel" },
        {
          text: t2("carpoolDriver.noShowConfirm"),
          style: "destructive",
          onPress: async () => {
            setBusy(true);
            const result = await carpool.actions.markNoShow(booking._id);
            setBusy(false);
            if (result) {
              setGraceEndsAt(null);
              await load();
            }
          },
        },
      ]
    );
  };

  // Refusing to carry someone again. Confirmed twice over: a dialog here, and a
  // server-side check that they actually travelled with this driver.
  const onBlock = (booking) => {
    const name = `${booking.rider?.firstName || ""} ${booking.rider?.lastName || ""}`.trim();
    Alert.alert(
      t2("carpoolDriver.blockTitle", { name }),
      t2("carpoolDriver.blockBody"),
      [
        { text: t2("carpoolDriver.wait"), style: "cancel" },
        {
          text: t2("carpoolDriver.blockConfirm"),
          style: "destructive",
          onPress: async () => {
            setBusy(true);
            const result = await carpool.actions.blockRider({
              riderId: booking.riderId,
              reason: "disrespectful",
              tripId,
              bookingId: booking._id,
            });
            setBusy(false);
            if (result) Alert.alert(t2("carpoolDriver.blockedTitle"), t2("carpoolDriver.blockedBody", { name }));
          },
        },
      ]
    );
  };

  const onComplete = () => {
    Alert.alert(t2("carpoolDriver.finishTitle"), t2("carpoolDriver.finishBody"), [
      { text: t2("carpoolDriver.wait"), style: "cancel" },
      {
        text: t2("carpoolDriver.finishConfirm"),
        onPress: async () => {
          setBusy(true);
          const result = await carpool.actions.completeTrip(tripId);
          setBusy(false);
          if (result) {
            navigation.navigate("CarpoolTripSummary", { summary: result });
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.screen, styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!trip) {
    return (
      <View style={[styles.screen, styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.empty, { color: colors.placeholder }]}>
          {t2("carpoolDriver.tripNotFound")}
        </Text>
      </View>
    );
  }

  const stops = trip.stopSequence || [];

  // A corridor can carry 60+ stops, but a trip only ever touches the handful where
  // somebody boards or alights. Stepping through every stop would be unusable at a
  // roadside, so navigation jumps between the ones that matter — typically three
  // or four for a full car.
  const activeStopIndexes = [
    ...new Set(
      manifest
        .filter((b) => ["booked", "aboard", "completed"].includes(b.status))
        .flatMap((b) => [b.boardIndex, b.exitIndex])
    ),
  ].sort((a, b) => a - b);

  const positionInActive = activeStopIndexes.indexOf(stopIndex);
  const hasPrevious = positionInActive > 0;
  const hasNext = positionInActive > -1 && positionInActive < activeStopIndexes.length - 1;
  const currentStop = stops[stopIndex];
  const boardingHere = manifest.filter(
    (b) => b.boardIndex === stopIndex && b.status === "booked"
  );
  const leavingHere = manifest.filter(
    (b) => b.exitIndex === stopIndex && b.status === "aboard"
  );
  const graceRemaining = graceEndsAt ? graceEndsAt - now : null;
  const graceOpen = graceRemaining != null && graceRemaining > 0;
  const notStarted = trip.status === "confirmed";

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity
          onPress={() => navigation.navigate("HomeTab", { screen: "CarpoolDriverHome" })}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityRole="button"
          accessibilityLabel={t2("carpoolDriver.close")}
        >
          <Icon name="arrow-back" size={26} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {formatTime(trip.departureAt)}
        </Text>
        {/* Compact so it sits in the header without competing with the stop name,
            but always present while the trip is under way. */}
        <SosButton context="carpool" tripId={trip._id} compact />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.body,
          { paddingBottom: Math.max(insets.bottom + 24, 32) },
        ]}
      >
        {notStarted ? (
          <View style={styles.startBox}>
            <Icon name="play-circle-outline" size={48} color={colors.primary} />
            <Text style={[styles.startTitle, { color: colors.text }]}>
              {t2("carpoolDriver.readyToGo")}
            </Text>
            <Text style={[styles.startHint, { color: colors.placeholder }]}>
              {t2("carpoolDriver.ridersWaiting", {
                count: manifest.filter((b) => b.status === "booked").length,
              })}
            </Text>

            <ConductNote text={t2("carpoolDriver.conductDriver")} />
            <Button
              mode="contained"
              icon="play"
              loading={busy}
              disabled={busy}
              onPress={onStart}
              style={styles.bigButton}
              contentStyle={styles.bigButtonContent}
            >
              {t2("carpoolDriver.startTrip")}
            </Button>
          </View>
        ) : (
          <>
            {/* Where the driver is now — the single fact this screen exists to answer. */}
            <View style={[styles.stopBox, { borderColor: colors.primary }]}>
              <Text style={[styles.stopEyebrow, { color: colors.placeholder }]}>
                {t2("carpoolDriver.stopOf", {
                  current: positionInActive > -1 ? positionInActive + 1 : 1,
                  total: activeStopIndexes.length || 1,
                })}
              </Text>
              <Text style={[styles.stopName, { color: colors.text }]}>
                {currentStop?.name}
              </Text>

              {graceOpen && (
                <View style={styles.graceRow}>
                  <Icon name="timer" size={20} color="#92400E" />
                  <Text style={styles.graceText}>
                    {t2("carpoolDriver.graceRunning", { time: mmss(graceRemaining) })}
                  </Text>
                </View>
              )}
              {graceRemaining != null && !graceOpen && (
                <View style={styles.graceRow}>
                  <Icon name="timer-off" size={20} color="#B3261E" />
                  <Text style={[styles.graceText, { color: "#B3261E" }]}>
                    {t2("carpoolDriver.graceOver")}
                  </Text>
                </View>
              )}
            </View>

            {!!currentStop?.location?.coordinates && (
              <Button
                mode="text"
                icon="directions"
                onPress={() => {
                  const [lng, lat] = currentStop.location.coordinates;
                  Linking.openURL(
                    `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`
                  ).catch(() => {});
                }}
                style={styles.directionsButton}
              >
                {t2("carpoolDriver.directionsToStop")}
              </Button>
            )}

            {autoArriveAt && (
              <View style={[styles.autoArriveBox, { borderColor: colors.primary }]}>
                <Text style={[styles.autoArriveTitle, { color: colors.text }]}>
                  {t2("carpoolDriver.autoArrivalTitle", { stop: currentStop?.name })}
                </Text>
                <Text style={[styles.autoArriveHint, { color: colors.placeholder }]}>
                  {t2("carpoolDriver.autoArrivalCountdown", {
                    seconds: Math.max(Math.ceil((autoArriveAt - clock) / 1000), 0),
                  })}
                </Text>
                <View style={styles.autoArriveActions}>
                  <Button mode="contained" icon="check" onPress={onArrive} style={styles.autoArriveButton}>
                    {t2("carpoolDriver.autoArrivalConfirm")}
                  </Button>
                  <Button mode="outlined" onPress={notYet} style={styles.autoArriveButton}>
                    {t2("carpoolDriver.autoArrivalNotYet")}
                  </Button>
                </View>
              </View>
            )}

            {!graceEndsAt && !autoArriveAt && (boardingHere.length > 0 || leavingHere.length > 0) && (
              <>
                {nearStop && (
                  <View style={styles.nearStopHint}>
                    <Icon name="near-me" size={18} color={colors.primary} />
                    <Text style={[styles.nearStopHintText, { color: colors.primary }]}>
                      {t2("carpoolDriver.nearStopHint")}
                    </Text>
                  </View>
                )}
                <Button
                  mode="contained"
                  icon="map-marker-check"
                  loading={busy}
                  disabled={busy}
                  onPress={onArrive}
                  style={styles.bigButton}
                  contentStyle={styles.bigButtonContent}
                >
                  {t2("carpoolDriver.iHaveArrived")}
                </Button>
              </>
            )}

            {boardingHere.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionLabel, { color: colors.placeholder }]}>
                  {t2("carpoolDriver.gettingOn", { count: boardingHere.length })}
                </Text>
                {boardingHere.map((booking) => (
                  <View key={booking._id} style={[styles.riderCard, { borderColor: colors.border }]}>
                    <View style={styles.riderRow}>
                      <Icon name="person" size={22} color={colors.placeholder} />
                      <Text style={[styles.riderName, { color: colors.text }]}>
                        {booking.rider?.firstName} {booking.rider?.lastName}
                      </Text>
                      <Text style={[styles.riderTo, { color: colors.placeholder }]}>
                        → {stops[booking.exitIndex]?.name}
                      </Text>
                    </View>

                    <View style={styles.riderActions}>
                      <Button
                        mode="contained"
                        icon="check"
                        disabled={busy}
                        onPress={() => onAboard(booking)}
                        style={styles.aboardButton}
                        contentStyle={styles.riderButtonContent}
                      >
                        {t2("carpoolDriver.aboard")}
                      </Button>
                      <Button
                        mode="outlined"
                        icon="close"
                        // Only offered once the wait is genuinely over. Before that
                        // the button is not merely rejected by the server — it is
                        // not there to press.
                        disabled={busy || !graceEndsAt || graceOpen}
                        onPress={() => onNoShow(booking)}
                        style={styles.noShowButton}
                        contentStyle={styles.riderButtonContent}
                        textColor="#B3261E"
                      >
                        {t2("carpoolDriver.noShow")}
                      </Button>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {leavingHere.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionLabel, { color: colors.placeholder }]}>
                  {t2("carpoolDriver.gettingOff", { count: leavingHere.length })}
                </Text>
                {leavingHere.map((booking) => (
                  <View key={booking._id} style={styles.riderRowPlain}>
                    <Icon name="flag" size={20} color={colors.placeholder} />
                    <Text style={[styles.riderName, { color: colors.text }]}>
                      {booking.rider?.firstName} {booking.rider?.lastName}
                    </Text>
                    <TouchableOpacity
                      onPress={() => onBlock(booking)}
                      disabled={busy}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      accessibilityRole="button"
                    >
                      <Text style={styles.blockLink}>{t2("carpoolDriver.block")}</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.navRow}>
              <Button
                mode="outlined"
                icon="chevron-left"
                disabled={!hasPrevious || busy}
                onPress={() => {
                  setStopIndex(activeStopIndexes[positionInActive - 1]);
                  setGraceEndsAt(null);
                }}
                style={styles.navButton}
                contentStyle={styles.navButtonContent}
              >
                {t2("carpoolDriver.previousStop")}
              </Button>
              <Button
                mode="outlined"
                icon="chevron-right"
                disabled={!hasNext || busy}
                onPress={() => {
                  setStopIndex(activeStopIndexes[positionInActive + 1]);
                  setGraceEndsAt(null);
                }}
                style={styles.navButton}
                contentStyle={styles.navButtonContent}
              >
                {t2("carpoolDriver.nextStop")}
              </Button>
            </View>

            {/* Every stop that matters on this trip, so the driver can skip the empty ones. */}
            {activeStopIndexes.length > 1 && (
              <View style={styles.section}>
                <Text style={[styles.sectionLabel, { color: colors.placeholder }]}>
                  {t2("carpoolDriver.routeOverview")}
                </Text>
                {activeStopIndexes.map((index) => {
                  const on = manifest.filter((b) => b.boardIndex === index && b.status === "booked").length;
                  const off = manifest.filter((b) => b.exitIndex === index && b.status === "aboard").length;
                  const selected = index === stopIndex;
                  return (
                    <TouchableOpacity
                      key={index}
                      onPress={() => {
                        setStopIndex(index);
                        setGraceEndsAt(null);
                      }}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      style={[
                        styles.overviewRow,
                        { borderColor: selected ? colors.primary : colors.border },
                      ]}
                    >
                      <Text style={[styles.overviewName, { color: colors.text }]} numberOfLines={1}>
                        {stops[index]?.name}
                      </Text>
                      <Text style={[styles.overviewCounts, { color: colors.placeholder }]}>
                        {t2("carpoolDriver.stopCounts", { on, off })}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {/* Test builds only: drives a fake car along the route so two phones on
                one desk can test tracking, ETA and automatic arrival. */}
            {position.simulator.available && (
              <View style={[styles.simBox, { borderColor: colors.border }]}>
                <Text style={[styles.sectionLabel, { color: colors.placeholder }]}>
                  {t2("carpoolDriver.simTitle")}
                </Text>
                <Text style={[styles.simHint, { color: colors.placeholder }]}>
                  {t2("carpoolDriver.simHint")}
                </Text>
                <View style={styles.simRow}>
                  <Button
                    mode="contained"
                    icon={position.simulator.running ? "pause" : "play"}
                    onPress={position.simulator.running ? position.simulator.pause : position.simulator.start}
                    style={styles.simButton}
                  >
                    {position.simulator.running ? t2("carpoolDriver.simPause") : t2("carpoolDriver.simStart")}
                  </Button>
                  <Button mode="outlined" icon="skip-next" onPress={position.simulator.nextStop} style={styles.simButton}>
                    {t2("carpoolDriver.simNextStop")}
                  </Button>
                </View>
                <View style={styles.simRow}>
                  {[1, 5, 20].map((multiplier) => (
                    <TouchableOpacity
                      key={multiplier}
                      onPress={() => position.simulator.setMultiplier(multiplier)}
                      accessibilityRole="button"
                      accessibilityState={{ selected: position.simulator.multiplier === multiplier }}
                      style={[
                        styles.simChip,
                        {
                          borderColor: colors.primary,
                          backgroundColor:
                            position.simulator.multiplier === multiplier ? colors.primary : "transparent",
                        },
                      ]}
                    >
                      <Text
                        style={{
                          color: position.simulator.multiplier === multiplier ? "#fff" : colors.text,
                          fontWeight: "600",
                        }}
                      >
                        {multiplier}×
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            <Button
              mode="contained"
              icon="flag-checkered"
              loading={busy}
              disabled={busy}
              onPress={onComplete}
              style={[styles.bigButton, { backgroundColor: "#1F6F43" }]}
              contentStyle={styles.bigButtonContent}
            >
              {t2("carpoolDriver.finishTrip")}
            </Button>
          </>
        )}
      </ScrollView>

      <Snackbar
        visible={arrivalNotices.length > 0}
        onDismiss={dismissArrivalNotice}
        duration={8000}
        action={{
          label: t2("carpoolDriver.close"),
          onPress: dismissArrivalNotice,
          textColor: "#fff",
        }}
        style={{ backgroundColor: colors.primary }}
      >
        {arrivalNotices[0] &&
          t2("carpoolDriver.riderArrivedBanner", {
            name: arrivalNotices[0].riderName || t2("carpoolDriver.riderArrivedFallbackName"),
            stop: arrivalNotices[0].stopName || "",
          })}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  center: { alignItems: "center", justifyContent: "center", padding: 32 },
  empty: { fontSize: 16, textAlign: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerTitle: { fontSize: 20, fontWeight: "700" },
  body: { paddingHorizontal: 20 },
  startBox: { alignItems: "center", paddingVertical: 32 },
  startTitle: { fontSize: 22, fontWeight: "700", marginTop: 14 },
  startHint: { fontSize: 15, marginTop: 6, marginBottom: 24 },
  stopBox: { borderWidth: 2, borderRadius: 14, padding: 18, marginBottom: 16 },
  stopEyebrow: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  // Large because it is read at a glance, through a windscreen, in a hurry.
  stopName: { fontSize: 26, fontWeight: "700", marginTop: 6 },
  graceRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12 },
  graceText: { fontSize: 17, fontWeight: "700", color: "#92400E" },
  section: { marginBottom: 20 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  riderCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  riderRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  riderRowPlain: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
  },
  riderName: { flex: 1, fontSize: 17, fontWeight: "600" },
  blockLink: { fontSize: 14, fontWeight: "600", color: "#B3261E" },
  riderTo: { fontSize: 13 },
  riderActions: { flexDirection: "row", gap: 10, marginTop: 12 },
  aboardButton: { flex: 1, borderRadius: 10 },
  noShowButton: { flex: 1, borderRadius: 10, borderColor: "#B3261E" },
  // Comfortably tappable without looking, which is the point at a roadside stop.
  riderButtonContent: { height: 50 },
  directionsButton: { alignSelf: "flex-start", marginBottom: 8 },
  autoArriveBox: { borderWidth: 2, borderRadius: 14, padding: 16, marginBottom: 16 },
  autoArriveTitle: { fontSize: 17, fontWeight: "700" },
  autoArriveHint: { fontSize: 14, marginTop: 4 },
  autoArriveActions: { flexDirection: "row", gap: 10, marginTop: 12 },
  autoArriveButton: { flex: 1, borderRadius: 10 },
  overviewRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 6,
    gap: 8,
  },
  overviewName: { flex: 1, fontSize: 15, fontWeight: "600" },
  overviewCounts: { fontSize: 13 },
  simBox: { borderWidth: 1, borderStyle: "dashed", borderRadius: 12, padding: 14, marginBottom: 16 },
  simHint: { fontSize: 13, marginBottom: 10 },
  simRow: { flexDirection: "row", gap: 10, marginBottom: 8 },
  simButton: { flex: 1, borderRadius: 10 },
  simChip: { borderWidth: 1.5, borderRadius: 18, paddingHorizontal: 16, paddingVertical: 6 },
  nearStopHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#EFF6FF",
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
  },
  nearStopHintText: { flex: 1, fontSize: 14, fontWeight: "600" },
  bigButton: { borderRadius: 12, marginTop: 8, marginBottom: 16 },
  bigButtonContent: { height: 58 },
  navRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  navButton: { flex: 1, borderRadius: 10 },
  navButtonContent: { height: 48 },
});
