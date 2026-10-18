import React, { useCallback } from "react";
import { View, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import Icon from "@expo/vector-icons/MaterialIcons";
import { Button } from "_atoms";
import { useCarpool } from "_hooks/carpoolDriver";
import { t2 } from "_utils/lang";

const formatPrice = (value) =>
  `${String(Math.floor(value || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ".")} GNF`;

const formatTime = (iso) => {
  const d = new Date(iso);
  return `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
};

// One row of the onboarding checklist. Done steps are ticked and quiet; the next
// step is the only thing that looks tappable, so the driver is never choosing
// between several half-finished paths.
const Step = ({ done, active, label, hint, onPress, colors }) => (
  <TouchableOpacity
    disabled={done || !active}
    onPress={onPress}
    activeOpacity={0.75}
    style={[
      styles.step,
      {
        borderColor: active ? colors.primary : colors.border,
        backgroundColor: active ? colors.primary + "0D" : "transparent",
      },
    ]}
  >
    <Icon
      name={done ? "check-circle" : active ? "radio-button-unchecked" : "lock-outline"}
      size={24}
      // Done stays a fixed success green regardless of theme — it is a status
      // colour, not a neutral one.
      color={done ? "#1F6F43" : active ? colors.primary : colors.placeholder}
    />
    <View style={styles.stepText}>
      <Text style={[styles.stepLabel, { color: done ? colors.placeholder : colors.text }]}>
        {label}
      </Text>
      {!!hint && active && (
        <Text style={[styles.stepHint, { color: colors.placeholder }]}>{hint}</Text>
      )}
    </View>
    {active && <Icon name="chevron-right" size={22} color={colors.primary} />}
  </TouchableOpacity>
);

export default function CarpoolDriverHome({ navigation }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const carpool = useCarpool();

  useFocusEffect(
    useCallback(() => {
      carpool.actions.loadProfile();
    }, [])
  );

  const profile = carpool.profile;

  if (!profile && carpool.isLoading) {
    return (
      <View style={[styles.screen, styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const onboarding = profile?.onboarding;
  const setupDone =
    onboarding?.verified &&
    onboarding?.hasCar &&
    onboarding?.hasRequiredDocuments &&
    onboarding?.hasTemplate;

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
            <Text style={[styles.title, { color: colors.text }]}>
              {t2("carpoolDriver.title")}
            </Text>
            <Text style={[styles.subtitle, { color: colors.placeholder }]}>
              {t2("carpoolDriver.subtitle")}
            </Text>
          </View>
        </View>

        {/* A trip running right now outranks everything else on the screen. */}
        {profile?.activeTrip && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate("TripsTab", {
                screen: "CarpoolDayOf",
                params: { tripId: profile.activeTrip._id },
              })
            }
            style={[styles.liveCard, { backgroundColor: colors.primary }]}
          >
            <Icon name="directions-car" size={28} color="#fff" />
            <View style={styles.stepText}>
              <Text style={styles.liveTitle}>
                {profile.activeTrip.status === "in_progress"
                  ? t2("carpoolDriver.tripRunning")
                  : t2("carpoolDriver.tripToday")}
              </Text>
              <Text style={styles.liveHint}>
                {formatTime(profile.activeTrip.departureAt)} ·{" "}
                {t2("carpoolDriver.openManifest")}
              </Text>
            </View>
            <Icon name="chevron-right" size={24} color="#fff" />
          </TouchableOpacity>
        )}

        {/* Confirmations are time-boxed, so they sit above routine navigation. */}
        {profile?.pendingConfirmations > 0 && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate("TripsTab", { screen: "CarpoolConfirm" })}
            style={styles.confirmCard}
          >
            <Icon name="notifications-active" size={26} color="#92400E" />
            <View style={styles.stepText}>
              <Text style={styles.confirmTitle}>
                {t2("carpoolDriver.confirmNeeded", {
                  count: profile.pendingConfirmations,
                })}
              </Text>
              <Text style={styles.confirmHint}>{t2("carpoolDriver.confirmHint")}</Text>
            </View>
            <Icon name="chevron-right" size={24} color="#92400E" />
          </TouchableOpacity>
        )}

        {profile?.adminCancelledTrips?.length > 0 && (
          <View style={styles.confirmCard}>
            <Icon name="info" size={26} color="#92400E" />
            <View style={styles.stepText}>
              <Text style={styles.confirmTitle}>
                {t2("carpoolDriver.adminCancelledTitle", {
                  count: profile.adminCancelledTrips.length,
                })}
              </Text>
              <Text style={styles.confirmHint}>
                {profile.adminCancelledTrips
                  .map((trip) => `${formatTime(trip.departureAt)} · ${trip.corridorId?.name ?? ""}`)
                  .join("  ·  ")}
              </Text>
              <Text style={styles.confirmHint}>{t2("carpoolDriver.adminCancelledHint")}</Text>
            </View>
          </View>
        )}

        {!setupDone ? (
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.placeholder }]}>
              {t2("carpoolDriver.setupLabel")}
            </Text>
            <Step
              colors={colors}
              done={!!profile?.enrolled}
              active={!profile?.enrolled}
              label={t2("carpoolDriver.stepJoin")}
              hint={t2("carpoolDriver.stepJoinHint")}
              onPress={() => navigation.navigate("CarpoolEnroll")}
            />
            <Step
              colors={colors}
              done={!!onboarding?.hasCar}
              active={!!profile?.enrolled && !onboarding?.hasCar}
              label={t2("carpoolDriver.stepCar")}
              hint={t2("carpoolDriver.stepCarHint")}
              onPress={() =>
                onboarding?.hasCar
                  ? navigation.navigate("CarpoolMyCars")
                  : navigation.navigate("CarpoolCar")
              }
            />
            <Step
              colors={colors}
              done={!!onboarding?.hasRequiredDocuments}
              active={!!onboarding?.hasCar && !onboarding?.hasRequiredDocuments}
              label={t2("carpoolDriver.stepDocuments")}
              hint={t2("carpoolDriver.stepDocumentsHint")}
              onPress={() =>
                navigation.navigate("Documents", {
                  carId: (profile?.cars?.find((c) => c.active) || profile?.cars?.[0])?._id,
                })
              }
            />
            <Step
              colors={colors}
              done={!!onboarding?.verified}
              active={false}
              label={
                onboarding?.verified
                  ? t2("carpoolDriver.stepVerifiedDone")
                  : t2("carpoolDriver.stepVerified")
              }
            />
            <Step
              colors={colors}
              done={!!onboarding?.hasTemplate}
              active={!!onboarding?.verified && !onboarding?.hasTemplate}
              label={t2("carpoolDriver.stepTemplate")}
              hint={t2("carpoolDriver.stepTemplateHint")}
              onPress={() =>
                navigation.navigate("TripsTab", { screen: "CarpoolTemplateForm", params: {} })
              }
            />
          </View>
        ) : (
          <View style={styles.section}>
            <Button
              mode="contained"
              icon="calendar"
              onPress={() => navigation.navigate("TripsTab", { screen: "CarpoolTemplates" })}
              style={styles.action}
              contentStyle={styles.actionContent}
            >
              {t2("carpoolDriver.myTrips")}
            </Button>
            <Button
              mode="outlined"
              icon="wallet"
              onPress={() => navigation.navigate("EarningsTab", { screen: "CarpoolEarnings" })}
              style={styles.action}
              contentStyle={styles.actionContent}
            >
              {t2("carpoolDriver.earnings")}
            </Button>
          </View>
        )}

        {profile?.balance && (
          <View
            style={[
              styles.balanceBox,
              { borderColor: colors.border },
              profile.balance.publicationBlocked && styles.balanceBlocked,
            ]}
          >
            <Text style={[styles.balanceLabel, { color: colors.placeholder }]}>
              {t2("carpoolDriver.youOwe")}
            </Text>
            <Text
              style={[
                styles.balanceValue,
                { color: profile.balance.publicationBlocked ? "#B3261E" : colors.text },
              ]}
            >
              {formatPrice(profile.balance.balanceGnf)}
            </Text>
            {profile.balance.publicationBlocked ? (
              <Text style={styles.balanceBlockedText}>
                {t2("carpoolDriver.blockedHint")}
              </Text>
            ) : (
              profile.balance.remainingBeforeBlockGnf != null && (
                <Text style={[styles.balanceHint, { color: colors.placeholder }]}>
                  {t2("carpoolDriver.remainingHint", {
                    amount: formatPrice(profile.balance.remainingBeforeBlockGnf),
                  })}
                </Text>
              )
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  body: { paddingHorizontal: 20 },
  center: { alignItems: "center", justifyContent: "center" },
  headerRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 22 },
  title: { fontSize: 26, fontWeight: "700" },
  subtitle: { fontSize: 15, marginTop: 4 },
  section: { marginBottom: 22 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  step: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    minHeight: 64,
  },
  stepText: { flex: 1 },
  stepLabel: { fontSize: 16, fontWeight: "600" },
  stepHint: { fontSize: 13, marginTop: 3 },
  liveCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
  },
  liveTitle: { fontSize: 17, fontWeight: "700", color: "#fff" },
  liveHint: { fontSize: 14, color: "rgba(255,255,255,0.85)", marginTop: 2 },
  confirmCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    backgroundColor: "#FEF3C7",
  },
  confirmTitle: { fontSize: 16, fontWeight: "700", color: "#92400E" },
  confirmHint: { fontSize: 13, color: "#92400E", marginTop: 2 },
  action: { borderRadius: 10, marginBottom: 10 },
  actionContent: { height: 52 },
  balanceBox: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    alignItems: "center",
  },
  // Blocked stays a fixed error red/pink regardless of theme — a status colour,
  // not a neutral one.
  balanceBlocked: { borderColor: "#B3261E", backgroundColor: "#FBE9E7" },
  balanceLabel: { fontSize: 14 },
  balanceValue: { fontSize: 26, fontWeight: "700", marginVertical: 4 },
  balanceHint: { fontSize: 13, textAlign: "center" },
  // Fixed error red, matching balanceBlocked's border/background pairing above.
  balanceBlockedText: {
    fontSize: 13,
    color: "#B3261E",
    textAlign: "center",
    lineHeight: 19,
  },
});
