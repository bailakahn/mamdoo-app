import React, { useState } from "react";
import { View, ScrollView, TouchableOpacity, Modal, Pressable, StyleSheet } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme, Text } from "react-native-paper";
import Icon from "@expo/vector-icons/MaterialIcons";
import { t2 } from "_utils/lang";
import { Button, LoadingV2 } from "_atoms";
import { usePartner } from "_hooks";
import UploadHeader from "./UploadHeader";

const DOCS = [
  {
    icon: "person",
    titleKey: "profilePicture",
    route: "ProfilePicture",
    doneCheck: (docs) => !!docs?.profilePicture,
    optional: false,
  },
  {
    icon: "badge",
    titleKey: "driverLicense",
    route: "DriverLicense",
    doneCheck: (docs) => !!(docs?.driverLicenseFront && docs?.driverLicenseBack),
    optional: true,
  },
  {
    icon: "directions-car",
    titleKey: "cabLicense",
    route: "CabLicense",
    doneCheck: (docs) => !!docs?.cabLicense,
    optional: false,
  },
];

export default function Upload({ navigation }) {
  const { colors } = useTheme();
  const partner = usePartner();
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = useState(false);

  if (partner.isLoading) return <LoadingV2 />;

  const canSubmit =
    partner.uploadDocuments?.profilePicture && partner.uploadDocuments?.cabLicense;

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={["top", "bottom"]}>
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setVisible(false)}>
          <View
            style={[styles.sheet, { backgroundColor: colors.background, paddingBottom: Math.max(insets.bottom + 16, 24) }]}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.handle} />
            <Text style={[styles.sheetTitle, { color: colors.text }]}>{t2("upload.uploadDocuments")}</Text>
            <Text style={styles.sheetBody}>{t2("upload.uploadDocumentsConfirmation")}</Text>

            <Button
              mode="contained"
              onPress={() => {
                setVisible(false);
                partner.actions.uploadDocumentsToS3(navigation);
              }}
              style={styles.sheetBtn}
              contentStyle={styles.btnContent}
            >
              {t2("upload.send")}
            </Button>

            <Button
              mode="outlined"
              onPress={() => setVisible(false)}
              style={[styles.sheetCancelBtn, { borderColor: "#E5E7EB" }]}
              contentStyle={styles.btnContent}
              textColor={colors.text}
            >
              {t2("upload.cancel")}
            </Button>
          </View>
        </Pressable>
      </Modal>

      <UploadHeader title={t2("upload.mandatoyStepsTitle")} navigation={navigation} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.sectionHint, { color: "#9CA3AF" }]}>{t2("upload.mandatoyStepsDescription")}</Text>

        {DOCS.map(({ icon, titleKey, route, doneCheck, optional }) => {
          const done = doneCheck(partner.uploadDocuments);
          return (
            <TouchableOpacity
              key={route}
              style={[
                styles.docRow,
                {
                  borderColor: done ? colors.primary : "#E5E7EB",
                  backgroundColor: done ? colors.primary + "08" : colors.background,
                },
              ]}
              onPress={() => navigation.navigate(route)}
              activeOpacity={0.7}
            >
              <View style={[styles.docIcon, { backgroundColor: colors.primary + "18" }]}>
                <Icon name={icon} size={22} color={colors.primary} />
              </View>

              <View style={styles.docMeta}>
                <Text style={[styles.docTitle, { color: colors.text }]}>
                  {t2(`upload.${titleKey}`)}
                  {optional ? (
                    <Text style={styles.optionalTag}> ({t2("upload.optional")})</Text>
                  ) : null}
                </Text>
                {done ? (
                  <Text style={[styles.doneLabel, { color: colors.primary }]}>
                    {"✓ "}{t2("upload.docComplete")}
                  </Text>
                ) : (
                  <Text style={styles.pendingLabel}>{t2("upload.docPending")}</Text>
                )}
              </View>

              <Icon
                name={done ? "check-circle" : "chevron-right"}
                size={24}
                color={done ? colors.primary : "#D1D5DB"}
              />
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          mode="contained"
          onPress={() => setVisible(true)}
          disabled={!canSubmit}
          style={styles.btn}
          contentStyle={styles.btnContent}
        >
          {t2("upload.uploadDocuments")}
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },

  backdrop: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E5E7EB",
    alignSelf: "center",
    marginBottom: 24,
  },
  sheetTitle: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
  sheetBody: { fontSize: 14, color: "#9CA3AF", lineHeight: 20, marginBottom: 24 },
  sheetBtn: { borderRadius: 14, marginBottom: 12 },
  sheetCancelBtn: { borderRadius: 14 },

  scroll: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16 },

  sectionHint: { fontSize: 14, lineHeight: 20, marginBottom: 20 },

  docRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  docIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  docMeta: { flex: 1 },
  docTitle: { fontSize: 15, fontWeight: "600" },
  optionalTag: { fontSize: 13, fontWeight: "400", color: "#9CA3AF" },
  doneLabel: { fontSize: 13, fontWeight: "500", marginTop: 2 },
  pendingLabel: { fontSize: 13, color: "#9CA3AF", marginTop: 2 },

  footer: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 16 },
  btn: { borderRadius: 14 },
  btnContent: { height: 56 },
});
