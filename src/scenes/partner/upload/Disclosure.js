import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme, Text } from "react-native-paper";
import Icon from "@expo/vector-icons/MaterialIcons";
import { t2 } from "_utils/lang";
import { Button } from "_atoms";
import UploadHeader from "./UploadHeader";

const SECTIONS = [
  {
    icon: "upload-file",
    titleKey: "collectedDataTitle",
    bodyKey: "collectedDataDescription",
  },
  {
    icon: "help-outline",
    titleKey: "whyWeCollectTitle",
    bodyKey: null,
  },
  {
    icon: "security",
    titleKey: "dataUsageTitle",
    bodyKey: "dataUsageDescription",
  },
];

export default function Disclosure({ navigation }) {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={["top", "bottom"]}>
      <UploadHeader title={t2("upload.disclosureTitle")} navigation={navigation} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.iconWrap}>
          <View style={[styles.iconCircle, { backgroundColor: colors.primary + "18" }]}>
            <Icon name="shield" size={40} color={colors.primary} />
          </View>
        </View>

        <Text style={styles.subtitle}>{t2("upload.disclosureSubTitle")}</Text>

        {SECTIONS.map(({ icon, titleKey, bodyKey }, index) => (
          <View
            key={index}
            style={[styles.card, { borderColor: colors.primary + "30", backgroundColor: colors.primary + "08" }]}
          >
            <View style={[styles.cardIcon, { backgroundColor: colors.primary + "18" }]}>
              <Icon name={icon} size={22} color={colors.primary} />
            </View>
            <View style={styles.cardContent}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>{t2(`upload.${titleKey}`)}</Text>
              {bodyKey ? (
                <Text style={styles.cardBody}>{t2(`upload.${bodyKey}`)}</Text>
              ) : (
                <View style={{ marginTop: 4 }}>
                  <Text style={styles.cardBody}>{t2("upload.whyWeCollectDescription")}</Text>
                  {["whyWeCollectDescription1", "whyWeCollectDescription2", "whyWeCollectDescription3"].map((k) => (
                    <Text key={k} style={[styles.cardBody, { marginTop: 2 }]}>
                      {"• "}{t2(`upload.${k}`)}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          </View>
        ))}

        <View style={[styles.consentBox, { borderColor: "#E5E7EB" }]}>
          <Text style={[styles.consentText, { color: colors.text }]}>{t2("upload.consentDescription")}</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          mode="contained"
          onPress={() => navigation.navigate("Upload")}
          style={styles.btn}
          contentStyle={styles.btnContent}
        >
          {t2("upload.accept")}
        </Button>

        <Button
          mode="outlined"
          onPress={() => navigation.navigate("NotActive")}
          style={[styles.declineBtn, { borderColor: colors.error + "60" }]}
          contentStyle={styles.btnContent}
          textColor={colors.error}
        >
          {t2("upload.decline")}
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

  card: {
    flexDirection: "row",
    gap: 14,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    alignItems: "flex-start",
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: "600", marginBottom: 4 },
  cardBody: { fontSize: 13, color: "#9CA3AF", lineHeight: 18 },

  consentBox: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginTop: 4,
  },
  consentText: { fontSize: 13, lineHeight: 20 },

  footer: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 16, gap: 12 },
  btn: { borderRadius: 14 },
  btnContent: { height: 56 },
  declineBtn: { borderRadius: 14 },
});
