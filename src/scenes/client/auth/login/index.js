import React, { useState, useRef, useEffect } from "react";
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
import { useUser, useApp } from "_hooks";
import { Button, LoadingV2 } from "_atoms";

export default function Login({ navigation }) {
  const { colors } = useTheme();
  const app = useApp();
  const user = useUser();
  const insets = useSafeAreaInsets();
  const [hidePin, setHidePin] = useState(true);
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [pinFocused, setPinFocused] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const pinRef = useRef(null);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const show = Keyboard.addListener(showEvent, () => setKeyboardVisible(true));
    const hide = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false));
    return () => { show.remove(); hide.remove(); };
  }, []);

  if (user.isLoading) return <LoadingV2 />;

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
          <Text style={[styles.title, { color: colors.text }]}>{t("form.loginHeader")}</Text>
          <Text style={styles.subtitle}>{t("form.loginSubtitle")}</Text>

          {/* Phone number */}
          <View
            style={[
              styles.inputWrap,
              { borderColor: phoneFocused ? colors.primary : "#D1D5DB", borderWidth: phoneFocused ? 2 : 1 },
            ]}
          >
            <Text style={[styles.phonePrefix, { color: colors.text }]}>+224</Text>
            <View style={styles.phoneDivider} />
            <RNTextInput
              style={[styles.inputField, { color: colors.text }]}
              placeholder={t("form.phoneNumberPlaceholder")}
              placeholderTextColor="#9CA3AF"
              value={user.auth.phoneNumber}
              onChangeText={(phoneNumber) => {
                user.actions.setAuth({ ...user.auth, phoneNumber });
                if (phoneNumber.length === 9) pinRef.current?.focus();
              }}
              onFocus={() => setPhoneFocused(true)}
              onBlur={() => setPhoneFocused(false)}
              maxLength={9}
              keyboardType="number-pad"
              returnKeyType="next"
              onSubmitEditing={() => pinRef.current?.focus()}
            />
          </View>

          {/* PIN */}
          <View
            style={[
              styles.inputWrap,
              { borderColor: pinFocused ? colors.primary : "#D1D5DB", borderWidth: pinFocused ? 2 : 1 },
            ]}
          >
            <RNTextInput
              ref={pinRef}
              style={[styles.inputField, { color: colors.text, paddingLeft: 16 }]}
              placeholder={t("form.pin")}
              placeholderTextColor="#9CA3AF"
              value={user.auth.pin}
              onChangeText={(pin) => {
                user.actions.setAuth({ ...user.auth, pin });
                if (pin.length === 4) Keyboard.dismiss();
              }}
              onFocus={() => setPinFocused(true)}
              onBlur={() => setPinFocused(false)}
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

          {/* Forgot PIN */}
          <TouchableOpacity
            style={styles.forgotRow}
            onPress={() => navigation.navigate("ForgotPassword")}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={[styles.forgotText, { color: colors.primary }]}>
              {t("form.forgotPassword")}
            </Text>
          </TouchableOpacity>

          {user.formError ? (
            <Text style={[styles.errorText, { color: colors.error }]}>{user.formError}</Text>
          ) : null}
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: keyboardVisible ? 20 : Math.max(insets.bottom + 16, 24) }]}>
          <Button
            mode="contained"
            onPress={user.actions.loginUser}
            disabled={!user.auth.phoneNumber || !user.auth.pin}
            style={styles.btn}
            contentStyle={styles.btnContent}
          >
            {t("form.login")}
          </Button>

          <View style={styles.switchRow}>
            <Text style={[styles.switchText, { color: colors.text }]}>
              {t("form.notRegisteredYet")}
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("Register")}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={[styles.switchLink, { color: colors.primary }]}>
                {t("form.register")}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => app.actions.removeApp()}
            style={[styles.driverBtn, { borderColor: colors.primary + "60" }]}
          >
            <Icon name="directions-car" size={16} color={colors.primary} />
            <Text style={[styles.driverBtnText, { color: colors.primary }]}>
              {t("form.switchToDriver")}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { paddingHorizontal: 24, paddingTop: 52, paddingBottom: 24 },

  title: { fontSize: 28, fontWeight: "700", marginBottom: 4 },
  subtitle: { fontSize: 15, color: "#9CA3AF", marginBottom: 28 },

  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    height: 56,
    marginBottom: 16,
  },
  phonePrefix: { paddingHorizontal: 16, fontSize: 15, fontWeight: "600" },
  phoneDivider: { width: 1, height: 32, backgroundColor: "#E5E7EB" },
  inputField: { flex: 1, paddingHorizontal: 14, fontSize: 16 },
  eyeBtn: { paddingHorizontal: 14 },

  forgotRow: { alignSelf: "flex-end", marginTop: -4, marginBottom: 8 },
  forgotText: { fontSize: 14, fontWeight: "500" },
  errorText: { fontSize: 14, marginTop: 8 },

  footer: { paddingHorizontal: 24, paddingTop: 12 },
  btn: { borderRadius: 14 },
  btnContent: { height: 56 },

  switchRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
    marginTop: 16,
  },
  switchText: { fontSize: 14 },
  switchLink: { fontSize: 14, fontWeight: "700" },

  driverBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 13,
    marginTop: 12,
  },
  driverBtnText: { fontSize: 14, fontWeight: "600" },
});
