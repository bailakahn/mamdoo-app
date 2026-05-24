import React, { useState } from "react";
import { View, Image as RNImage, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
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
  const [localUri, setLocalUri] = useState(null);

  const stored = partner.uploadDocuments?.profilePicture;
  const status = stored?.status ?? "idle";
  const previewUri = localUri || stored?.uri;

  const handleUse = () => {
    partner.actions.uploadDocument("profilePicture", localUri);
    navigation.navigate("Upload");
  };

  const handleRetake = () => {
    setLocalUri(null);
  };

  const handleRetry = () => {
    partner.actions.uploadDocument("profilePicture", stored.uri);
  };

  const handleTakePhoto = () => {
    upload.actions.takePhoto((result) => setLocalUri(result.uri));
  };

  // Locked — submitted for review
  if (partner.documentsSubmitted) {
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={["top", "bottom"]}>
        <UploadHeader title={t2("upload.profilePicture")} navigation={navigation} />
        <View style={styles.centerContent}>
          <Icon name="check-circle" size={64} color={colors.primary} />
          <Text style={[styles.lockedTitle, { color: colors.text }]}>{t2("upload.docComplete")}</Text>
          <Text style={styles.lockedSub}>{t2("upload.docSubmitted")}</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Photo taken locally — awaiting "use" confirmation
  if (localUri) {
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={["top", "bottom"]}>
        <UploadHeader title={t2("upload.profilePicture")} navigation={navigation} />
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.previewWrap}>
            <RNImage source={{ uri: localUri }} style={styles.preview} resizeMode="cover" />
          </View>
        </ScrollView>
        <View style={styles.footer}>
          <Button mode="contained" onPress={handleUse} style={styles.btn} contentStyle={styles.btnContent}>
            {t2("upload.profilePictureUse")}
          </Button>
          <TouchableOpacity onPress={handleRetake} style={styles.retakeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={[styles.retakeText, { color: colors.error }]}>{t2("upload.takeAgain")}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Uploading — in progress
  if (status === "uploading") {
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={["top", "bottom"]}>
        <UploadHeader title={t2("upload.profilePicture")} navigation={navigation} />
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.uploadingText, { color: colors.primary }]}>{t2("upload.docUploading")}</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Already uploaded (this session or from DB on resume)
  if (status === "uploaded") {
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={["top", "bottom"]}>
        <UploadHeader title={t2("upload.profilePicture")} navigation={navigation} />
        <View style={styles.centerContent}>
          {previewUri ? (
            <RNImage source={{ uri: previewUri }} style={styles.preview} resizeMode="cover" />
          ) : (
            <View style={[styles.uploadedCircle, { backgroundColor: colors.primary + "18" }]}>
              <Icon name="check" size={48} color={colors.primary} />
            </View>
          )}
          <Text style={[styles.lockedTitle, { color: colors.text }]}>{t2("upload.docComplete")}</Text>
        </View>
        <View style={styles.footer}>
          <Button mode="outlined" onPress={handleTakePhoto} style={[styles.btn, { borderColor: colors.primary + "60" }]} contentStyle={styles.btnContent}>
            {t2("upload.takeAgain")}
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  // Upload failed — show retry
  if (status === "error") {
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={["top", "bottom"]}>
        <UploadHeader title={t2("upload.profilePicture")} navigation={navigation} />
        <View style={styles.centerContent}>
          {stored?.uri && <RNImage source={{ uri: stored.uri }} style={styles.preview} resizeMode="cover" />}
          <Text style={[styles.errorText, { color: colors.error }]}>{t2("upload.docError")}</Text>
        </View>
        <View style={styles.footer}>
          <Button mode="contained" onPress={handleRetry} style={styles.btn} contentStyle={styles.btnContent}>
            {t2("upload.docError")}
          </Button>
          <TouchableOpacity onPress={handleTakePhoto} style={styles.retakeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={[styles.retakeText, { color: colors.text }]}>{t2("upload.takeAgain")}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Idle — normal take photo flow
  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={["top", "bottom"]}>
      <UploadHeader title={t2("upload.profilePicture")} navigation={navigation} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
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
      </ScrollView>
      <View style={styles.footer}>
        <Button mode="contained" onPress={handleTakePhoto} style={styles.btn} contentStyle={styles.btnContent}>
          {t2("upload.profilePictureTake")}
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16 },

  centerContent: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 32, gap: 16 },

  previewWrap: { alignItems: "center", paddingTop: 24 },
  preview: { width: "65%", aspectRatio: 1, borderRadius: 999 },

  uploadedCircle: { width: 100, height: 100, borderRadius: 50, justifyContent: "center", alignItems: "center" },

  lockedTitle: { fontSize: 18, fontWeight: "700", textAlign: "center" },
  lockedSub: { fontSize: 14, color: "#9CA3AF", textAlign: "center" },
  uploadingText: { fontSize: 15, fontWeight: "500" },
  errorText: { fontSize: 14, textAlign: "center" },

  iconWrap: { alignItems: "center", marginBottom: 16 },
  iconCircle: { width: 80, height: 80, borderRadius: 40, justifyContent: "center", alignItems: "center" },
  subtitle: { fontSize: 15, color: "#9CA3AF", lineHeight: 22, marginBottom: 24 },

  tipRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 12 },
  tipNum: { width: 28, height: 28, borderRadius: 14, justifyContent: "center", alignItems: "center", flexShrink: 0 },
  tipNumText: { fontSize: 13, fontWeight: "700" },
  tipText: { fontSize: 14, lineHeight: 20, flex: 1 },

  footer: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 16 },
  btn: { borderRadius: 14 },
  btnContent: { height: 56 },
  retakeBtn: { alignItems: "center", marginTop: 16 },
  retakeText: { fontSize: 14, fontWeight: "500" },
});
