import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Text, useTheme } from "react-native-paper";
import Icon from "@expo/vector-icons/MaterialIcons";
import { Button } from "_atoms";
import { useApp, usePartner } from "_hooks";
import { t2 } from "_utils/lang";

const STEPS = ["pendingStepOne", "pendingStepTwo", "pendingStepThree"];

export default function Pending() {
  const { colors } = useTheme();
  const app = useApp();
  const partner = usePartner();
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <View style={styles.heroWrap}>
          <View style={[styles.iconCircle, { backgroundColor: colors.primary + "18" }]}>
            <Icon name="schedule" size={48} color={colors.primary} />
          </View>
          <View style={[styles.badge, { backgroundColor: colors.primary + "18" }]}>
            <View style={[styles.badgeDot, { backgroundColor: colors.primary }]} />
            <Text style={[styles.badgeText, { color: colors.primary }]}>{t2("pending.badge")}</Text>
          </View>
        </View>

        <Text style={[styles.title, { color: colors.text }]}>{t2("pending.title")}</Text>
        <Text style={styles.description}>{t2("pending.description")}</Text>

        <Text style={[styles.sectionLabel, { color: colors.text }]}>{t2("pending.nextStepsTitle")}</Text>

        {STEPS.map((key, i) => (
          <View key={key} style={[styles.step, { borderColor: "#E5E7EB" }]}>
            <View style={[styles.stepNum, { backgroundColor: colors.primary + "18" }]}>
              <Text style={[styles.stepNumText, { color: colors.primary }]}>{i + 1}</Text>
            </View>
            <Text style={[styles.stepText, { color: colors.text }]}>{t2(`pending.${key}`)}</Text>
          </View>
        ))}

      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom + 16, 24) }]}>
        <Button
          mode="contained"
          onPress={() => app.actions.call()}
          style={styles.btn}
          contentStyle={styles.btnContent}
        >
          {t2("pending.contactUs")}
        </Button>
        <Button
          mode="outlined"
          onPress={() => partner.actions.logout()}
          style={[styles.logoutBtn, { borderColor: colors.error + "50" }]}
          contentStyle={styles.btnContent}
          textColor={colors.error}
        >
          {t2("upload.logout")}
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { paddingHorizontal: 24, paddingTop: 40, paddingBottom: 16 },

  heroWrap: { alignItems: "center", marginBottom: 32, gap: 16 },
  iconCircle: { width: 100, height: 100, borderRadius: 50, justifyContent: "center", alignItems: "center" },

  badge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  badgeDot: { width: 7, height: 7, borderRadius: 4 },
  badgeText: { fontSize: 13, fontWeight: "600" },

  title: { fontSize: 24, fontWeight: "700", textAlign: "center", marginBottom: 12 },
  description: { fontSize: 15, color: "#9CA3AF", textAlign: "center", lineHeight: 22, marginBottom: 32 },

  sectionLabel: { fontSize: 14, fontWeight: "600", marginBottom: 14, letterSpacing: 0.2 },

  step: { flexDirection: "row", alignItems: "flex-start", gap: 14, borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 12 },
  stepNum: { width: 30, height: 30, borderRadius: 15, justifyContent: "center", alignItems: "center", flexShrink: 0 },
  stepNumText: { fontSize: 13, fontWeight: "700" },
  stepText: { fontSize: 14, lineHeight: 20, flex: 1, paddingTop: 5 },

  footer: { paddingHorizontal: 24, paddingTop: 12, gap: 12 },
  btn: { borderRadius: 14 },
  logoutBtn: { borderRadius: 14 },
  btnContent: { height: 56 },
});
