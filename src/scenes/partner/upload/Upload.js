import React, { useState, useEffect } from "react";
import { View, ScrollView, TouchableOpacity, Modal, Pressable, ActivityIndicator, StyleSheet } from "react-native";
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
    required: true,
    getStatus: (docs) => docs?.profilePicture?.status ?? "idle",
  },
  {
    icon: "badge",
    titleKey: "driverLicense",
    route: "DriverLicense",
    required: false,
    optional: true,
    getStatus: (docs) => {
      const f = docs?.driverLicenseFront?.status ?? "idle";
      const b = docs?.driverLicenseBack?.status ?? "idle";
      if (f === "uploaded" && b === "uploaded") return "uploaded";
      if (f === "uploading" || b === "uploading") return "uploading";
      if (f === "error" || b === "error") return "error";
      return "idle";
    },
  },
  {
    icon: "directions-car",
    titleKey: "cabLicense",
    route: "CabLicense",
    required: true,
    getStatus: (docs) => docs?.cabLicense?.status ?? "idle",
  },
];

function StatusLabel({ status, colors }) {
  if (status === "uploading")
    return <Text style={[styles.statusLabel, { color: colors.primary }]}>{t2("upload.docUploading")}</Text>;
  if (status === "error")
    return <Text style={[styles.statusLabel, { color: colors.error }]}>{t2("upload.docError")}</Text>;
  if (status === "uploaded")
    return <Text style={[styles.statusLabel, { color: colors.primary }]}>{"✓ "}{t2("upload.docComplete")}</Text>;
  return <Text style={[styles.statusLabel, { color: "#9CA3AF" }]}>{t2("upload.docPending")}</Text>;
}

function StatusIcon({ status, colors }) {
  if (status === "uploading") return <ActivityIndicator size="small" color={colors.primary} />;
  if (status === "error") return <Icon name="error-outline" size={24} color={colors.error} />;
  if (status === "uploaded") return <Icon name="check-circle" size={24} color={colors.primary} />;
  return <Icon name="chevron-right" size={24} color="#D1D5DB" />;
}

export default function Upload({ navigation }) {
  const { colors } = useTheme();
  const partner = usePartner();
  const insets = useSafeAreaInsets();
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    partner.actions.loadDocumentState();
  }, []);

  if (partner.isLoading) return <LoadingV2 />;

  const canSubmit =
    DOCS.filter((d) => d.required).every(
      (d) => d.getStatus(partner.uploadDocuments) === "uploaded"
    ) && !partner.documentsSubmitted;

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={["top", "bottom"]}>
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setModalVisible(false)}>
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
                setModalVisible(false);
                partner.actions.submitDocuments(navigation);
              }}
              style={styles.sheetBtn}
              contentStyle={styles.btnContent}
            >
              {t2("upload.send")}
            </Button>
            <Button
              mode="outlined"
              onPress={() => setModalVisible(false)}
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

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {partner.documentsSubmitted && (
          <View style={[styles.submittedBanner, { backgroundColor: colors.primary + "12", borderColor: colors.primary + "30" }]}>
            <Icon name="schedule" size={18} color={colors.primary} />
            <Text style={[styles.submittedText, { color: colors.primary }]}>{t2("upload.docSubmitted")}</Text>
          </View>
        )}

        <Text style={[styles.sectionHint, { color: "#9CA3AF" }]}>{t2("upload.mandatoyStepsDescription")}</Text>

        {DOCS.map(({ icon, titleKey, route, optional, getStatus }) => {
          const status = getStatus(partner.uploadDocuments);
          const isUploading = status === "uploading";
          const isUploaded = status === "uploaded";

          return (
            <TouchableOpacity
              key={route}
              style={[
                styles.docRow,
                {
                  borderColor: isUploaded ? colors.primary : status === "error" ? colors.error + "60" : "#E5E7EB",
                  backgroundColor: isUploaded ? colors.primary + "08" : colors.background,
                },
              ]}
              onPress={() => !partner.documentsSubmitted && !isUploading && navigation.navigate(route)}
              activeOpacity={partner.documentsSubmitted || isUploading ? 1 : 0.7}
            >
              <View style={[styles.docIcon, { backgroundColor: colors.primary + "18" }]}>
                <Icon name={icon} size={22} color={colors.primary} />
              </View>
              <View style={styles.docMeta}>
                <Text style={[styles.docTitle, { color: colors.text }]}>
                  {t2(`upload.${titleKey}`)}
                  {optional && <Text style={styles.optionalTag}> ({t2("upload.optional")})</Text>}
                </Text>
                <StatusLabel status={status} colors={colors} />
              </View>
              <StatusIcon status={status} colors={colors} />
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {!partner.documentsSubmitted && (
        <View style={styles.footer}>
          <Button
            mode="contained"
            onPress={() => setModalVisible(true)}
            disabled={!canSubmit}
            style={styles.btn}
            contentStyle={styles.btnContent}
          >
            {t2("upload.uploadDocuments")}
          </Button>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },

  backdrop: { flex: 1, backgroundColor: "transparent", justifyContent: "flex-end" },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 24, paddingTop: 12 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#E5E7EB", alignSelf: "center", marginBottom: 24 },
  sheetTitle: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
  sheetBody: { fontSize: 14, color: "#9CA3AF", lineHeight: 20, marginBottom: 24 },
  sheetBtn: { borderRadius: 14, marginBottom: 12 },
  sheetCancelBtn: { borderRadius: 14 },

  scroll: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16 },

  submittedBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  submittedText: { fontSize: 14, fontWeight: "500", flex: 1 },

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
  statusLabel: { fontSize: 13, fontWeight: "500", marginTop: 2 },

  footer: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 16 },
  btn: { borderRadius: 14 },
  btnContent: { height: 56 },
});
