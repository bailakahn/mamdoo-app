import React, { useState, useEffect } from "react";
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
import { Button, LoadingV2 } from "_atoms";
import { useUser } from "_hooks";

export default function ForgotPassword({ navigation }) {
  const { colors } = useTheme();
  const user = useUser();
  const insets = useSafeAreaInsets();
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

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
          {/* Back */}
          <TouchableOpacity
            onPress={() => navigation.navigate("Login")}
            style={styles.backBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>

          {/* Icon */}
          <View style={styles.iconWrap}>
            <View style={[styles.iconCircle, { backgroundColor: colors.primary + "18" }]}>
              <Icon name="lock-reset" size={36} color={colors.primary} />
            </View>
          </View>

          {/* Copy */}
          <Text style={[styles.title, { color: colors.text }]}>{t("main.forgotPassword")}</Text>
          <Text style={styles.subtitle}>{t("main.forgotPasswordText")}</Text>

          {/* Phone input */}
          <View
            style={[
              styles.phoneWrap,
              { borderColor: phoneFocused ? colors.primary : "#D1D5DB", borderWidth: phoneFocused ? 2 : 1 },
            ]}
          >
            <Text style={[styles.phonePrefix, { color: colors.text }]}>+224</Text>
            <View style={styles.phoneDivider} />
            <RNTextInput
              style={[styles.phoneField, { color: colors.text }]}
              placeholder={t("form.phoneNumberPlaceholder")}
              placeholderTextColor="#9CA3AF"
              value={user.forgotPasswordUser.phoneNumber}
              onChangeText={(phoneNumber) =>
                user.actions.setForgotPasswordUser({ ...user.forgotPasswordUser, phoneNumber })
              }
              onFocus={() => setPhoneFocused(true)}
              onBlur={() => setPhoneFocused(false)}
              maxLength={9}
              keyboardType="number-pad"
              returnKeyType="done"
            />
          </View>

          {/* Error */}
          {user.forgotPasswordError ? (
            <Text style={[styles.errorText, { color: colors.error }]}>
              {user.forgotPasswordError}
            </Text>
          ) : null}

          <View style={{ flex: 1, minHeight: 24 }} />
        </ScrollView>

        {/* Footer */}
        <View style={[styles.footer, { paddingBottom: keyboardVisible ? 20 : Math.max(insets.bottom + 16, 24) }]}>
          <Button
            mode="contained"
            onPress={() => user.actions.sendForgotPinVerification(navigation)}
            disabled={!user.forgotPasswordUser.phoneNumber}
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
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 8 },

  backBtn: { width: 40, height: 40, justifyContent: "center", marginBottom: 16 },

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

  phoneWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    height: 56,
    marginBottom: 8,
  },
  phonePrefix: { paddingHorizontal: 16, fontSize: 15, fontWeight: "600" },
  phoneDivider: { width: 1, height: 32, backgroundColor: "#E5E7EB" },
  phoneField: { flex: 1, paddingHorizontal: 14, fontSize: 16 },

  errorText: { fontSize: 14, marginTop: 4 },

  footer: { paddingHorizontal: 24, paddingTop: 12 },
  btn: { borderRadius: 14 },
  btnContent: { height: 56 },

  backLink: { alignItems: "center", marginTop: 16 },
  backLinkText: { fontSize: 14, fontWeight: "500" },
});
