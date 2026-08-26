import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  AppState,
} from "react-native";
import { Text, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import Icon from "@expo/vector-icons/MaterialIcons";
import { Button } from "_atoms";
import { ConductNote } from "_molecules";
import { SosButton } from "_organisms";
import { useCarpool } from "_hooks/carpoolDriver";
import { t2 } from "_utils/lang";

const formatTime = (iso) => {
  const d = new Date(iso);
  return `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
};

const mmss = (ms) => {
  const total = Math.max(Math.ceil(ms / 1000), 0);
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
};

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

  const { tripId } = route.params || {};
  const [trip, setTrip] = useState(null);
  const [manifest, setManifest] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [stopIndex, setStopIndex] = useState(0);
  const [graceEndsAt, setGraceEndsAt] = useState(null);
  const [now, setNow] = useState(Date.now());

  const timerRef = useRef(null);

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
    setBusy(true);
    const result = await carpool.actions.arriveAtStop(tripId, stopIndex);
    setBusy(false);
    if (result?.graceEndsAt) {
      setGraceEndsAt(new Date(result.graceEndsAt).getTime());
      setNow(Date.now());
    }
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

            {!graceEndsAt && boardingHere.length > 0 && (
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
  bigButton: { borderRadius: 12, marginTop: 8, marginBottom: 16 },
  bigButtonContent: { height: 58 },
  navRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  navButton: { flex: 1, borderRadius: 10 },
  navButtonContent: { height: 48 },
});
