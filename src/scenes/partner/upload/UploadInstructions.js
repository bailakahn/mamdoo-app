import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme, Text } from "react-native-paper";
import Icon from "@expo/vector-icons/MaterialIcons";
import { t2 } from "_utils/lang";
import { Button } from "_atoms";
import UploadHeader from "./UploadHeader";

const TIPS = [
  { icon: "verified", titleKey: "tipOneTitle", bodyKey: "tipOneDescription" },
  { icon: "crop-free", titleKey: "tipTwoTitle", bodyKey: "tipTwoDescription" },
  { icon: "wb-sunny", titleKey: "tipThreeTitle", bodyKey: "tipThreeDescription" },
  { icon: "badge", titleKey: "tipFourTitle", bodyKey: "tipFourDescription" },
];

export default function UploadInstructions({ navigation }) {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={["top", "bottom"]}>
      <UploadHeader title={t2("upload.uploadDocumentsTipsTitle")} navigation={navigation} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.iconWrap}>
          <View style={[styles.iconCircle, { backgroundColor: colors.primary + "18" }]}>
            <Icon name="tips-and-updates" size={40} color={colors.primary} />
          </View>
        </View>

        <Text style={styles.subtitle}>{t2("upload.uploadDocumentsTipsDescription")}</Text>

        {TIPS.map(({ icon, titleKey, bodyKey }, index) => (
          <View
            key={index}
            style={[styles.tipCard, { borderColor: colors.primary + "30", backgroundColor: colors.primary + "08" }]}
          >
            <View style={[styles.tipIcon, { backgroundColor: colors.primary + "18" }]}>
              <Icon name={icon} size={22} color={colors.primary} />
            </View>
            <View style={styles.tipContent}>
              <Text style={[styles.tipTitle, { color: colors.text }]}>{t2(`upload.${titleKey}`)}</Text>
              <Text style={styles.tipBody}>{t2(`upload.${bodyKey}`)}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          mode="contained"
          onPress={() => navigation.navigate("Disclosure")}
          style={styles.btn}
          contentStyle={styles.btnContent}
        >
          {t2("upload.understood")}
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 16 },

  iconWrap: { alignItems: "center", marginBottom: 16 },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },

  subtitle: { fontSize: 15, color: "#9CA3AF", lineHeight: 22, marginBottom: 24, textAlign: "center" },

  tipCard: {
    flexDirection: "row",
    gap: 14,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    alignItems: "flex-start",
  },
  tipIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  tipContent: { flex: 1 },
  tipTitle: { fontSize: 15, fontWeight: "600", marginBottom: 4 },
  tipBody: { fontSize: 13, color: "#9CA3AF", lineHeight: 18 },

  footer: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 16 },
  btn: { borderRadius: 14 },
  btnContent: { height: 56 },
});
