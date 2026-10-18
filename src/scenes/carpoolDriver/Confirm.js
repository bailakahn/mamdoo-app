import React, { useState, useCallback } from "react";
import { View, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import Icon from "@expo/vector-icons/MaterialIcons";
import { Button } from "_atoms";
import { StepHeader } from "_molecules";
import { useCarpool } from "_hooks/carpoolDriver";
import { t2 } from "_utils/lang";

// Must match the carpoolDriverFreeSkipHours config (provider).
const FREE_CANCEL_HOURS = 6;
const MAX_SEATS = 4;

const formatTime = (iso) => {
  const d = new Date(iso);
  return `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
};

// Trips are already published, so there is nothing to confirm. This screen is the
// evening heads-up: tomorrow's trips are running unless the driver changes them.
// Seat changes can go down to the number already booked, never below it.
export default function CarpoolConfirm({ navigation }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const carpool = useCarpool();

  const [busyId, setBusyId] = useState(null);
  const [adjusting, setAdjusting] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    await carpool.actions.loadTrips("pending");
    setLoading(false);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onConfirm = async (trip, seats) => {
    setBusyId(trip._id);
    const result = await carpool.actions.confirmTrip(trip._id, seats);
    setBusyId(null);
    setAdjusting(null);
    if (result) await load();
  };

  // Cancelling a published trip strands any booked riders, so it always asks first.
  // Inside the free window the cost is shown, not discovered afterwards.
  const onCancel = (trip) => {
    const hoursToDeparture = (new Date(trip.departureAt) - Date.now()) / 3600000;
    const late = hoursToDeparture < FREE_CANCEL_HOURS;
    Alert.alert(
      t2("carpoolDriver.cancelTitle"),
      [
        t2("carpoolDriver.cancelFreeHint"),
        late && t2("carpoolDriver.cancelLateWarning", { hours: FREE_CANCEL_HOURS }),
      ]
        .filter(Boolean)
        .join("\n\n"),
      [
        { text: t2("carpoolDriver.cancelKeep"), style: "cancel" },
        {
          text: t2("carpoolDriver.cancelConfirm"),
          style: "destructive",
          onPress: () => doCancel(trip),
        },
      ]
    );
  };

  const doCancel = async (trip) => {
    setBusyId(trip._id);
    const result = await carpool.actions.cancelTrip(trip._id, "driver_cancelled_heads_up");
    setBusyId(null);
    if (result) await load();
  };

  if (loading) {
    return (
      <View style={[styles.screen, styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <StepHeader
        title={t2("carpoolDriver.confirmTitle")}
        subtitle={t2("carpoolDriver.confirmSubtitle")}
        onBack={() => navigation.navigate("HomeTab", { screen: "CarpoolDriverHome" })}
      />

      {carpool.trips.length === 0 ? (
        <View style={styles.center}>
          <Icon name="check-circle-outline" size={48} color="#1F6F43" />
          <Text style={[styles.doneTitle, { color: colors.text }]}>
            {t2("carpoolDriver.allConfirmed")}
          </Text>
          <Text style={[styles.doneHint, { color: colors.placeholder }]}>
            {t2("carpoolDriver.allConfirmedHint")}
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.body, { paddingBottom: Math.max(insets.bottom + 24, 32) }]}
        >
          {carpool.trips.map((trip) => (
            <View key={trip._id} style={[styles.card, { borderColor: colors.border }]}>
              <View style={styles.cardTop}>
                <Text style={[styles.time, { color: colors.text }]}>
                  {formatTime(trip.departureAt)}
                </Text>
                <View style={[styles.corridorDot, { backgroundColor: colors.primary }]} />
                <Text style={[styles.corridor, { color: colors.placeholder }]}>
                  {trip.corridorId?.name}
                </Text>
              </View>

              <Text style={[styles.route, { color: colors.text }]} numberOfLines={2}>
                {trip.stopSequence?.[0]?.name} →{" "}
                {trip.stopSequence?.[trip.stopSequence.length - 1]?.name}
              </Text>

              {(() => {
                // seatsLeft = offered minus the busiest hop, so booked = offered - left.
                const booked = (trip.seatsOffered ?? 0) - (trip.seatsLeft ?? 0);
                return (
                  <Text style={[styles.adjustLabel, { color: colors.placeholder }]}>
                    {t2("carpoolDriver.seatsOpen", { count: trip.seatsLeft ?? 0 })} ·{" "}
                    {t2("carpoolDriver.seatsBooked", { count: booked })}
                  </Text>
                );
              })()}

              {adjusting === trip._id ? (
                <>
                  <Text style={styles.adjustLabel}>{t2("carpoolDriver.howManyTomorrow")}</Text>
                  <View style={styles.seatRow}>
                    {[1, 2, 3, 4]
                      .filter((n) => n <= MAX_SEATS)
                      .map((n) => {
                        const bookedSeats = (trip.seatsOffered ?? 0) - (trip.seatsLeft ?? 0);
                        const blocked = n < bookedSeats;
                        return (
                          <TouchableOpacity
                            key={n}
                            disabled={blocked || !!busyId}
                            onPress={() => onConfirm(trip, n)}
                            accessibilityRole="button"
                            accessibilityState={{ disabled: blocked }}
                            accessibilityLabel={t2("carpoolDriver.seatsCount", { count: n })}
                            style={[
                              styles.seatBox,
                              { borderColor: colors.primary, opacity: blocked ? 0.3 : 1 },
                            ]}
                          >
                            <Text style={[styles.seatNumber, { color: colors.text }]}>{n}</Text>
                          </TouchableOpacity>
                        );
                      })}
                  </View>
                  {(trip.seatsOffered ?? 0) - (trip.seatsLeft ?? 0) > 0 && (
                    <Text style={[styles.adjustLabel, { color: colors.placeholder }]}>
                      {t2("carpoolDriver.seatsBelowBooked", {
                        count: (trip.seatsOffered ?? 0) - (trip.seatsLeft ?? 0),
                      })}
                    </Text>
                  )}
                </>
              ) : (
                <View style={styles.secondaryRow}>
                  <TouchableOpacity onPress={() => setAdjusting(trip._id)}>
                    <Text style={[styles.link, { color: colors.primary }]}>
                      {t2("carpoolDriver.changeSeats")}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => onCancel(trip)} disabled={!!busyId}>
                    <Text style={[styles.link, { color: "#B3261E" }]}>
                      {t2("carpoolDriver.notTomorrow")}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 8 },
  doneTitle: { fontSize: 20, fontWeight: "700", marginTop: 8 },
  doneHint: { fontSize: 15, textAlign: "center", lineHeight: 21 },
  body: { paddingHorizontal: 20 },
  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
  },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 8 },
  time: { fontSize: 28, fontWeight: "700" },
  corridorDot: { width: 10, height: 10, borderRadius: 5, marginLeft: 4 },
  corridor: { fontSize: 14 },
  route: { fontSize: 15, marginTop: 8, lineHeight: 21 },
  confirmButton: { borderRadius: 12, marginTop: 16 },
  confirmContent: { height: 56 },
  secondaryRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 14 },
  link: { fontSize: 15, fontWeight: "600" },
  adjustLabel: { fontSize: 16, fontWeight: "600", marginTop: 16, marginBottom: 12 },
  seatRow: { flexDirection: "row", gap: 10 },
  seatBox: {
    flex: 1,
    height: 60,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  seatNumber: { fontSize: 22, fontWeight: "700" },
});
