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

export default function CabLicense({ navigation }) {
  const { colors } = useTheme();
  const partner = usePartner();
  const upload = useUpload();

  const hasPhoto = !!partner.uploadDocuments.cabLicense;

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={["top", "bottom"]}>
      <UploadHeader title={t2("upload.cabLicense")} navigation={navigation} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {hasPhoto ? (
          <View style={styles.previewWrap}>
            <RNImage
              source={{ uri: partner.uploadDocuments.cabLicense.uri }}
              style={styles.preview}
              resizeMode="cover"
            />
            <Text style={[styles.previewLabel, { color: "#9CA3AF" }]}>
              {t2("upload.cabLicense")}
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.iconWrap}>
              <View style={[styles.iconCircle, { backgroundColor: colors.primary + "18" }]}>
                <Icon name="directions-car" size={40} color={colors.primary} />
              </View>
            </View>

            <Text style={styles.subtitle}>{t2("upload.cabLicenseDescription")}</Text>

            <View style={[styles.tipBox, { borderColor: "#E5E7EB", backgroundColor: colors.primary + "06" }]}>
              <Icon name="info-outline" size={18} color={colors.primary} style={{ marginTop: 1 }} />
              <Text style={[styles.tipText, { color: colors.text }]}>{t2("upload.cabLicenseDescription")}</Text>
            </View>
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {hasPhoto ? (
          <>
            <Button
              mode="contained"
              onPress={() => navigation.navigate("Upload")}
              style={styles.btn}
              contentStyle={styles.btnContent}
            >
              {t2("upload.useThisPicture")}
            </Button>
            <TouchableOpacity
              onPress={() =>
                partner.actions.setUploadDocuments({ ...partner.uploadDocuments, cabLicense: null })
              }
              style={styles.retakeBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={[styles.retakeText, { color: colors.error }]}>{t2("upload.takeAgain")}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Button
            mode="contained"
            onPress={() =>
              upload.actions.takePhoto((result) =>
                partner.actions.setUploadDocuments({
                  ...partner.uploadDocuments,
                  cabLicense: { uri: result.uri, base64: result.base64 },
                })
              )
            }
            style={styles.btn}
            contentStyle={styles.btnContent}
          >
            {t2("upload.cabLicenseTake")}
          </Button>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16 },

  previewWrap: { alignItems: "center", paddingTop: 32 },
  preview: { width: "100%", height: 220, borderRadius: 16 },
  previewLabel: { fontSize: 14, marginTop: 16 },

  iconWrap: { alignItems: "center", marginBottom: 16 },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },

  subtitle: { fontSize: 15, color: "#9CA3AF", lineHeight: 22, marginBottom: 24 },

  tipBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
  },
  tipText: { fontSize: 13, lineHeight: 18, flex: 1 },

  footer: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 16 },
  btn: { borderRadius: 14 },
  btnContent: { height: 56 },
  retakeBtn: { alignItems: "center", marginTop: 16 },
  retakeText: { fontSize: 14, fontWeight: "500" },
});
