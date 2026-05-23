import React from "react";
import { View, Image as RNImage, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme, Text } from "react-native-paper";
import Icon from "@expo/vector-icons/MaterialIcons";
import { t2 } from "_utils/lang";
import { Button } from "_atoms";
import { usePartner } from "_hooks";
import useUpload from "../../../../hooks/partner/useUpload";
import UploadHeader from "../UploadHeader";

function PhotoSlot({ label, uri, onCamera, onGallery, onClear, colors }) {
  const done = !!uri;

  return (
    <View style={[styles.slot, { borderColor: done ? colors.primary : "#E5E7EB" }]}>
      <Text style={[styles.slotLabel, { color: colors.text }]}>{label}</Text>

      {done ? (
        <>
          <RNImage source={{ uri }} style={styles.slotPreview} resizeMode="cover" />
          <TouchableOpacity onPress={onClear} style={styles.retakeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={[styles.retakeText, { color: colors.error }]}>{t2("upload.takeAgain")}</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.slotActions}>
          <TouchableOpacity
            style={[styles.sourceBtn, { borderColor: colors.primary + "60", backgroundColor: colors.primary + "08" }]}
            onPress={onCamera}
          >
            <Icon name="camera-alt" size={22} color={colors.primary} />
            <Text style={[styles.sourceBtnText, { color: colors.primary }]}>{t2("upload.fromCamera")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sourceBtn, { borderColor: colors.primary + "60", backgroundColor: colors.primary + "08" }]}
            onPress={onGallery}
          >
            <Icon name="photo-library" size={22} color={colors.primary} />
            <Text style={[styles.sourceBtnText, { color: colors.primary }]}>{t2("upload.fromGallery")}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

export default function DriverLicense({ navigation }) {
  const { colors } = useTheme();
  const partner = usePartner();
  const upload = useUpload();

  const { driverLicenseFront, driverLicenseBack } = partner.uploadDocuments;
  const bothDone = !!(driverLicenseFront && driverLicenseBack);

  const capture = (field, useCam) => {
    const action = useCam ? upload.actions.takePhoto : upload.actions.pickImage;
    action((result) =>
      partner.actions.setUploadDocuments({
        ...partner.uploadDocuments,
        [field]: { uri: result.uri, base64: result.base64 },
      })
    );
  };

  const clear = (field) =>
    partner.actions.setUploadDocuments({ ...partner.uploadDocuments, [field]: null });

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={["top", "bottom"]}>
      <UploadHeader title={t2("upload.driverLicense")} navigation={navigation} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.iconWrap}>
          <View style={[styles.iconCircle, { backgroundColor: colors.primary + "18" }]}>
            <Icon name="badge" size={40} color={colors.primary} />
          </View>
        </View>

        <Text style={styles.subtitle}>{t2("upload.driverLicenceDescription")}</Text>

        <PhotoSlot
          label={t2("upload.driverLicenceFront")}
          uri={driverLicenseFront?.uri}
          onCamera={() => capture("driverLicenseFront", true)}
          onGallery={() => capture("driverLicenseFront", false)}
          onClear={() => clear("driverLicenseFront")}
          colors={colors}
        />

        <PhotoSlot
          label={t2("upload.driverLicenceBack")}
          uri={driverLicenseBack?.uri}
          onCamera={() => capture("driverLicenseBack", true)}
          onGallery={() => capture("driverLicenseBack", false)}
          onClear={() => clear("driverLicenseBack")}
          colors={colors}
        />
      </ScrollView>

      <View style={styles.footer}>
        <Button
          mode="contained"
          onPress={() => navigation.navigate("Upload")}
          disabled={!bothDone}
          style={styles.btn}
          contentStyle={styles.btnContent}
        >
          {t2("upload.useThisPicture")}
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16 },

  iconWrap: { alignItems: "center", marginBottom: 16 },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },

  subtitle: { fontSize: 15, color: "#9CA3AF", lineHeight: 22, marginBottom: 24 },

  slot: {
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  slotLabel: { fontSize: 15, fontWeight: "600", marginBottom: 12 },
  slotPreview: { width: "100%", height: 160, borderRadius: 10 },
  retakeBtn: { alignItems: "center", marginTop: 12 },
  retakeText: { fontSize: 14, fontWeight: "500" },

  slotActions: { flexDirection: "row", gap: 12 },
  sourceBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
  },
  sourceBtnText: { fontSize: 13, fontWeight: "600" },

  footer: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 16 },
  btn: { borderRadius: 14 },
  btnContent: { height: 56 },
});
