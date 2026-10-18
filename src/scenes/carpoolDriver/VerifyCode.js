import React, { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { Text, useTheme, TextInput as PaperInput } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "_atoms";
import { StepHeader } from "_molecules";
import { useCarpoolAuth } from "_hooks/carpoolDriver";
import { t2 } from "_utils/lang";

// Proves whoever is holding this phone right now actually owns the number —
// true whether the number belongs to a brand new human or an existing ride
// driver reusing their identity for covoiturage. What happens after differs:
// a returning driver goes straight to Home; a new one still needs a name and a
// pin, decided by needsProfile on the session this screen already has.
const RESEND_GAP_SECONDS = 30;

export default function CarpoolVerifyCode({ navigation }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const carpoolAuth = useCarpoolAuth();
  const [code, setCode] = useState("");
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  // Seconds before another code can be asked for; starts at 30 because sign-up
  // has just sent one.
  const [resendIn, setResendIn] = useState(RESEND_GAP_SECONDS);

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendIn]);

  const onResend = async () => {
    setError(null);
    const result = await carpoolAuth.actions.resendCode();
    if (result?.success) {
      setNotice(t2("carpoolDriver.codeResent"));
      setResendIn(result.resendAfterSeconds || RESEND_GAP_SECONDS);
    } else {
      setError(t2(result?.code || result?.error?.code || "carpoolDriver.errorGeneric"));
    }
  };

  // No explicit navigation on success: this screen lives in the Auth stack,
  // which the root only renders while the session is incomplete. Verifying
  // updates that session, the root re-evaluates, and it swaps to whichever is
  // next — CompleteProfile for a new driver, the Home tabs for a returning one.
  const onSubmit = async () => {
    setError(null);
    setNotice(null);
    const result = await carpoolAuth.actions.verifyCode(code);
    if (!result?.success) {
      setError(t2(result?.code || "carpoolDriver.errorInvalidCode"));
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <StepHeader
        title={t2("carpoolDriver.verifyTitle")}
        subtitle={t2("carpoolDriver.verifySubtitle")}
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.body,
          { paddingBottom: Math.max(insets.bottom + 24, 32) },
        ]}
      >
        <PaperInput
          mode="outlined"
          label={t2("carpoolDriver.code")}
          value={code}
          onChangeText={(v) => setCode(v.replace(/\D/g, ""))}
          keyboardType="number-pad"
          maxLength={6}
          style={styles.input}
        />

        {!!error && (
          <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
        )}
        {!!notice && !error && (
          <Text style={[styles.error, { color: colors.primary }]}>{notice}</Text>
        )}

        <Button
          mode="contained"
          onPress={onSubmit}
          disabled={code.length < 4}
          loading={carpoolAuth.isLoading}
          style={styles.button}
        >
          {t2("carpoolDriver.continue")}
        </Button>

        <Button mode="text" onPress={onResend} disabled={resendIn > 0} style={styles.button}>
          {resendIn > 0
            ? t2("carpoolDriver.resendCodeIn", { seconds: resendIn })
            : t2("carpoolDriver.resendCode")}
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  body: { paddingHorizontal: 24 },
  input: { width: "100%" },
  error: { fontSize: 13, marginTop: 10 },
  button: { width: "100%", marginTop: 20 },
});
