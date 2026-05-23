import React, { useState, useEffect, useRef } from "react";
import {
  View,
  TextInput as RNTextInput,
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
import { t } from "_utils/lang";
import { Button, LoadingV2, OtpInput } from "_atoms";
import { useUser } from "_hooks";

export default function PinVerification({ navigation }) {
  const { colors } = useTheme();
  const user = useUser();
  const insets = useSafeAreaInsets();
  const [hidePin, setHidePin] = useState(true);
  const [pinFocused, setPinFocused] = useState(false);
  const [confirmFocused, setConfirmFocused] = useState(false);
  const [countdown, setCountdown] = useState(45);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const newPinRef = useRef(null);
  const confirmPinRef = useRef(null);

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

  const handleResend = () => {
    user.actions.resend();
    setCountdown(45);
  };

  if (user.isLoading) return <LoadingV2 />;

  const phone = user.user?.phoneNumber ? `+224 ${user.user.phoneNumber}` : "";

  const canSubmit =
    user.forgotPasswordUser.code?.length === 4 &&
    user.forgotPasswordUser.pin?.length === 4 &&
    user.forgotPasswordUser.pinValidation?.length === 4;

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
              <Icon name="shield" size={36} color={colors.primary} />
            </View>
          </View>

          <Text style={[styles.title, { color: colors.text }]}>{t("form.pinResetTitle")}</Text>
          <Text style={styles.subtitle}>
            {t("main.verificationSent")}
            {phone ? (
              <Text style={[styles.phoneHighlight, { color: colors.primary }]}>{phone}</Text>
            ) : null}
          </Text>

          {/* OTP */}
          <OtpInput
            value={user.forgotPasswordUser.code || ""}
            onChange={(code) => {
              user.actions.setForgotPasswordUser({ ...user.forgotPasswordUser, code });
              if (code.length === 4) newPinRef.current?.focus();
            }}
            error={!!user.verificationError}
          />

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

          {/* New PIN */}
          <View
            style={[
              styles.inputWrap,
              { borderColor: pinFocused ? colors.primary : "#D1D5DB", borderWidth: pinFocused ? 2 : 1, marginTop: 24 },
            ]}
          >
            <RNTextInput
              ref={newPinRef}
              style={[styles.inputField, { color: colors.text, paddingLeft: 16 }]}
              placeholder={t("form.newPin")}
              placeholderTextColor="#9CA3AF"
              value={user.forgotPasswordUser.pin}
              onChangeText={(pin) => {
                user.actions.setForgotPasswordUser({ ...user.forgotPasswordUser, pin });
                if (pin.length === 4) confirmPinRef.current?.focus();
              }}
              onFocus={() => setPinFocused(true)}
              onBlur={() => setPinFocused(false)}
              maxLength={4}
              keyboardType="number-pad"
              returnKeyType="next"
              secureTextEntry={hidePin}
            />
            <TouchableOpacity
              onPress={() => setHidePin(!hidePin)}
              style={styles.eyeBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Icon name={hidePin ? "visibility-off" : "visibility"} size={22} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Confirm PIN */}
          <View
            style={[
              styles.inputWrap,
              { borderColor: confirmFocused ? colors.primary : "#D1D5DB", borderWidth: confirmFocused ? 2 : 1 },
            ]}
          >
            <RNTextInput
              ref={confirmPinRef}
              style={[styles.inputField, { color: colors.text, paddingLeft: 16 }]}
              placeholder={t("form.pinValidation")}
              placeholderTextColor="#9CA3AF"
              value={user.forgotPasswordUser.pinValidation}
              onChangeText={(pinValidation) => {
                user.actions.setForgotPasswordUser({ ...user.forgotPasswordUser, pinValidation });
                if (pinValidation.length === 4) Keyboard.dismiss();
              }}
              onFocus={() => setConfirmFocused(true)}
              onBlur={() => setConfirmFocused(false)}
              maxLength={4}
              keyboardType="number-pad"
              returnKeyType="done"
              secureTextEntry={hidePin}
            />
            <TouchableOpacity
              onPress={() => setHidePin(!hidePin)}
              style={styles.eyeBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Icon name={hidePin ? "visibility-off" : "visibility"} size={22} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {user.verificationError ? (
            <Text style={[styles.errorText, { color: colors.error }]}>
              {user.verificationError}
            </Text>
          ) : null}
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: keyboardVisible ? 20 : Math.max(insets.bottom + 16, 24) }]}>
          <Button
            mode="contained"
            onPress={user.actions.resetPin}
            disabled={!canSubmit}
            style={styles.btn}
            contentStyle={styles.btnContent}
          >
            {t("main.resetPassword")}
          </Button>

          <TouchableOpacity
            onPress={() => navigation.navigate("Login")}
            style={styles.backLink}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={[styles.backLinkText, { color: colors.primary }]}>
              {t("form.backToLogin")}
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
  subtitle: { fontSize: 15, color: "#9CA3AF", textAlign: "center", lineHeight: 22, marginBottom: 28 },
  phoneHighlight: { fontWeight: "700" },

  resendRow: { alignItems: "center", marginTop: 16 },
  resendText: { fontSize: 14, fontWeight: "500" },

  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    height: 56,
    marginBottom: 16,
  },
  inputField: { flex: 1, paddingHorizontal: 16, fontSize: 16 },
  eyeBtn: { paddingHorizontal: 14 },

  errorText: { fontSize: 14, marginTop: 4, textAlign: "center" },

  footer: { paddingHorizontal: 24, paddingTop: 12 },
  btn: { borderRadius: 14 },
  btnContent: { height: 56 },

  backLink: { alignItems: "center", marginTop: 16 },
  backLinkText: { fontSize: 14, fontWeight: "500" },
});
