import React, { useEffect, useState } from "react";
import { View, ScrollView, ActivityIndicator, StyleSheet, TouchableOpacity } from "react-native";
import { Text, useTheme, Switch } from "react-native-paper";
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

// Every fact a rider needs to choose is on the card — time, price, seats left,
// driver, women-only. §11 asks for status to be shown rather than inferred, so
// nothing here requires tapping through to discover.
const TripCard = ({ trip, onBook, colors }) => (
  <View style={[styles.card, { backgroundColor: colors.background }]}>
    <View style={styles.cardTop}>
      <View>
        <Text style={[styles.time, { color: colors.text }]}>
          {formatTime(trip.departureAt)}
        </Text>
        <Text style={styles.timeHint}>{t("carpool.departureTime")}</Text>
      </View>
      <Text style={[styles.price, { color: colors.primary }]}>
        {formatPrice(trip.priceGnf)}
      </Text>
    </View>

    <View style={styles.row}>
      <Icon name="person" size={18} color="#6B7280" />
      <Text style={styles.rowText}>
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
      <Icon name="event-seat" size={18} color="#6B7280" />
      <Text style={styles.rowText}>
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

  useEffect(() => {
    carpool.actions.searchTrips();
  }, [carpool.search.womenOnly]);

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

      <View style={styles.filterRow}>
        <Icon name="female" size={20} color="#6B7280" />
        <Text style={[styles.filterLabel, { color: colors.text }]}>
          {t("carpool.womenOnlyFilter")}
        </Text>
        <Switch
          value={carpool.search.womenOnly}
          onValueChange={(v) => carpool.actions.setCarpoolSearch({ womenOnly: v })}
        />
      </View>

      {carpool.isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : carpool.trips.length === 0 ? (
        <View style={styles.center}>
          <Icon name="search-off" size={48} color="#D1D5DB" />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            {t("carpool.noTripsTitle")}
          </Text>
          <Text style={styles.empty}>{t("carpool.noTripsHint")}</Text>
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
          <Text style={styles.modalBody}>
            {t("carpool.confirmBookingBody", {
              board: boardStop?.name,
              exit: exitStop?.name,
              time: confirming ? formatTime(confirming.departureAt) : "",
              price: formatPrice(confirming?.priceGnf),
            })}
          </Text>
          <Text style={styles.modalCash}>{t("carpool.payDriverCash")}</Text>

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
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  filterLabel: { flex: 1, fontSize: 15 },
  card: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  time: { fontSize: 26, fontWeight: "700" },
  timeHint: { fontSize: 12, color: "#6B7280" },
  price: { fontSize: 20, fontWeight: "700" },
  row: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 10 },
  rowText: { fontSize: 15, color: "#374151", flex: 1 },
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
  empty: { fontSize: 15, color: "#6B7280", textAlign: "center", lineHeight: 21 },
  link: { fontSize: 16, fontWeight: "600", marginTop: 8 },
  modal: { padding: 8 },
  modalTitle: { fontSize: 20, fontWeight: "700", marginBottom: 10 },
  modalBody: { fontSize: 16, color: "#374151", lineHeight: 23 },
  modalCash: { fontSize: 15, color: "#6B7280", marginTop: 12, marginBottom: 20 },
  modalButton: { borderRadius: 10, marginBottom: 6 },
});
