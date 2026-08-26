import React, { useEffect, useState, useCallback } from "react";
import { View, ScrollView, ActivityIndicator, StyleSheet, Alert } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import Icon from "@expo/vector-icons/MaterialIcons";
import { StepHeader } from "_molecules";
import { SosButton } from "_organisms";
import { Button } from "_atoms";
import { useCarpool } from "_hooks";
import { t } from "_utils/lang";

const formatPrice = (value) =>
  `${String(Math.floor(value || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ".")} GNF`;

const formatTime = (iso) => {
  const d = new Date(iso);
  return `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
};

// §6 requires per-stop times to be shown as WINDOWS, never exact. Conakry traffic
// is volatile and an exact promise the driver cannot keep destroys trust in both
// directions. Departure from the origin is the only hard time in the product.
const arrivalWindow = (iso, spreadMinutes = 15) => {
  const base = new Date(iso);
  const from = new Date(base.getTime() - 0);
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

const STATUS_COPY = {
  confirmed: { icon: "schedule", key: "carpool.statusConfirmed" },
  in_progress: { icon: "directions-car", key: "carpool.statusInProgress" },
  completed: { icon: "check-circle", key: "carpool.statusCompleted" },
  cancelled_by_driver: { icon: "cancel", key: "carpool.statusCancelledDriver" },
};

export default function BookedTrip({ navigation, route }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const carpool = useCarpool();

  const { bookingId } = route.params || {};
  const [booking, setBooking] = useState(null);
  const [trip, setTrip] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const list = await carpool.actions.loadBookings("upcoming");
    const found = list.find((b) => String(b._id) === String(bookingId)) || list[0];
    setBooking(found || null);

    if (found?.trip?._id) {
      const [tripResult, eventsResult] = await Promise.all([
        carpool.actions.getTrip(found.trip._id),
        carpool.actions.getTripEvents(found.trip._id),
      ]);
      setTrip(tripResult?.trip || found.trip);
      setEvents(eventsResult?.events || []);
    }
    setLoading(false);
  }, [bookingId]);

  // Refresh on focus so the rider sees current state after backgrounding the app,
  // without needing to know to pull down.
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

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

  const status = STATUS_COPY[trip?.status] || STATUS_COPY.confirmed;
  const explanation = delayExplanation(events);
  const canCancel = ["confirmed"].includes(trip?.status);

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
        {/* Status first and in words — §11 asks for state to be visible, not inferred. */}
        <View style={[styles.statusBox, { borderColor: colors.primary }]}>
          <Icon name={status.icon} size={26} color={colors.primary} />
          <Text style={[styles.statusText, { color: colors.text }]}>{t(status.key)}</Text>
        </View>

        {!!explanation && (
          <View style={styles.delayBox}>
            <Icon name="info-outline" size={20} color="#B45309" />
            <Text style={styles.delayText}>{explanation}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t("carpool.journey")}</Text>
          <View style={styles.stopRow}>
            <Icon name="place" size={20} color={colors.primary} />
            <View style={styles.stopText}>
              <Text style={[styles.stopName, { color: colors.text }]}>
                {trip?.stopSequence?.[booking.boardIndex]?.name}
              </Text>
              <Text style={styles.stopHint}>
                {t("carpool.departsAt", { time: formatTime(trip?.departureAt) })}
              </Text>
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
                {t("carpool.arrivalWindow", { window: arrivalWindow(trip?.departureAt, 30) })}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t("carpool.driverAndCar")}</Text>
          <View style={styles.row}>
            <Icon name="person" size={20} color="#6B7280" />
            <Text style={styles.rowText}>
              {booking.trip?.driverId?.firstName} {booking.trip?.driverId?.lastName}
            </Text>
          </View>
          {!!booking.trip?.carId && (
            <View style={styles.row}>
              <Icon name="directions-car" size={20} color="#6B7280" />
              <Text style={styles.rowText}>
                {booking.trip.carId.color} {booking.trip.carId.make} {booking.trip.carId.model} ·{" "}
                {booking.trip.carId.plate}
              </Text>
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

        {/* Reachable for the whole time the rider is with the driver, not only
            once something has gone wrong. */}
        {["confirmed", "in_progress"].includes(trip?.status) && (
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
  statusText: { fontSize: 17, fontWeight: "600", flex: 1 },
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
  sosRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 18 },
  sosHint: { flex: 1, fontSize: 13, color: "#6B7280", lineHeight: 18 },
  reportButton: { marginBottom: 8 },
  cancelButton: { borderRadius: 10 },
  cancelContent: { height: 50 },
});
