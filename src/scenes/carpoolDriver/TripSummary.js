import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "@expo/vector-icons/MaterialIcons";
import { Button } from "_atoms";
import { t2 } from "_utils/lang";

const formatPrice = (value) =>
  `${String(Math.floor(value || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ".")} GNF`;

const Line = ({ label, value, colors, emphasis }) => (
  <View style={styles.line}>
    <Text style={[styles.lineLabel, { color: colors.placeholder }]}>{label}</Text>
    <Text
      style={[
        styles.lineValue,
        { color: colors.text },
        emphasis && { fontWeight: "700" },
      ]}
    >
      {value}
    </Text>
  </View>
);

// Shown right after a trip closes. States what the driver now owes from that trip
// specifically, while the trip is still fresh in their mind — §11 asks for status
// in plain terms rather than something they must go and look up later.
export default function CarpoolTripSummary({ navigation, route }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const summary = route.params?.summary || {};
  const commission = summary.commission || {};

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.body,
          { paddingTop: insets.top + 40, paddingBottom: Math.max(insets.bottom + 24, 32) },
        ]}
      >
        <View style={styles.iconWrap}>
          <Icon name="check-circle" size={64} color="#1F6F43" />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>
          {t2("carpoolDriver.summaryTitle")}
        </Text>

        <View style={[styles.card, { borderColor: colors.border }]}>
          <Line
            colors={colors}
            label={t2("carpoolDriver.summaryCarried")}
            value={String(summary.ridersCarried ?? 0)}
          />
          {summary.noShows > 0 && (
            <Line
              colors={colors}
              label={t2("carpoolDriver.summaryNoShows")}
              value={String(summary.noShows)}
            />
          )}
          <Line
            colors={colors}
            label={t2("carpoolDriver.summaryCash")}
            value={formatPrice(summary.cashCollectedGnf)}
          />
          <Line
            colors={colors}
            emphasis
            label={t2("carpoolDriver.summaryCommission")}
            value={formatPrice(commission.totalGnf)}
          />
          <Line
            colors={colors}
            emphasis
            label={t2("carpoolDriver.summaryBalance")}
            value={formatPrice(commission.balanceGnf)}
          />
        </View>

        {/* Delay the driver is NOT answerable for is stated explicitly, so a
            no-show at a stop never quietly reads as their own lateness. */}
        {summary.driverAttributableDelayMinutes === 0 && summary.noShows > 0 && (
          <View style={styles.noteBox}>
            <Icon name="verified" size={20} color="#1F6F43" />
            <Text style={styles.noteText}>{t2("carpoolDriver.summaryNotYourFault")}</Text>
          </View>
        )}

        {commission.publicationBlocked && (
          <View style={styles.warnBox}>
            <Icon name="warning" size={20} color="#B3261E" />
            <Text style={styles.warnText}>{t2("carpoolDriver.blockedHint")}</Text>
          </View>
        )}

        {/* Offered while the trip is still fresh, but never forced — a driver
            who wants to get on with their day just taps Done. */}
        {summary.ridersCarried > 0 && (
          <Button
            mode="contained"
            icon="star"
            onPress={() => navigation.navigate("CarpoolRateRiders")}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            {t2("carpoolDriver.ratePassengers")}
          </Button>
        )}

        <Button
          mode={summary.ridersCarried > 0 ? "text" : "contained"}
          onPress={() => navigation.navigate("HomeTab", { screen: "CarpoolDriverHome" })}
          style={styles.button}
          contentStyle={styles.buttonContent}
        >
          {t2("carpoolDriver.done")}
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  body: { paddingHorizontal: 20 },
  iconWrap: { alignItems: "center", marginBottom: 16 },
  title: { fontSize: 24, fontWeight: "700", textAlign: "center", marginBottom: 24 },
  card: { borderWidth: 1, borderRadius: 14, padding: 18 },
  line: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10 },
  lineLabel: { fontSize: 15 },
  lineValue: { fontSize: 16 },
  noteBox: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: "#E3F1E8",
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
  },
  noteText: { flex: 1, fontSize: 14, color: "#1F6F43", lineHeight: 20 },
  warnBox: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: "#FBE9E7",
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
  },
  warnText: { flex: 1, fontSize: 14, color: "#B3261E", lineHeight: 20 },
  button: { borderRadius: 12, marginTop: 28 },
  buttonContent: { height: 56 },
});
