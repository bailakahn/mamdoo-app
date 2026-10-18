import React, { useCallback, useState } from "react";
import { View, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import Icon from "@expo/vector-icons/MaterialIcons";
import { Button } from "_atoms";
import { useCarpool, useUser } from "_hooks";
import { t } from "_utils/lang";

const formatTime = (iso) => {
  const d = new Date(iso);
  return `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
};

const formatDay = (iso) => {
  const d = new Date(iso);
  const today = new Date();
  const isToday = d.toISOString().slice(0, 10) === today.toISOString().slice(0, 10);
  return isToday ? t("carpool.today") : d.toISOString().slice(0, 10);
};

// The covoiturage home. Deliberately one decision: if the rider has a seat booked
// it is the first thing they see, otherwise there is a single obvious way forward.
export default function CarpoolHome({ navigation }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const carpool = useCarpool();
  const user = useUser();

  const [loaded, setLoaded] = useState(false);
  const [usualRoute, setUsualRoute] = useState(null);

  useFocusEffect(
    useCallback(() => {
      carpool.actions.loadBookings("upcoming").then(() => setLoaded(true));
      carpool.actions.loadCorridors();
      carpool.actions.loadSavedRoute().then(setUsualRoute);
    }, [])
  );

  const startSearch = () => {
    carpool.actions.resetCarpoolSearch();
    navigation.navigate("CarpoolCorridor");
  };

  // One tap from the home screen to the trip list for the saved commute.
  const bookUsual = () => {
    carpool.actions.resetCarpoolSearch();
    carpool.actions.applySavedRoute(usualRoute);
    navigation.navigate("CarpoolTrips");
  };

  const upcoming = carpool.bookings || [];

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.body,
          { paddingTop: insets.top + 12, paddingBottom: Math.max(insets.bottom + 24, 32) },
        ]}
      >
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.hello, { color: colors.text }]}>
              {t("carpool.homeTitle")}
            </Text>
            <Text style={styles.helloHint}>{t("carpool.homeSubtitle")}</Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate("Home")}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityRole="button"
            accessibilityLabel={t("carpool.backToRides")}
          >
            <Icon name="close" size={26} color={colors.text} />
          </TouchableOpacity>
        </View>

        {usualRoute && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{t("carpool.usualRoute")}</Text>
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={bookUsual}
              style={[styles.bookingCard, { backgroundColor: colors.background }]}
            >
              <Text style={styles.bookingRoute} numberOfLines={2}>
                {usualRoute.boardStopId?.name} → {usualRoute.exitStopId?.name}
              </Text>
              <View style={styles.bookingFooter}>
                <Icon name="repeat" size={16} color="#6B7280" />
                <Text style={styles.bookingDriver}>{t("carpool.usualRouteBook")}</Text>
                <Icon name="chevron-right" size={20} color="#9CA3AF" />
              </View>
            </TouchableOpacity>
          </View>
        )}

        {loaded && upcoming.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{t("carpool.yourSeats")}</Text>
            {upcoming.map((booking) => (
              <TouchableOpacity
                key={booking._id}
                activeOpacity={0.75}
                onPress={() =>
                  navigation.navigate("CarpoolBooked", { bookingId: booking._id })
                }
                style={[styles.bookingCard, { backgroundColor: colors.background }]}
              >
                <View style={styles.bookingTop}>
                  <Text style={[styles.bookingTime, { color: colors.text }]}>
                    {formatTime(booking.trip?.departureAt)}
                  </Text>
                  <Text style={styles.bookingDay}>{formatDay(booking.trip?.departureAt)}</Text>
                </View>
                <Text style={styles.bookingRoute} numberOfLines={2}>
                  {booking.trip?.stopSequence?.[booking.boardIndex]?.name} →{" "}
                  {booking.trip?.stopSequence?.[booking.exitIndex]?.name}
                </Text>
                {booking.status === "cancelled_admin" && (
                  <Text style={[styles.bookingDriver, { color: colors.error }]}>
                    {t("carpool.bookingCancelledAdmin")}
                  </Text>
                )}
                <View style={styles.bookingFooter}>
                  <Icon name="person" size={16} color="#6B7280" />
                  <Text style={styles.bookingDriver}>
                    {booking.trip?.driverId?.firstName} {booking.trip?.driverId?.lastName}
                  </Text>
                  <Icon name="chevron-right" size={20} color="#9CA3AF" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate("CarpoolRate")}
          style={styles.rateRow}
        >
          <Icon name="star-border" size={22} color="#B45309" />
          <Text style={styles.rateText}>{t("rate.prompt")}</Text>
          <Icon name="chevron-right" size={20} color="#B45309" />
        </TouchableOpacity>

        <View style={styles.ctaBox}>
          <Icon name="groups" size={40} color={colors.primary} />
          <Text style={[styles.ctaTitle, { color: colors.text }]}>
            {upcoming.length ? t("carpool.bookAnother") : t("carpool.ctaTitle")}
          </Text>
          <Text style={styles.ctaBody}>{t("carpool.ctaBody")}</Text>
          <Button
            mode="contained"
            onPress={startSearch}
            style={styles.ctaButton}
            contentStyle={styles.ctaButtonContent}
            icon="magnify"
          >
            {t("carpool.findASeat")}
          </Button>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate("CarpoolOnboarding", { replay: true })}
          accessibilityRole="button"
          style={styles.infoRow}
        >
          <Icon name="help-outline" size={20} color={colors.primary} />
          <Text style={[styles.infoText, { color: colors.primary }]}>{t("carpool.howItWorks")}</Text>
        </TouchableOpacity>

        <View style={styles.infoRow}>
          <Icon name="payments" size={20} color="#6B7280" />
          <Text style={styles.infoText}>{t("carpool.cashOnly")}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  body: { paddingHorizontal: 20 },
  headerRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 24 },
  hello: { fontSize: 26, fontWeight: "700" },
  helloHint: { fontSize: 15, color: "#6B7280", marginTop: 4 },
  section: { marginBottom: 24 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: "#9CA3AF",
    marginBottom: 10,
  },
  bookingCard: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  bookingTop: { flexDirection: "row", alignItems: "baseline", gap: 10 },
  bookingTime: { fontSize: 22, fontWeight: "700" },
  bookingDay: { fontSize: 14, color: "#6B7280" },
  bookingRoute: { fontSize: 15, color: "#374151", marginTop: 6, lineHeight: 21 },
  bookingFooter: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 12 },
  bookingDriver: { flex: 1, fontSize: 14, color: "#6B7280" },
  rateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FEF3C7",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  rateText: { flex: 1, fontSize: 14, color: "#92400E" },
  ctaBox: {
    alignItems: "center",
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
  },
  ctaTitle: { fontSize: 19, fontWeight: "700", marginTop: 12, textAlign: "center" },
  ctaBody: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 21,
  },
  ctaButton: { borderRadius: 10, marginTop: 20, alignSelf: "stretch" },
  ctaButtonContent: { height: 52 },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 20,
    paddingHorizontal: 4,
  },
  infoText: { flex: 1, fontSize: 14, color: "#6B7280", lineHeight: 20 },
});
