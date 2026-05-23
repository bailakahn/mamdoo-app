import React from "react";
import { View, ScrollView, StyleSheet, Image } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Text, useTheme } from "react-native-paper";
import { Button } from "_atoms";
import { useApp, usePartner } from "_hooks";
import { t2 } from "_utils/lang";

export default function Pending() {
  const { colors } = useTheme();
  const app = useApp();
  const partner = usePartner();
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.center}>
          <Image
            source={require("_assets/pending.png")}
            style={styles.illustration}
            resizeMode="contain"
          />

          <Text style={[styles.title, { color: colors.primary }]}>
            {t2("pending.title")}
          </Text>
          <Text style={styles.description}>{t2("pending.description")}</Text>

          <Button
            mode="outlined"
            onPress={() => app.actions.call()}
            style={[styles.contactBtn, { borderColor: colors.primary }]}
            contentStyle={styles.btnContent}
          >
            {t2("pending.contactUs")}
          </Button>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom + 16, 24) }]}>
        <Button
          mode="outlined"
          onPress={() => partner.actions.logout()}
          style={[styles.logoutBtn, { borderColor: colors.error + "60" }]}
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
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 32, paddingBottom: 16 },

  center: { flex: 1, alignItems: "center", justifyContent: "center" },

  illustration: { width: 220, height: 220, marginBottom: 32 },

  title: { fontSize: 24, fontWeight: "700", textAlign: "center", marginBottom: 16 },
  description: { fontSize: 15, color: "#9CA3AF", textAlign: "center", lineHeight: 22, marginBottom: 32 },

  contactBtn: { borderRadius: 14, width: "100%" },
  logoutBtn: { borderRadius: 14 },
  btnContent: { height: 56 },

  footer: { paddingHorizontal: 24, paddingTop: 12 },
});
