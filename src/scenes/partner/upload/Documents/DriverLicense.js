import React from "react";
import { View, Image as RNImage, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme, Text } from "react-native-paper";
import Icon from "@expo/vector-icons/MaterialIcons";
import { t2 } from "_utils/lang";
import { Button } from "_atoms";
import { usePartner } from "_hooks";
import useUpload from "../../../../hooks/partner/useUpload";
import UploadHeader from "../UploadHeader";

function PhotoSlot({ field, label, colors, partner, upload }) {
  const stored = partner.uploadDocuments?.[field];
  const status = stored?.status ?? "idle";
  const uri = stored?.uri;

  const capture = (useCam) => {
    const action = useCam ? upload.actions.takePhoto : upload.actions.pickImage;
    action((result) => partner.actions.uploadDocument(field, result.uri));
  };

  const retry = () => partner.actions.uploadDocument(field, uri);

  if (status === "uploading") {
    return (
      <View style={[styles.slot, { borderColor: colors.primary }]}>
        <Text style={[styles.slotLabel, { color: colors.text }]}>{label}</Text>
        <View style={styles.slotSpinner}>
          <ActivityIndicator color={colors.primary} />
          <Text style={[styles.uploadingText, { color: colors.primary }]}>{t2("upload.docUploading")}</Text>
        </View>
      </View>
    );
  }

  if (status === "uploaded") {
    return (
      <View style={[styles.slot, { borderColor: colors.primary, backgroundColor: colors.primary + "08" }]}>
        <Text style={[styles.slotLabel, { color: colors.text }]}>{label}</Text>
        {uri ? (
          <RNImage source={{ uri }} style={styles.slotPreview} resizeMode="cover" />
        ) : (
          <View style={[styles.uploadedRow]}>
            <Icon name="check-circle" size={22} color={colors.primary} />
            <Text style={[styles.uploadedText, { color: colors.primary }]}>{t2("upload.docComplete")}</Text>
          </View>
        )}
        {!partner.documentsSubmitted && (
          <TouchableOpacity onPress={() => capture(true)} style={styles.retakeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={[styles.retakeText, { color: colors.error }]}>{t2("upload.takeAgain")}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (status === "error") {
    return (
      <View style={[styles.slot, { borderColor: colors.error + "60" }]}>
        <Text style={[styles.slotLabel, { color: colors.text }]}>{label}</Text>
        {uri && <RNImage source={{ uri }} style={styles.slotPreview} resizeMode="cover" />}
        <TouchableOpacity onPress={retry} style={styles.retakeBtn}>
          <Text style={[styles.retakeText, { color: colors.error }]}>{t2("upload.docError")}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // idle
  return (
    <View style={[styles.slot, { borderColor: "#E5E7EB" }]}>
      <Text style={[styles.slotLabel, { color: colors.text }]}>{label}</Text>
      <View style={styles.slotActions}>
        <TouchableOpacity
          style={[styles.sourceBtn, { borderColor: colors.primary + "60", backgroundColor: colors.primary + "08" }]}
          onPress={() => capture(true)}
        >
          <Icon name="camera-alt" size={22} color={colors.primary} />
          <Text style={[styles.sourceBtnText, { color: colors.primary }]}>{t2("upload.fromCamera")}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sourceBtn, { borderColor: colors.primary + "60", backgroundColor: colors.primary + "08" }]}
          onPress={() => capture(false)}
        >
          <Icon name="photo-library" size={22} color={colors.primary} />
          <Text style={[styles.sourceBtnText, { color: colors.primary }]}>{t2("upload.fromGallery")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function DriverLicense({ navigation }) {
  const { colors } = useTheme();
  const partner = usePartner();
  const upload = useUpload();

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={["top", "bottom"]}>
      <UploadHeader title={t2("upload.driverLicense")} navigation={navigation} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.iconWrap}>
          <View style={[styles.iconCircle, { backgroundColor: colors.primary + "18" }]}>
            <Icon name="badge" size={40} color={colors.primary} />
          </View>
        </View>
        <Text style={styles.subtitle}>{t2("upload.driverLicenceDescription")}</Text>

        <PhotoSlot
          field="driverLicenseFront"
          label={t2("upload.driverLicenceFront")}
          colors={colors}
          partner={partner}
          upload={upload}
        />
        <PhotoSlot
          field="driverLicenseBack"
          label={t2("upload.driverLicenceBack")}
          colors={colors}
          partner={partner}
          upload={upload}
        />
      </ScrollView>

      <View style={styles.footer}>
        <Button
          mode="outlined"
          onPress={() => navigation.navigate("Upload")}
          style={[styles.btn, { borderColor: colors.primary + "60" }]}
          contentStyle={styles.btnContent}
        >
          {t2("upload.back")}
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16 },

  iconWrap: { alignItems: "center", marginBottom: 16 },
  iconCircle: { width: 80, height: 80, borderRadius: 40, justifyContent: "center", alignItems: "center" },
  subtitle: { fontSize: 15, color: "#9CA3AF", lineHeight: 22, marginBottom: 24 },

  slot: { borderWidth: 1.5, borderRadius: 16, padding: 16, marginBottom: 16 },
  slotLabel: { fontSize: 15, fontWeight: "600", marginBottom: 12 },
  slotPreview: { width: "100%", height: 160, borderRadius: 10 },

  slotSpinner: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8 },
  uploadingText: { fontSize: 14, fontWeight: "500" },

  uploadedRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 8 },
  uploadedText: { fontSize: 14, fontWeight: "500" },

  retakeBtn: { alignItems: "center", marginTop: 12 },
  retakeText: { fontSize: 14, fontWeight: "500" },

  slotActions: { flexDirection: "row", gap: 12 },
  sourceBtn: {
    flex: 1, flexDirection: "column", alignItems: "center", justifyContent: "center",
    gap: 6, borderWidth: 1, borderRadius: 12, paddingVertical: 16, paddingHorizontal: 8,
  },
  sourceBtnText: { fontSize: 12, fontWeight: "600", textAlign: "center" },

  footer: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 16 },
  btn: { borderRadius: 14 },
  btnContent: { height: 56 },
});
