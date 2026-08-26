import React, { useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { Text, useTheme, TextInput as PaperInput } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "@expo/vector-icons/MaterialIcons";
import { Button } from "_atoms";
import { useCarpoolAuth } from "_hooks/carpoolDriver";
import { t2 } from "_utils/lang";

// The only question this screen asks is a phone number — on purpose. The app
// does not yet know whether this is a brand new human or an existing ride
// driver adding covoiturage, and asking for a name up front would be wrong for
// the second case. VerifyCode finds out which, right after the code confirms.
export default function CarpoolSignup({ navigation }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const carpoolAuth = useCarpoolAuth();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState(null);

  const canSubmit = phoneNumber.length === 9;

  const onSubmit = async () => {
    setError(null);
    const result = await carpoolAuth.actions.signup(phoneNumber);
    if (result?.success) {
      navigation.navigate("VerifyCode");
    } else {
      setError(t2(result?.code || "carpoolDriver.errorGeneric"));
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.body,
          { paddingTop: insets.top + 32, paddingBottom: Math.max(insets.bottom + 24, 32) },
        ]}
      >
        <View style={[styles.iconWrap, { backgroundColor: colors.primary + "18" }]}>
          <Icon name="people" size={32} color={colors.primary} />
        </View>

        <Text style={[styles.title, { color: colors.text }]}>
          {t2("carpoolDriver.signupTitle")}
        </Text>
        <Text style={[styles.subtitle, { color: colors.placeholder }]}>
          {t2("carpoolDriver.signupSubtitle")}
        </Text>

        <PaperInput
          mode="outlined"
          label={t2("carpoolDriver.phoneNumber")}
          value={phoneNumber}
          onChangeText={(v) => setPhoneNumber(v.replace(/\D/g, ""))}
          keyboardType="phone-pad"
          maxLength={9}
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
  body: { paddingHorizontal: 24, alignItems: "center" },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  title: { fontSize: 22, fontWeight: "700", textAlign: "center" },
  subtitle: { fontSize: 15, textAlign: "center", marginTop: 8, lineHeight: 21, marginBottom: 28 },
  input: { width: "100%" },
  error: { fontSize: 13, marginTop: 10, alignSelf: "flex-start" },
  button: { width: "100%", marginTop: 24 },
});
