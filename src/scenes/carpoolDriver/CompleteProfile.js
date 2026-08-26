import React, { useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { Text, useTheme, TextInput as PaperInput } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "_atoms";
import { StepHeader } from "_molecules";
import { useCarpoolAuth } from "_hooks/carpoolDriver";
import { t2 } from "_utils/lang";

// Only reached for a brand new number — an existing ride driver reusing their
// identity already has a name and a pin and skips straight to Home from
// VerifyCode. The pin set here becomes this driver's pin on both surfaces,
// since it is the same account either way.
export default function CarpoolCompleteProfile({ navigation }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const carpoolAuth = useCarpoolAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState(null);

  const canSubmit = firstName.length > 0 && lastName.length > 0 && pin.length === 4;

  // No explicit navigation on success: completing the profile updates the
  // stored session, and the root — which only renders this Auth stack while the
  // session is incomplete — re-evaluates and swaps to the Home tabs on its own.
  const onSubmit = async () => {
    setError(null);
    const result = await carpoolAuth.actions.completeProfile({ firstName, lastName, pin });
    if (!result?.success) {
      setError(t2(result?.code || "carpoolDriver.errorGeneric"));
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <StepHeader
        title={t2("carpoolDriver.profileTitle")}
        subtitle={t2("carpoolDriver.profileSubtitle")}
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
          label={t2("carpoolDriver.firstName")}
          value={firstName}
          onChangeText={setFirstName}
          style={styles.input}
        />
        <PaperInput
          mode="outlined"
          label={t2("carpoolDriver.lastName")}
          value={lastName}
          onChangeText={setLastName}
          style={styles.input}
        />
        <PaperInput
          mode="outlined"
          label={t2("carpoolDriver.choosePin")}
          value={pin}
          onChangeText={(v) => setPin(v.replace(/\D/g, ""))}
          keyboardType="number-pad"
          secureTextEntry
          maxLength={4}
          style={styles.input}
        />

        {!!error && (
          <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
        )}

        <Button
          mode="contained"
          onPress={onSubmit}
          disabled={!canSubmit}
          loading={carpoolAuth.isLoading}
          style={styles.button}
        >
          {t2("carpoolDriver.continue")}
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  body: { paddingHorizontal: 24 },
  input: { width: "100%", marginBottom: 4 },
  error: { fontSize: 13, marginTop: 10 },
  button: { width: "100%", marginTop: 20 },
});
