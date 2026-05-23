import React, { useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Keyboard,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme, Text } from "react-native-paper";
import Icon from "@expo/vector-icons/MaterialIcons";
import { t, t2 } from "_utils/lang";
import { Button, LoadingV2, OtpInput } from "_atoms";
import { usePartner } from "_hooks";

export default function Verification({ navigation }) {
  const { colors } = useTheme();
  const partner = usePartner();
  const insets = useSafeAreaInsets();
  const [countdown, setCountdown] = useState(45);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const show = Keyboard.addListener(showEvent, () => setKeyboardVisible(true));
    const hide = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false));
    return () => { show.remove(); hide.remove(); };
  }, []);

  useEffect(() => {
    if (partner.verificationCode?.length === 4) {
      partner.actions.verifyAccount();
    }
  }, [partner.verificationCode]);

  const handleResend = () => {
    partner.actions.resend();
    setCountdown(45);
  };

  if (partner.isLoading) return <LoadingV2 />;

  const phone = partner.partner?.phoneNumber ? `+224 ${partner.partner.phoneNumber}` : "";

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={["top"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Icon */}
          <View style={styles.iconWrap}>
            <View style={[styles.iconCircle, { backgroundColor: colors.primary + "18" }]}>
              <Icon name="sms" size={36} color={colors.primary} />
            </View>
          </View>

          <Text style={[styles.title, { color: colors.text }]}>{t("main.verifyAccount")}</Text>
          <Text style={styles.subtitle}>
            {t("main.verificationSent")}
            {phone ? (
              <Text style={[styles.phoneHighlight, { color: colors.primary }]}>{phone}</Text>
            ) : null}
          </Text>

          {/* OTP */}
          <OtpInput
            value={partner.verificationCode || ""}
            onChange={partner.actions.setVerificationCode}
            error={!!partner.verificationError}
          />

          {partner.verificationError ? (
            <Text style={[styles.errorText, { color: colors.error }]}>
              {partner.verificationError}
            </Text>
          ) : null}

          {/* Resend */}
          <TouchableOpacity
            onPress={countdown > 0 ? null : handleResend}
            style={styles.resendRow}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={[styles.resendText, { color: countdown > 0 ? "#9CA3AF" : colors.primary }]}>
              {countdown > 0
                ? `${t("form.resendIn")} ${countdown}s`
                : t("main.sendVerificationAgain")}
            </Text>
          </TouchableOpacity>
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: keyboardVisible ? 20 : Math.max(insets.bottom + 16, 24) }]}>
          <Button
            mode="contained"
            onPress={partner.actions.verifyAccount}
            disabled={!partner.verificationCode || partner.verificationCode.length < 4}
            style={styles.btn}
            contentStyle={styles.btnContent}
          >
            {t("main.verify")}
          </Button>

          <TouchableOpacity
            onPress={partner.actions.logout}
            style={styles.changeLink}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={[styles.changeLinkText, { color: colors.primary }]}>
              {t("main.editPhoneNumber")}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { paddingHorizontal: 24, paddingTop: 40, paddingBottom: 16 },

  iconWrap: { alignItems: "center", marginBottom: 28 },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },

  title: { fontSize: 28, fontWeight: "700", textAlign: "center", marginBottom: 8 },
  subtitle: { fontSize: 15, color: "#9CA3AF", textAlign: "center", lineHeight: 22, marginBottom: 32 },
  phoneHighlight: { fontWeight: "700" },

  errorText: { fontSize: 14, marginTop: 12, textAlign: "center" },

  resendRow: { alignItems: "center", marginTop: 20 },
  resendText: { fontSize: 14, fontWeight: "500" },

  footer: { paddingHorizontal: 24, paddingTop: 12 },
  btn: { borderRadius: 14 },
  btnContent: { height: 56 },

  changeLink: { alignItems: "center", marginTop: 16 },
  changeLinkText: { fontSize: 14, fontWeight: "500" },
});
