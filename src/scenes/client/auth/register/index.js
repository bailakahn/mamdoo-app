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
  Linking,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme, Text } from "react-native-paper";
import Icon from "@expo/vector-icons/MaterialIcons";
import { t } from "_utils/lang";
import { useUser } from "_hooks";
import { Button, LoadingV2 } from "_atoms";

export default function Register({ navigation }) {
  const { colors } = useTheme();
  const user = useUser();
  const insets = useSafeAreaInsets();
  const [hidePin, setHidePin] = useState(true);
  const [firstNameFocused, setFirstNameFocused] = useState(false);
  const [lastNameFocused, setLastNameFocused] = useState(false);
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [pinFocused, setPinFocused] = useState(false);

  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const lastNameRef = useRef(null);
  const phoneRef = useRef(null);
  const pinRef = useRef(null);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const show = Keyboard.addListener(showEvent, () => setKeyboardVisible(true));
    const hide = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false));
    return () => { show.remove(); hide.remove(); };
  }, []);

  if (user.isLoading) return <LoadingV2 />;

  const canSubmit =
    user.formUser.firstName &&
    user.formUser.lastName &&
    user.formUser.phoneNumber &&
    user.formUser.pin;

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
          <Text style={[styles.title, { color: colors.text }]}>{t("form.registerHeader")}</Text>
          <Text style={styles.subtitle}>{t("form.registerSubtitle")}</Text>

          {/* First name */}
          <View
            style={[
              styles.inputWrap,
              { borderColor: firstNameFocused ? colors.primary : "#D1D5DB", borderWidth: firstNameFocused ? 2 : 1 },
            ]}
          >
            <RNTextInput
              style={[styles.inputField, { color: colors.text }]}
              placeholder={t("form.firstName")}
              placeholderTextColor="#9CA3AF"
              value={user.formUser.firstName}
              onChangeText={(firstName) => user.actions.setFormUser({ ...user.formUser, firstName })}
              onFocus={() => setFirstNameFocused(true)}
              onBlur={() => setFirstNameFocused(false)}
              maxLength={15}
              returnKeyType="next"
              onSubmitEditing={() => lastNameRef.current?.focus()}
            />
          </View>

          {/* Last name */}
          <View
            style={[
              styles.inputWrap,
              { borderColor: lastNameFocused ? colors.primary : "#D1D5DB", borderWidth: lastNameFocused ? 2 : 1 },
            ]}
          >
            <RNTextInput
              ref={lastNameRef}
              style={[styles.inputField, { color: colors.text }]}
              placeholder={t("form.lastName")}
              placeholderTextColor="#9CA3AF"
              value={user.formUser.lastName}
              onChangeText={(lastName) => user.actions.setFormUser({ ...user.formUser, lastName })}
              onFocus={() => setLastNameFocused(true)}
              onBlur={() => setLastNameFocused(false)}
              maxLength={15}
              returnKeyType="next"
              onSubmitEditing={() => phoneRef.current?.focus()}
            />
          </View>

          {/* Phone */}
          <View
            style={[
              styles.inputWrap,
              { borderColor: phoneFocused ? colors.primary : "#D1D5DB", borderWidth: phoneFocused ? 2 : 1 },
            ]}
          >
            <Text style={[styles.phonePrefix, { color: colors.text }]}>+224</Text>
            <View style={styles.phoneDivider} />
            <RNTextInput
              ref={phoneRef}
              style={[styles.inputField, { color: colors.text }]}
              placeholder={t("form.phoneNumberPlaceholder")}
              placeholderTextColor="#9CA3AF"
              value={user.formUser.phoneNumber}
              onChangeText={(phoneNumber) => {
                user.actions.setFormUser({ ...user.formUser, phoneNumber });
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
              placeholder={t("form.pinChoose")}
              placeholderTextColor="#9CA3AF"
              value={user.formUser.pin}
              onChangeText={(pin) => {
                user.actions.setFormUser({ ...user.formUser, pin });
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

          {user.formError ? (
            <Text style={[styles.errorText, { color: colors.error }]}>{user.formError}</Text>
          ) : null}
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: keyboardVisible ? 20 : Math.max(insets.bottom + 16, 24) }]}>
          <Button
            mode="contained"
            onPress={user.actions.saveUser}
            disabled={!canSubmit}
            style={styles.btn}
            contentStyle={styles.btnContent}
          >
            {t("form.start")}
          </Button>

          <Text style={styles.privacy}>
            <Text style={{ color: "#9CA3AF" }}>{t("main.privacyPolicyText")} </Text>
            <Text
              style={[styles.privacyLink, { color: colors.primary }]}
              onPress={() => Linking.openURL("https://www.mamdoo.app/fr/policy")}
            >
              {t("main.privacyPolicyLink")}
            </Text>
          </Text>

          <View style={styles.switchRow}>
            <Text style={[styles.switchText, { color: colors.text }]}>
              {t("form.alreadyHaveAccount")}
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("Login")}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={[styles.switchLink, { color: colors.primary }]}>
                {t("form.login")}
              </Text>
            </TouchableOpacity>
          </View>
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
  inputField: { flex: 1, paddingHorizontal: 16, fontSize: 16 },
  eyeBtn: { paddingHorizontal: 14 },

  errorText: { fontSize: 14, marginTop: 4 },

  footer: { paddingHorizontal: 24, paddingTop: 12 },
  btn: { borderRadius: 14 },
  btnContent: { height: 56 },

  privacy: { textAlign: "center", fontSize: 12, marginTop: 14, lineHeight: 18 },
  privacyLink: { fontWeight: "600" },

  switchRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
    marginTop: 12,
  },
  switchText: { fontSize: 14 },
  switchLink: { fontSize: 14, fontWeight: "700" },
});
