import React, { useEffect, useState } from "react";
import { View, ScrollView, ActivityIndicator, StyleSheet, TouchableOpacity } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "@expo/vector-icons/MaterialIcons";
import { StepHeader, Modal, ConductNote } from "_molecules";
import { Button } from "_atoms";
import { useCarpool } from "_hooks";
import { t } from "_utils/lang";

const formatPrice = (value) =>
  `${String(Math.floor(value || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ".")} GNF`;

const formatTime = (iso) => {
  const d = new Date(iso);
  return `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
};

const isoDate = (d) => d.toISOString().slice(0, 10);
const TODAY = isoDate(new Date());
// Trips are published a week ahead, so riders can plan any day in that window.
const BOOKABLE_DAYS = Array.from({ length: 7 }, (_, i) =>
  isoDate(new Date(Date.now() + i * 24 * 60 * 60 * 1000))
);

// Every fact a rider needs to choose is on the card — time, price, seats left,
// driver, women-only. §11 asks for status to be shown rather than inferred, so
// nothing here requires tapping through to discover.
const TripCard = ({ trip, onBook, colors }) => (
  <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}>
    <View style={styles.cardTop}>
      <View>
        <Text style={[styles.time, { color: colors.text }]}>
          {formatTime(trip.departureAt)}
        </Text>
        <Text style={[styles.timeHint, { color: colors.placeholder }]}>
          {trip.tripOrigin?.name
            ? t("carpool.departsFromStop", { stop: trip.tripOrigin.name })
            : t("carpool.departureTime")}
        </Text>
      </View>
      <Text style={[styles.price, { color: colors.primary }]}>
        {formatPrice(trip.priceGnf)}
      </Text>
    </View>

    {/* The driver's whole trip, so the rider can judge whether it fits. */}
    {!!trip.tripOrigin?.name && !!trip.tripDestination?.name && (
      <View style={styles.row}>
        <Icon name="route" size={18} color={colors.placeholder} />
        <Text style={[styles.rowText, { color: colors.text }]} numberOfLines={2}>
          {t("carpool.driverTrip", { from: trip.tripOrigin.name, to: trip.tripDestination.name })}
        </Text>
      </View>
    )}

    {/* The earliest time the car can reach this rider's stop: "from", never "at",
        so a car that comes early never makes the app wrong. Same as departure
        when the rider boards at the first stop, so not repeated then. */}
    {!!trip.pickupFrom && trip.boardIndex > 0 && (
      <View style={styles.row}>
        <Icon name="place" size={18} color={colors.primary} />
        <Text style={[styles.rowText, { color: colors.text, fontWeight: "600" }]} numberOfLines={2}>
          {t("carpool.atYourStopFrom", { stop: trip.boardStop?.name, time: formatTime(trip.pickupFrom) })}
        </Text>
      </View>
    )}

    <View style={styles.row}>
      <Icon name="person" size={18} color={colors.placeholder} />
      <Text style={[styles.rowText, { color: colors.text }]}>
        {trip.driver?.firstName} {trip.driver?.lastName}
      </Text>
      {trip.reliability?.score != null ? (
        <View style={styles.badge}>
          <Icon name="star" size={13} color="#B45309" />
          <Text style={styles.badgeText}>{trip.reliability.score}%</Text>
        </View>
      ) : (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{t("carpool.newDriver")}</Text>
        </View>
      )}
    </View>

    <View style={styles.row}>
      <Icon name="event-seat" size={18} color={colors.placeholder} />
      <Text style={[styles.rowText, { color: colors.text }]}>
        {t("carpool.seatsLeft", { count: trip.seatsLeft })}
      </Text>
      {trip.womenOnly && (
        <View style={[styles.badge, { backgroundColor: "#FCE7F3" }]}>
          <Icon name="female" size={13} color="#9D174D" />
          <Text style={[styles.badgeText, { color: "#9D174D" }]}>
            {t("carpool.womenOnlyShort")}
          </Text>
        </View>
      )}
    </View>

    <Button
      mode="contained"
      onPress={() => onBook(trip)}
      style={styles.bookButton}
      contentStyle={styles.bookButtonContent}
      icon="check"
    >
      {t("carpool.bookThisTrip")}
    </Button>
  </View>
);

export default function TripList({ navigation }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const carpool = useCarpool();

  const [confirming, setConfirming] = useState(null);
  const [savedUsual, setSavedUsual] = useState(false);
  const serviceDate = carpool.search.serviceDate || TODAY;

  const onSaveUsual = async () => {
    const route = await carpool.actions.saveUsualRoute();
    if (route) setSavedUsual(true);
  };

  useEffect(() => {
    carpool.actions.searchTrips();
  }, [carpool.search.womenOnly, carpool.search.serviceDate]);

  const onConfirm = async () => {
    const trip = confirming;
    setConfirming(null);
    const booking = await carpool.actions.bookTrip(trip);
    if (booking) navigation.navigate("CarpoolBooked", { bookingId: booking._id });
  };

  const { boardStop, exitStop } = carpool.search;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <StepHeader
        step={4}
        totalSteps={4}
        title={t("carpool.tripsTitle")}
        subtitle={`${boardStop?.name} → ${exitStop?.name}`}
        onBack={() => navigation.goBack()}
      />

      {/* A week of named days rather than a calendar. Today and tomorrow are
          spelled out; later days show the weekday and date, which is how people
          already talk about a commute. */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dateRow}
      >
        {BOOKABLE_DAYS.map((value, index) => {
          const active = serviceDate === value;
          const dayOfWeek = new Date(`${value}T00:00:00Z`).getUTCDay();
          const label =
            index === 0
              ? t("carpool.today")
              : index === 1
              ? t("carpool.tomorrow")
              : t(`carpool.weekday_${dayOfWeek}`);
          return (
            <TouchableOpacity
              key={value}
              onPress={() => carpool.actions.setCarpoolSearch({ serviceDate: value })}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={[
                styles.dateChip,
                {
                  backgroundColor: active ? colors.primary : "transparent",
                  borderColor: active ? colors.primary : colors.border,
                },
              ]}
            >
              <Text style={[styles.dateChipText, { color: active ? "#fff" : colors.text }]}>
                {label} {value.slice(8, 10)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <TouchableOpacity
        onPress={onSaveUsual}
        disabled={savedUsual}
        accessibilityRole="button"
        style={styles.usualRow}
      >
        <Icon
          name={savedUsual ? "bookmark" : "bookmark-border"}
          size={18}
          color={colors.primary}
        />
        <Text style={[styles.usualText, { color: colors.primary }]}>
          {savedUsual ? t("carpool.usualRouteSaved") : t("carpool.saveUsualRoute")}
        </Text>
      </TouchableOpacity>

      {/* Two labelled buttons rather than a switch — the one control in this
          flow whose meaning would otherwise depend on knowing toggle
          conventions (does "on" mean women-only, or does it mean the filter is
          active?). A label you tap says exactly what it does. */}
      <View style={styles.womenOnlyRow}>
        {[
          { value: false, label: t("carpool.allDrivers") },
          { value: true, label: t("carpool.womenOnlyFilter") },
        ].map(({ value, label }) => {
          const active = carpool.search.womenOnly === value;
          return (
            <TouchableOpacity
              key={String(value)}
              onPress={() => carpool.actions.setCarpoolSearch({ womenOnly: value })}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={[
                styles.womenOnlyChip,
                {
                  backgroundColor: active ? colors.primary + "18" : "transparent",
                  borderColor: active ? colors.primary : colors.border,
                },
              ]}
            >
              {value && (
                <Icon
                  name="female"
                  size={16}
                  color={active ? colors.primary : colors.placeholder}
                />
              )}
              <Text
                style={[
                  styles.womenOnlyChipText,
                  { color: active ? colors.primary : colors.text },
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {carpool.isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : carpool.trips.length === 0 ? (
        <View style={styles.center}>
          <Icon name="search-off" size={48} color={colors.placeholder} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            {t("carpool.noTripsTitle")}
          </Text>
          <Text style={[styles.empty, { color: colors.placeholder }]}>
            {t("carpool.noTripsHint")}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate("CarpoolStops")}>
            <Text style={[styles.link, { color: colors.primary }]}>
              {t("carpool.changeStops")}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[
            styles.list,
            { paddingBottom: Math.max(insets.bottom + 16, 28) },
          ]}
        >
          {carpool.trips.map((trip) => (
            <TripCard
              key={trip.tripId}
              trip={trip}
              colors={colors}
              onBook={setConfirming}
            />
          ))}
        </ScrollView>
      )}

      {/* Booking is money changing hands in cash, so it always confirms first.
          The shared Modal supplies the title and the close/cancel button. */}
      <Modal
        visible={!!confirming}
        title={t("carpool.confirmBookingTitle")}
        onDismiss={() => setConfirming(null)}
        onClose={() => setConfirming(null)}
      >
        <View style={styles.modal}>
          <Text style={[styles.modalBody, { color: colors.text }]}>
            {t("carpool.confirmBookingBody", {
              board: boardStop?.name,
              exit: exitStop?.name,
              time: confirming ? formatTime(confirming.departureAt) : "",
              price: formatPrice(confirming?.priceGnf),
            })}
          </Text>
          <Text style={[styles.modalCash, { color: colors.placeholder }]}>
            {t("carpool.payDriverCash")}
          </Text>

          <ConductNote text={t("carpool.conductRider")} />

          <Button
            mode="contained"
            onPress={onConfirm}
            style={styles.modalButton}
            contentStyle={styles.bookButtonContent}
            icon="check"
          >
            {t("carpool.confirmBooking")}
          </Button>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  list: { paddingHorizontal: 20, paddingTop: 4 },
  usualRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  usualText: { fontSize: 14, fontWeight: "600" },
  dateRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  dateChip: {
    minWidth: 92,
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  dateChipText: { fontSize: 15, fontWeight: "600" },
  womenOnlyRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  womenOnlyChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
  },
  womenOnlyChipText: { fontSize: 13, fontWeight: "600" },
  card: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  time: { fontSize: 26, fontWeight: "700" },
  timeHint: { fontSize: 12 },
  price: { fontSize: 20, fontWeight: "700" },
  row: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 10 },
  rowText: { fontSize: 15, flex: 1 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  badgeText: { fontSize: 12, fontWeight: "600", color: "#B45309" },
  bookButton: { marginTop: 16, borderRadius: 10 },
  bookButtonContent: { height: 50 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 10 },
  emptyTitle: { fontSize: 18, fontWeight: "600", marginTop: 8 },
  empty: { fontSize: 15, textAlign: "center", lineHeight: 21 },
  link: { fontSize: 16, fontWeight: "600", marginTop: 8 },
  modal: { padding: 8 },
  modalTitle: { fontSize: 20, fontWeight: "700", marginBottom: 10 },
  modalBody: { fontSize: 16, lineHeight: 23 },
  modalCash: { fontSize: 15, marginTop: 12, marginBottom: 20 },
  modalButton: { borderRadius: 10, marginBottom: 6 },
});
