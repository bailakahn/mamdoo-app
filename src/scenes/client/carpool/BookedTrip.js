import React, { useEffect, useState, useCallback } from "react";
import { View, ScrollView, ActivityIndicator, StyleSheet, Alert, Image, Linking, Share } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import * as Location from "expo-location";
import Icon from "@expo/vector-icons/MaterialIcons";
import { StepHeader } from "_molecules";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SosButton, CarpoolLiveMap } from "_organisms";
import { Button } from "_atoms";
import { useCarpool, useUser } from "_hooks";
import useCarpoolLocationTracking from "_hooks/useCarpoolLocationTracking";
import useCarpoolProxy from "_hooks/useCarpoolProxy";
import { t } from "_utils/lang";
import { tripPhase, earliestAtStop, stopsAway, graceEndsAt, lastReachedStop, SOS_PHASES } from "_utils/carpoolTrip";
import { progressMeters, recentSpeedKmh, etaRange } from "_utils/carpoolRoute";

const SAVE_DATA_KEY = "carpool:saveData";
const LIVE_PHASES = ["onTheWay", "atStop", "aboard"];

const formatPrice = (value) =>
  `${String(Math.floor(value || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ".")} GNF`;

const formatTime = (iso) => {
  const d = new Date(iso);
  return `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
};

// §6 requires per-stop times to be shown as WINDOWS, never exact. Conakry traffic
// is volatile and an exact promise the driver cannot keep destroys trust in both
// directions. Departure from the origin is the only hard time in the product.
//
// The window's WIDTH used to be a flat 30 minutes for every rider on every trip,
// which reads as implausibly wide for someone getting off two stops later and
// implausibly tight for someone riding the whole corridor. Scaled by the actual
// distance to this rider's own exit stop instead — a first pass at a real
// estimate (assumes ~24 km/h average with Conakry traffic), not a calibrated
// one; worth revisiting once there is real trip data to check it against.
const MIN_WINDOW_MINUTES = 10;
const MAX_WINDOW_MINUTES = 45;
const MINUTES_PER_KM = 2.5;

const arrivalWindow = (iso, distanceMeters) => {
  const distanceKm = Math.max(distanceMeters || 0, 0) / 1000;
  const spreadMinutes = Math.min(
    Math.max(MIN_WINDOW_MINUTES + distanceKm * MINUTES_PER_KM, MIN_WINDOW_MINUTES),
    MAX_WINDOW_MINUTES
  );
  const base = new Date(iso);
  const from = new Date(base.getTime());
  const to = new Date(base.getTime() + spreadMinutes * 60000);
  return `${formatTime(from)}–${formatTime(to)}`;
};

// Turns the attribution log into the sentence a rider should read. A no-show at a
// stop is explained as such, so a late trip does not simply look like an
// unreliable driver.
const delayExplanation = (events) => {
  const noShow = events.find((e) => e.type === "rider_no_show");
  if (noShow) {
    return t("carpool.delayNoShow", {
      stop: noShow.stopName,
      minutes: noShow.delayMinutes,
    });
  }
  const driverLate = events.find((e) => e.attributedTo === "driver" && e.delayMinutes > 0);
  if (driverLate) {
    return t("carpool.delayDriver", { minutes: driverLate.delayMinutes });
  }
  return null;
};

// "I'm at my stop" opens this long before departure, matching the provider.
const EARLY_ARRIVAL_MS = 30 * 60000;

const dayLabel = (value, now = new Date()) => {
  if (!value) return "";
  const date = new Date(value);
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60000);
  if (date.toISOString().slice(0, 10) === tomorrow.toISOString().slice(0, 10)) return t("carpool.tomorrow");
  return `${t(`carpool.weekday_${date.getUTCDay()}`)} ${String(date.getUTCDate()).padStart(2, "0")}`;
};

// Title, hint and icon for the header, per trip state.
const phaseHeader = ({ phase, trip, booking, events, graceMinutes, boardStop, exitStop, pickupTime, carText, plate, exitWindow }) => {
  switch (phase) {
    case "dayOf":
      return {
        icon: "today",
        title: t("carpool.phaseDayOfTitle"),
        hint: t("carpool.phaseDayOfHint", { stop: boardStop?.name, time: pickupTime }),
      };
    case "onTheWay": {
      const away = stopsAway({ booking, events });
      return {
        icon: "directions-car",
        title: t("carpool.phaseOnTheWayTitle"),
        hint:
          away === null
            ? t("carpool.phaseOnTheWayStarted")
            : away <= 1
            ? t("carpool.phaseOnTheWayNext")
            : t("carpool.phaseOnTheWayStops", { count: away }),
      };
    }
    case "atStop": {
      const ends = graceEndsAt({ booking, events, graceMinutes });
      return {
        icon: "place",
        tone: "alert",
        title: t("carpool.phaseAtStopTitle", { stop: boardStop?.name }),
        hint: t("carpool.phaseAtStopHint", {
          time: ends ? formatTime(ends) : "",
          car: [carText, plate].filter(Boolean).join(" · "),
        }),
      };
    }
    case "aboard":
      return {
        icon: "airline-seat-recline-normal",
        title: t("carpool.phaseAboardTitle"),
        hint: t("carpool.phaseAboardHint", { stop: exitStop?.name, window: exitWindow }),
      };
    case "done":
      return { icon: "check-circle", title: t("carpool.phaseDoneTitle"), hint: t("carpool.phaseDoneHint") };
    case "cancelled": {
      const key =
        booking.status === "no_show"
          ? "carpool.bookingNoShow"
          : booking.status === "cancelled_rider"
          ? "carpool.bookingCancelledRider"
          : booking.status === "cancelled_admin"
          ? "carpool.bookingCancelledAdmin"
          : trip?.status === "cancelled_by_admin"
          ? "carpool.statusCancelledAdmin"
          : booking.status === "cancelled_driver" || trip?.status === "cancelled_by_driver"
          ? "carpool.statusCancelledDriver"
          : "carpool.statusUnknown";
      return { icon: "cancel", tone: "alert", title: t(key) };
    }
    default:
      return {
        icon: "schedule",
        title: t("carpool.phaseBookedTitle"),
        hint: t("carpool.phaseBookedHint", {
          day: dayLabel(trip?.departureAt),
          stop: boardStop?.name,
          time: pickupTime,
        }),
      };
  }
};

export default function BookedTrip({ navigation, route }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const carpool = useCarpool();
  const user = useUser();

  // Opened either from a booking list (bookingId) or from a push about a trip
  // (tripId). A push can arrive for a trip the rider no longer has a seat on, so
  // the tripId path must not fall back to an unrelated booking.
  const { bookingId, tripId } = route.params || {};
  const [booking, setBooking] = useState(null);
  const [trip, setTrip] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmingArrival, setConfirmingArrival] = useState(false);
  const [carPhotoUrl, setCarPhotoUrl] = useState(null);
  const [graceMinutes, setGraceMinutes] = useState(5);
  const [now, setNow] = useState(new Date());
  const [carFixes, setCarFixes] = useState([]);
  const [saveData, setSaveData] = useState(false);

  // The rider's choice of map or save-data view, remembered on this phone.
  useEffect(() => {
    AsyncStorage.getItem(SAVE_DATA_KEY)
      .then((value) => setSaveData(value === "true"))
      .catch(() => {});
  }, []);
  const toggleSaveData = () => {
    const next = !saveData;
    setSaveData(next);
    AsyncStorage.setItem(SAVE_DATA_KEY, String(next)).catch(() => {});
  };

  // Countdowns (grace at the stop, early arrival) need a clock, not just reloads.
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(timer);
  }, []);

  const load = useCallback(async () => {
    const list = await carpool.actions.loadBookings("upcoming");
    const found = bookingId
      ? list.find((b) => String(b._id) === String(bookingId))
      : tripId
      ? list.find((b) => String(b.trip?._id) === String(tripId))
      : list[0];
    setBooking(found || null);

    if (found?.trip?._id) {
      const [tripResult, eventsResult] = await Promise.all([
        carpool.actions.getTrip(found.trip._id),
        carpool.actions.getTripEvents(found.trip._id),
      ]);
      setTrip(tripResult?.trip || found.trip);
      setCarPhotoUrl(tripResult?.carPhotoUrl || null);
      if (tripResult?.graceMinutes) setGraceMinutes(tripResult.graceMinutes);
      setEvents(eventsResult?.events || []);
    }
    setLoading(false);
  }, [bookingId]);

  // Same trace as the driver side (hooks/carpoolDriver/useCarpoolLocationTracking) —
  // this half was entirely missing, and co-movement/no-show adjudication needs
  // both. Matches exactly the window this screen already treats as "with the
  // driver" for the SOS button below.
  useCarpoolLocationTracking({
    active: ["confirmed", "in_progress"].includes(trip?.status),
    tripId: trip?._id,
    bookingId: booking?._id,
  });

  // Refresh on focus so the rider sees current state after backgrounding the app,
  // without needing to know to pull down.
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  // Live refresh while this screen is actually open — without it, a driver
  // marking this rider aboard or dropped off only shows up here after the app
  // is backgrounded and refocused, which is the exact confusion that prompted
  // this in the first place.
  useCarpoolProxy({
    userId: user.user?.userId,
    onTripUpdated: (data) => {
      if (data?.tripId === trip?._id) load();
    },
    // Ignored in save-data mode: no map to draw, and the ETA then follows stops.
    onTripLocation: (data) => {
      if (saveData || data?.tripId !== String(trip?._id)) return;
      setCarFixes((prev) =>
        [...prev, { latitude: data.lat, longitude: data.lng, at: new Date().toISOString() }].slice(-6)
      );
    },
  });

  const onCancel = () => {
    Alert.alert(
      t("carpool.cancelBookingTitle"),
      t("carpool.cancelBookingBody"),
      [
        { text: t("carpool.keepBooking"), style: "cancel" },
        {
          text: t("carpool.cancelBookingConfirm"),
          style: "destructive",
          onPress: async () => {
            const result = await carpool.actions.cancelBooking(booking._id);
            if (result?.strikeIssued) {
              Alert.alert(t("carpool.cancelledTitle"), t("carpool.cancelledStrike"));
            }
            navigation.navigate("CarpoolHome");
          },
        },
      ]
    );
  };

  // Which stop this rider has standing to confirm right now, mirroring the
  // driver's own arriveAtStop tap on the other side — waiting to board points at
  // boardIndex, already aboard points at exitIndex. `bookingId` is stripped from
  // events on the client app (a rider must never see who else no-showed), so
  // "did I already confirm" is read from `actorId` against this rider's own id
  // instead.
  const arrivalStopIndex =
    booking?.status === "aboard" ? booking.exitIndex : booking?.status === "booked" ? booking.boardIndex : null;

  const alreadyConfirmedArrival =
    arrivalStopIndex != null &&
    events.some(
      (e) =>
        e.type === "rider_confirmed_arrival" &&
        e.stopIndex === arrivalStopIndex &&
        String(e.actorId) === String(user.user?.userId)
    );

  const onConfirmArrival = async () => {
    setConfirmingArrival(true);
    const coords = await Location.getCurrentPositionAsync({})
      .then((fix) => ({
        lat: fix.coords.latitude,
        lng: fix.coords.longitude,
        accuracy: fix.coords.accuracy,
      }))
      .catch(() => ({}));
    await carpool.actions.confirmArrival(booking._id, arrivalStopIndex, coords);
    setConfirmingArrival(false);
    await load();
  };

  if (loading) {
    return (
      <View style={[styles.screen, styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <StepHeader
          title={t("carpool.noBookingTitle")}
          onBack={() => navigation.navigate("CarpoolHome")}
        />
        <View style={styles.center}>
          <Text style={styles.empty}>{t("carpool.noBookingHint")}</Text>
        </View>
      </View>
    );
  }

  const findAnotherTrip = () => {
    const boardStop = trip.stopSequence?.[booking.boardIndex];
    const exitStop = trip.stopSequence?.[booking.exitIndex];
    carpool.actions.resetCarpoolSearch();
    carpool.actions.setCarpoolSearch({
      corridorId: trip.corridorId,
      direction: trip.direction,
      boardStop: { _id: boardStop?.stopId, name: boardStop?.name },
      exitStop: { _id: exitStop?.stopId, name: exitStop?.name },
    });
    navigation.navigate("CarpoolTrips");
  };

  const phase = tripPhase({ trip, booking, events, now });
  const boardStop = trip?.stopSequence?.[booking.boardIndex];
  const exitStop = trip?.stopSequence?.[booking.exitIndex];
  const pickupTime = trip ? formatTime(earliestAtStop(trip, booking.boardIndex)) : "";
  const car = booking.trip?.carId || trip?.carId;
  const carText = [car?.color, car?.make, car?.model].filter(Boolean).join(" ");
  const driver = trip?.driverId || booking.trip?.driverId;
  const exitWindow = trip
    ? arrivalWindow(
        earliestAtStop(trip, booking.boardIndex),
        (exitStop?.distanceFromOriginMeters || 0) - (boardStop?.distanceFromOriginMeters || 0)
      )
    : "";

  const header = phaseHeader({
    phase,
    trip,
    booking,
    events,
    graceMinutes,
    boardStop,
    exitStop,
    pickupTime,
    carText,
    plate: car?.plate,
    exitWindow,
  });
  const explanation = delayExplanation(events);
  const canCancel = ["booked", "dayOf"].includes(phase);
  const canCall = ["dayOf", "onTheWay", "atStop", "aboard"].includes(phase) && !!driver?.phoneNumber;
  const canShare = ["onTheWay", "atStop", "aboard"].includes(phase);
  const canConfirmEarly =
    phase === "dayOf" && new Date(trip?.departureAt) - now <= EARLY_ARRIVAL_MS;

  // ETA to the rider's stop (or to their drop-off once aboard): from the live
  // car when there is one, otherwise from the last stop the car reached.
  const live = LIVE_PHASES.includes(phase);
  const targetIndex = phase === "aboard" ? booking.exitIndex : booking.boardIndex;
  const targetMeters = trip?.stopSequence?.[targetIndex]?.distanceFromOriginMeters || 0;
  const carFix = carFixes[carFixes.length - 1] || null;
  const reached = lastReachedStop(events);
  const eta =
    !live || phase === "atStop"
      ? null
      : carFix && !saveData
      ? etaRange(targetMeters - progressMeters(trip.stopSequence, carFix), recentSpeedKmh(carFixes))
      : reached >= 0
      ? etaRange(targetMeters - (trip?.stopSequence?.[reached]?.distanceFromOriginMeters || 0))
      : null;

  const onShare = () =>
    Share.share({
      message: t("carpool.shareTripMessage", {
        driver: [driver?.firstName, driver?.lastName].filter(Boolean).join(" "),
        car: carText,
        plate: car?.plate || "—",
        from: boardStop?.name,
        to: exitStop?.name,
        time: pickupTime,
      }),
    }).catch(() => {});

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <StepHeader
        title={t("carpool.yourTripTitle")}
        onBack={() => navigation.navigate("CarpoolHome")}
      />

      <ScrollView
        contentContainerStyle={[
          styles.body,
          { paddingBottom: Math.max(insets.bottom + 24, 32) },
        ]}
      >
        {/* The trip's current state, in words, with what to do next. */}
        <View style={[styles.statusBox, { borderColor: header.tone === "alert" ? colors.error : colors.primary }]}>
          <Icon name={header.icon} size={26} color={header.tone === "alert" ? colors.error : colors.primary} />
          <View style={styles.statusTextWrap}>
            <Text style={[styles.statusText, { color: colors.text }]}>{header.title}</Text>
            {!!header.hint && <Text style={styles.statusHint}>{header.hint}</Text>}
          </View>
        </View>

        {/* The driver cancelled, so the rider keeps the same stops and looks for
            another car on the same route rather than starting from scratch. */}
        {phase === "cancelled" && booking.status !== "no_show" && trip && (
            <Button
              mode="contained"
              icon="magnify"
              onPress={findAnotherTrip}
              style={styles.cancelButton}
              contentStyle={styles.cancelContent}
            >
              {t("carpool.findAnotherTrip")}
            </Button>
          )}

        {!!explanation && (
          <View style={styles.delayBox}>
            <Icon name="info-outline" size={20} color="#B45309" />
            <Text style={styles.delayText}>{explanation}</Text>
          </View>
        )}

        {live && (
          <View style={styles.section}>
            {!!eta && (
              <Text style={[styles.etaText, { color: colors.text }]}>
                {phase === "aboard"
                  ? t("carpool.etaToExit", { stop: exitStop?.name, low: eta.low, high: eta.high })
                  : t("carpool.etaToYourStop", { low: eta.low, high: eta.high })}
              </Text>
            )}
            {!saveData &&
              (carFix ? (
                <CarpoolLiveMap
                  stopSequence={trip.stopSequence}
                  carFix={carFix}
                  boardIndex={booking.boardIndex}
                  exitIndex={booking.exitIndex}
                  color={colors.primary}
                />
              ) : (
                <Text style={styles.stopHint}>{t("carpool.waitingForCar")}</Text>
              ))}
            {saveData && <Text style={styles.stopHint}>{t("carpool.saveDataHint")}</Text>}
            <Button mode="text" icon={saveData ? "map" : "signal-cellular-1"} onPress={toggleSaveData}>
              {saveData ? t("carpool.liveMode") : t("carpool.saveDataMode")}
            </Button>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t("carpool.journey")}</Text>
          {/* The driver's whole trip, and when it leaves its first stop if the
              rider boards further along (their own pickup time is just below). */}
          {trip?.stopSequence?.length > 1 && (
            <View style={styles.driverTrip}>
              <Icon name="route" size={18} color="#6B7280" />
              <Text style={styles.driverTripText}>
                {t("carpool.driverTrip", {
                  from: trip.stopSequence[0]?.name,
                  to: trip.stopSequence[trip.stopSequence.length - 1]?.name,
                })}
                {booking.boardIndex > 0 &&
                  `\n${t("carpool.departsFromStopAt", {
                    stop: trip.stopSequence[0]?.name,
                    time: formatTime(trip.departureAt),
                  })}`}
              </Text>
            </View>
          )}
          <View style={styles.stopRow}>
            <Icon name="place" size={20} color={colors.primary} />
            <View style={styles.stopText}>
              <Text style={[styles.stopName, { color: colors.text }]}>
                {trip?.stopSequence?.[booking.boardIndex]?.name}
              </Text>
              <Text style={styles.stopHint}>{t("carpool.pickupFrom", { time: pickupTime })}</Text>
            </View>
          </View>
          <View style={styles.connector} />
          <View style={styles.stopRow}>
            <Icon name="flag" size={20} color="#6B7280" />
            <View style={styles.stopText}>
              <Text style={[styles.stopName, { color: colors.text }]}>
                {trip?.stopSequence?.[booking.exitIndex]?.name}
              </Text>
              <Text style={styles.stopHint}>
                {/* Sized by this rider's own ride, from their pickup, not the trip's start. */}
                {t("carpool.arrivalWindow", { window: exitWindow })}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t("carpool.driverAndCar")}</Text>
          <View style={styles.row}>
            <Icon name="person" size={20} color="#6B7280" />
            <Text style={styles.rowText}>
              {driver?.firstName} {driver?.lastName}
            </Text>
          </View>
          {!!car && (
            <View style={styles.row}>
              <Icon name="directions-car" size={20} color="#6B7280" />
              <Text style={styles.rowText}>
                {carText} · {car.plate}
              </Text>
            </View>
          )}
          {/* The photo is how a rider picks the right car out of traffic at the stop. */}
          {!!carPhotoUrl && phase !== "done" && phase !== "cancelled" && (
            <Image
              source={{ uri: carPhotoUrl }}
              style={styles.carPhoto}
              resizeMode="cover"
              accessibilityLabel={`${carText} ${car?.plate || ""}`}
            />
          )}
          {(canCall || canShare) && (
            <View style={styles.contactRow}>
              {canCall && (
                <Button
                  mode="outlined"
                  icon="phone"
                  onPress={() => Linking.openURL(`tel:${driver.phoneNumber}`).catch(() => {})}
                  style={styles.contactButton}
                >
                  {t("carpool.callDriver")}
                </Button>
              )}
              {canShare && (
                <Button mode="outlined" icon="share-variant" onPress={onShare} style={styles.contactButton}>
                  {t("carpool.shareTrip")}
                </Button>
              )}
            </View>
          )}
        </View>

        <View style={[styles.priceBox, { backgroundColor: colors.primary + "12" }]}>
          <Text style={styles.priceLabel}>{t("carpool.youPayDriver")}</Text>
          <Text style={[styles.priceValue, { color: colors.primary }]}>
            {formatPrice(booking.priceGnf)}
          </Text>
          <Text style={styles.priceHint}>{t("carpool.payDriverCash")}</Text>
        </View>

        {/* A rider's own self-reported "I'm here", geolocated and timestamped —
            the same kind of evidence the driver's arrival tap already produces,
            now from both sides. On its own it proves nothing; alongside GPS
            traces it is one more thing a human can weigh if a dispute happens. */}
        {(canConfirmEarly || (trip?.status === "in_progress" && arrivalStopIndex != null)) && (
          <View style={styles.section}>
            {alreadyConfirmedArrival ? (
              <View style={styles.confirmedRow}>
                <Icon name="check-circle" size={18} color={colors.primary} />
                <Text style={[styles.confirmedText, { color: colors.primary }]}>
                  {arrivalStopIndex === booking.boardIndex
                    ? t("carpool.arrivalConfirmedBoard")
                    : t("carpool.arrivalConfirmedExit")}
                </Text>
              </View>
            ) : (
              <Button
                mode="outlined"
                icon="map-marker-check"
                loading={confirmingArrival}
                disabled={confirmingArrival}
                onPress={onConfirmArrival}
                style={[styles.actionBtn, { borderColor: colors.primary }]}
                contentStyle={styles.actionBtnContent}
              >
                {arrivalStopIndex === booking.boardIndex
                  ? t("carpool.confirmArrivalBoard")
                  : t("carpool.confirmArrivalExit")}
              </Button>
            )}
          </View>
        )}

        {/* Reachable for the whole time the rider is with the driver, not only
            once something has gone wrong. */}
        {phase === "done" && (
          <Button
            mode="contained"
            icon="star"
            onPress={() => navigation.navigate("CarpoolRate")}
            style={styles.cancelButton}
            contentStyle={styles.cancelContent}
          >
            {t("carpool.rateDriver")}
          </Button>
        )}

        {/* Shown once the rider is out at the stop or in the car, not while the
            trip is still only a booking. */}
        {SOS_PHASES.includes(phase) && (
          <View style={styles.sosRow}>
            <SosButton context="carpool" tripId={trip?._id} bookingId={booking?._id} />
            <Text style={styles.sosHint}>{t("carpool.sosHint")}</Text>
          </View>
        )}

        {/* Reporting stays available after the trip: most complaints only become
            apparent once it is over. */}
        <Button
          mode="text"
          icon="flag"
          onPress={() =>
            navigation.navigate("CarpoolReport", {
              tripId: trip?._id,
              bookingId: booking?._id,
            })
          }
          style={styles.reportButton}
        >
          {t("dispute.report")}
        </Button>

        {canCancel && (
          <Button
            mode="outlined"
            onPress={onCancel}
            style={styles.cancelButton}
            contentStyle={styles.cancelContent}
            icon="close"
            textColor={colors.error}
          >
            {t("carpool.cancelBooking")}
          </Button>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  body: { paddingHorizontal: 20 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  empty: { fontSize: 15, color: "#6B7280", textAlign: "center", lineHeight: 21 },
  statusBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
  },
  statusTextWrap: { flex: 1 },
  driverTrip: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 14 },
  driverTripText: { flex: 1, fontSize: 14, color: "#6B7280", lineHeight: 20 },
  etaText: { fontSize: 20, fontWeight: "700", marginBottom: 10 },
  statusText: { fontSize: 17, fontWeight: "600" },
  statusHint: { fontSize: 14, color: "#6B7280", marginTop: 4, lineHeight: 20 },
  carPhoto: { width: "100%", height: 160, borderRadius: 12, marginTop: 4, marginBottom: 8 },
  contactRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 4 },
  contactButton: { borderRadius: 10, flexGrow: 1 },
  delayBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#FEF3C7",
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  delayText: { flex: 1, fontSize: 14, color: "#92400E", lineHeight: 20 },
  section: { marginBottom: 20 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: "#9CA3AF",
    marginBottom: 10,
  },
  stopRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  stopText: { flex: 1 },
  stopName: { fontSize: 17, fontWeight: "600" },
  stopHint: { fontSize: 14, color: "#6B7280", marginTop: 2 },
  connector: { width: 2, height: 22, backgroundColor: "#E5E7EB", marginLeft: 9, marginVertical: 4 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 8 },
  rowText: { fontSize: 16, color: "#374151", flex: 1 },
  priceBox: { borderRadius: 12, padding: 16, alignItems: "center", marginBottom: 20 },
  priceLabel: { fontSize: 14, color: "#6B7280" },
  priceValue: { fontSize: 30, fontWeight: "700", marginVertical: 4 },
  priceHint: { fontSize: 13, color: "#6B7280" },
  actionBtn: { borderRadius: 10 },
  actionBtnContent: { height: 48 },
  confirmedRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  confirmedText: { fontSize: 14, fontWeight: "600" },
  sosRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 18 },
  sosHint: { flex: 1, fontSize: 13, color: "#6B7280", lineHeight: 18 },
  reportButton: { marginBottom: 8 },
  cancelButton: { borderRadius: 10 },
  cancelContent: { height: 50 },
});
