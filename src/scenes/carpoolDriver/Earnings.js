import React, { useState, useCallback } from "react";
import { View, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import Icon from "@expo/vector-icons/MaterialIcons";
import { StepHeader } from "_molecules";
import { useCarpool } from "_hooks/carpoolDriver";
import { t2 } from "_utils/lang";

const formatPrice = (value) =>
  `${String(Math.floor(Math.abs(value) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ".")} GNF`;

const formatDate = (iso) => new Date(iso).toISOString().slice(0, 10);

const ENTRY_COPY = {
  accrual: { icon: "arrow-upward", color: "#B3261E", key: "carpoolDriver.entryCommission" },
  settlement: { icon: "arrow-downward", color: "#1F6F43", key: "carpoolDriver.entryPayment" },
  adjustment: { icon: "tune", color: "#6B7280", key: "carpoolDriver.entryAdjustment" },
};

// What the driver owes Mamdoo and why.
//
// Riders pay cash directly, so this is a debt rather than a payout — the copy says
// so plainly instead of calling it "earnings", which would be actively misleading.
export default function CarpoolEarnings({ navigation }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const carpool = useCarpool();

  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      carpool.actions.getBalance().then((result) => {
        setBalance(result);
        setLoading(false);
      });
    }, [])
  );

  if (loading) {
    return (
      <View style={[styles.screen, styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const blocked = balance?.publicationBlocked;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <StepHeader
        title={t2("carpoolDriver.earningsTitle")}
        onBack={() => navigation.navigate("HomeTab", { screen: "CarpoolDriverHome" })}
      />

      <ScrollView
        contentContainerStyle={[styles.body, { paddingBottom: Math.max(insets.bottom + 24, 32) }]}
      >
        <View style={[styles.hero, { borderColor: colors.border }, blocked && styles.heroBlocked]}>
          <Text style={[styles.heroLabel, { color: colors.placeholder }]}>
            {t2("carpoolDriver.youOwe")}
          </Text>
          <Text style={[styles.heroValue, { color: blocked ? "#B3261E" : colors.text }]}>
            {formatPrice(balance?.balanceGnf)}
          </Text>
          {blocked ? (
            <Text style={styles.heroBlockedText}>{t2("carpoolDriver.blockedHint")}</Text>
          ) : (
            balance?.remainingBeforeBlockGnf != null && (
              <Text style={[styles.heroHint, { color: colors.placeholder }]}>
                {t2("carpoolDriver.remainingHint", {
                  amount: formatPrice(balance.remainingBeforeBlockGnf),
                })}
              </Text>
            )
          )}
        </View>

        <View style={[styles.howBox, { backgroundColor: colors.overlap }]}>
          <Icon name="info-outline" size={20} color={colors.placeholder} />
          <Text style={[styles.howText, { color: colors.text }]}>
            {t2("carpoolDriver.howSettle")}
          </Text>
        </View>

        {balance?.reliability && (
          <View style={styles.reliabilityBox}>
            <Text style={[styles.sectionLabel, { color: colors.placeholder }]}>
              {t2("carpoolDriver.reliability")}
            </Text>
            <Text style={[styles.reliabilityValue, { color: colors.text }]}>
              {balance.reliability.score == null
                ? t2("carpoolDriver.reliabilityNew")
                : `${balance.reliability.score}%`}
            </Text>
            <Text style={[styles.reliabilityHint, { color: colors.placeholder }]}>
              {balance.reliability.score == null
                ? t2("carpoolDriver.reliabilityNewHint")
                : t2("carpoolDriver.reliabilityHint")}
            </Text>
          </View>
        )}

        <Text style={[styles.sectionLabel, { color: colors.placeholder }]}>
          {t2("carpoolDriver.history")}
        </Text>
        {(balance?.entries || []).length === 0 ? (
          <Text style={[styles.empty, { color: colors.placeholder }]}>
            {t2("carpoolDriver.noHistory")}
          </Text>
        ) : (
          balance.entries.map((entry) => {
            const copy = ENTRY_COPY[entry.type] || ENTRY_COPY.adjustment;
            return (
              <View
                key={entry._id}
                style={[styles.entry, { borderBottomColor: colors.overlap }]}
              >
                <Icon name={copy.icon} size={20} color={copy.color} />
                <View style={styles.entryText}>
                  <Text style={[styles.entryLabel, { color: colors.text }]}>
                    {t2(copy.key)}
                  </Text>
                  <Text style={[styles.entryDate, { color: colors.placeholder }]}>
                    {formatDate(entry.createdAt)}
                  </Text>
                </View>
                <Text style={[styles.entryAmount, { color: copy.color }]}>
                  {entry.amountGnf > 0 ? "+" : "−"}
                  {formatPrice(entry.amountGnf)}
                </Text>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  body: { paddingHorizontal: 20 },
  hero: {
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 14,
    padding: 24,
    marginBottom: 14,
  },
  // Fixed error red/pink regardless of theme — a status colour, not a neutral one.
  heroBlocked: { borderColor: "#B3261E", backgroundColor: "#FBE9E7" },
  heroLabel: { fontSize: 14 },
  heroValue: { fontSize: 36, fontWeight: "700", marginVertical: 6 },
  heroHint: { fontSize: 13, textAlign: "center" },
  heroBlockedText: { fontSize: 13, color: "#B3261E", textAlign: "center", lineHeight: 19 },
  howBox: {
    flexDirection: "row",
    gap: 10,
    borderRadius: 12,
    padding: 14,
    marginBottom: 22,
  },
  howText: { flex: 1, fontSize: 14, lineHeight: 20 },
  reliabilityBox: { marginBottom: 22 },
  reliabilityValue: { fontSize: 24, fontWeight: "700" },
  reliabilityHint: { fontSize: 13, marginTop: 4, lineHeight: 19 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  empty: { fontSize: 14, paddingVertical: 12 },
  entry: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  entryText: { flex: 1 },
  entryLabel: { fontSize: 15, fontWeight: "600" },
  entryDate: { fontSize: 13, marginTop: 2 },
  entryAmount: { fontSize: 16, fontWeight: "700" },
});
