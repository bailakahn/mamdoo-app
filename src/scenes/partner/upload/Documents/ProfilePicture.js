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

const TIPS = ["profilePictureTipOne", "profilePictureTipTwo", "profilePictureTipThree"];

export default function ProfilePicture({ navigation }) {
  const { colors } = useTheme();
  const partner = usePartner();
  const upload = useUpload();

  const hasPhoto = !!partner.uploadDocuments.profilePicture;

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={["top", "bottom"]}>
      <UploadHeader title={t2("upload.profilePicture")} navigation={navigation} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {hasPhoto ? (
          <View style={styles.previewWrap}>
            <RNImage
              source={{ uri: partner.uploadDocuments.profilePicture.uri }}
              style={styles.preview}
              resizeMode="cover"
            />
            <Text style={[styles.previewLabel, { color: "#9CA3AF" }]}>
              {t2("upload.profilePicture")}
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.iconWrap}>
              <View style={[styles.iconCircle, { backgroundColor: colors.primary + "18" }]}>
                <Icon name="person" size={40} color={colors.primary} />
              </View>
            </View>

            <Text style={styles.subtitle}>{t2("upload.profilePictureDescription")}</Text>

            {TIPS.map((key, i) => (
              <View key={key} style={[styles.tipRow, { borderColor: "#E5E7EB" }]}>
                <View style={[styles.tipNum, { backgroundColor: colors.primary + "18" }]}>
                  <Text style={[styles.tipNumText, { color: colors.primary }]}>{i + 1}</Text>
                </View>
                <Text style={[styles.tipText, { color: colors.text }]}>{t2(`upload.${key}`)}</Text>
              </View>
            ))}
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
              {t2("upload.profilePictureUse")}
            </Button>
            <TouchableOpacity
              onPress={() =>
                partner.actions.setUploadDocuments({ ...partner.uploadDocuments, profilePicture: null })
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
                  profilePicture: { uri: result.uri, base64: result.base64 },
                })
              )
            }
            style={styles.btn}
            contentStyle={styles.btnContent}
          >
            {t2("upload.profilePictureTake")}
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
  preview: { width: 200, height: 200, borderRadius: 100 },
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

  tipRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  tipNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  tipNumText: { fontSize: 13, fontWeight: "700" },
  tipText: { fontSize: 14, lineHeight: 20, flex: 1 },

  footer: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 16 },
  btn: { borderRadius: 14 },
  btnContent: { height: 56 },
  retakeBtn: { alignItems: "center", marginTop: 16 },
  retakeText: { fontSize: 14, fontWeight: "500" },
});
