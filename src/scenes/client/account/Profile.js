import React, { useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme, Text, TextInput, Divider, Modal, Portal } from "react-native-paper";
import Icon from "@expo/vector-icons/MaterialIcons";
import { t } from "_utils/lang";
import { useUser } from "_hooks";
import { Button, LoadingV2 } from "_atoms";

export default function ProfileScene({ navigation }) {
  const { colors } = useTheme();
  const user = useUser();
  const insets = useSafeAreaInsets();

  const [editVisible, setEditVisible] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [editUser, setEditUser] = useState({});

  if (user.isLoading) return <LoadingV2 />;

  const u = user.user;
  const initials =
    `${u.firstName?.charAt(0) ?? ""}${u.lastName?.charAt(0) ?? ""}`.toUpperCase() || "?";

  const openEdit = () => {
    setEditUser({ firstName: u.firstName, lastName: u.lastName });
    setEditVisible(true);
  };

  const saveEdit = () => {
    user.actions.saveChanges({ firstName: editUser.firstName, lastName: editUser.lastName }, () => {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, () => {});
    setEditVisible(false);
  };

  const bottomPadding = Math.max(insets.bottom + 12, 24);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={["top", "bottom"]}>

      {/* Edit bottom sheet */}
      <Portal>
        <Modal
          visible={editVisible}
          onDismiss={() => setEditVisible(false)}
          style={{ justifyContent: "flex-end" }}
          contentContainerStyle={[styles.sheet, { backgroundColor: colors.background, paddingBottom: bottomPadding }]}
        >
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <View style={styles.handle} />
            <Text variant="titleMedium" style={[styles.sheetTitle, { color: colors.text }]}>
              {t("profile.edit")}
            </Text>
            <TextInput
              mode="outlined"
              label={t("form.firstName") || "First name"}
              value={editUser.firstName}
              onChangeText={(v) => setEditUser({ ...editUser, firstName: v })}
              style={styles.input}
              outlineStyle={{ borderRadius: 12 }}
            />
            <TextInput
              mode="outlined"
              label={t("form.lastName") || "Last name"}
              value={editUser.lastName}
              onChangeText={(v) => setEditUser({ ...editUser, lastName: v })}
              style={styles.input}
              outlineStyle={{ borderRadius: 12 }}
            />
            <View style={styles.sheetActions}>
              <Button mode="contained" onPress={saveEdit} style={styles.sheetBtn} contentStyle={{ height: 50 }}>
                {t("profile.saveChanges")}
              </Button>
              <Button
                mode="outlined"
                onPress={() => setEditVisible(false)}
                style={[styles.sheetBtn, { borderColor: "#9CA3AF" }]}
                contentStyle={{ height: 50 }}
                textColor="#9CA3AF"
              >
                {t("profile.cancel")}
              </Button>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </Portal>

      {/* Delete confirmation sheet */}
      <Portal>
        <Modal
          visible={deleteVisible}
          onDismiss={() => setDeleteVisible(false)}
          style={{ justifyContent: "flex-end" }}
          contentContainerStyle={[styles.sheet, { backgroundColor: colors.background, paddingBottom: bottomPadding }]}
        >
          <View style={styles.handle} />
          <View style={{ alignItems: "center", padding: 8, marginBottom: 16 }}>
            <View style={[styles.deleteIcon, { backgroundColor: "#FEE2E2" }]}>
              <Icon name="warning" size={32} color={colors.error} />
            </View>
            <Text variant="titleMedium" style={{ fontWeight: "bold", color: colors.text, marginTop: 12 }}>
              {t("profile.deleteConfirm")}
            </Text>
            <Text style={{ color: "#9CA3AF", textAlign: "center", marginTop: 8, lineHeight: 20 }}>
              {t("profile.deleteWarning")}
            </Text>
          </View>
          <Button
            mode="contained"
            onPress={() => { setDeleteVisible(false); user.actions.deleteAccount(); }}
            style={{ borderRadius: 12, backgroundColor: colors.error, marginBottom: 10 }}
            contentStyle={{ height: 50 }}
          >
            {t("profile.deleteAccount")}
          </Button>
          <Button
            mode="outlined"
            onPress={() => setDeleteVisible(false)}
            style={{ borderRadius: 12, borderColor: "#9CA3AF" }}
            contentStyle={{ height: 50 }}
            textColor="#9CA3AF"
          >
            {t("profile.cancel")}
          </Button>
        </Modal>
      </Portal>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Back button */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        {/* Hero */}
        <View style={styles.hero}>
          <View style={[styles.heroAvatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.heroAvatarText}>{initials}</Text>
          </View>
          <Text style={[styles.heroName, { color: colors.text }]}>
            {`${u.firstName ?? ""} ${u.lastName ?? ""}`}
          </Text>
          <Text style={{ color: "#9CA3AF", fontSize: 14, marginTop: 4 }}>{u.phoneNumber ?? ""}</Text>

          {showSuccess && (
            <View style={[styles.successBanner, { backgroundColor: colors.primary + "18" }]}>
              <Icon name="check-circle" size={16} color={colors.primary} />
              <Text style={{ color: colors.primary, fontSize: 13, marginLeft: 6, fontWeight: "600" }}>
                {t("profile.sucessfullySaved")}
              </Text>
            </View>
          )}
        </View>

        {/* Info card */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: "#9CA3AF" }]}>
            {(t("form.personalInfo") || "PERSONAL INFO").toUpperCase()}
          </Text>
          <View style={[styles.infoCard, { backgroundColor: colors.primary + "18" }]}>
            <InfoRow label={t("form.firstName") || "First name"} value={u.firstName} colors={colors} />
            <Divider />
            <InfoRow label={t("form.lastName") || "Last name"} value={u.lastName} colors={colors} />
            <Divider />
            <InfoRow label={t("form.phoneNumber") || "Phone"} value={u.phoneNumber} colors={colors} last />
          </View>
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <Button
            mode="outlined"
            icon="pencil"
            onPress={openEdit}
            style={[styles.actionBtn, { borderColor: colors.primary }]}
            contentStyle={{ height: 50 }}
          >
            {t("profile.edit")}
          </Button>
          <Button
            mode="outlined"
            icon="delete"
            onPress={() => setDeleteVisible(true)}
            style={[styles.actionBtn, { borderColor: colors.error }]}
            contentStyle={{ height: 50 }}
            textColor={colors.error}
          >
            {t("profile.deleteAccount")}
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const InfoRow = ({ label, value, colors, last }) => (
  <View style={[styles.infoRow, last && { borderBottomWidth: 0 }]}>
    <Text style={{ color: "#9CA3AF", fontSize: 13 }}>{label}</Text>
    <Text style={{ color: colors.text, fontSize: 14, fontWeight: "500" }}>{value || "—"}</Text>
  </View>
);

const styles = StyleSheet.create({
  screen: { flex: 1 },
  backBtn: { marginTop: 8, marginLeft: 20, width: 40, height: 40, justifyContent: "center" },
  hero: { alignItems: "center", paddingVertical: 24, paddingHorizontal: 24 },
  heroAvatar: {
    width: 72, height: 72, borderRadius: 36,
    justifyContent: "center", alignItems: "center", marginBottom: 14,
  },
  heroAvatarText: { color: "#fff", fontWeight: "bold", fontSize: 26 },
  heroName: { fontSize: 20, fontWeight: "700" },
  successBanner: {
    flexDirection: "row", alignItems: "center",
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, marginTop: 14,
  },
  section: { paddingHorizontal: 24, marginBottom: 24, gap: 12 },
  sectionTitle: { fontSize: 11, fontWeight: "700", letterSpacing: 0.8, marginBottom: 8 },
  infoCard: { borderRadius: 14, overflow: "hidden" },
  infoRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 14,
  },
  actionBtn: { borderRadius: 12 },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 24, paddingTop: 12 },
  handle: { alignSelf: "center", width: 40, height: 4, borderRadius: 2, backgroundColor: "#e0e0e0", marginBottom: 16 },
  sheetTitle: { fontWeight: "700", marginBottom: 16 },
  input: { marginBottom: 12 },
  sheetActions: { marginTop: 8, gap: 12 },
  sheetBtn: { borderRadius: 12 },
  deleteIcon: { width: 64, height: 64, borderRadius: 32, justifyContent: "center", alignItems: "center" },
});
