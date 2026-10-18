import React, { useState } from "react";
import { View, ScrollView, StyleSheet, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { useTheme, TextInput as PaperInput } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChoiceCard, StepHeader } from "_molecules";
import { Button } from "_atoms";
import { useApi } from "_api";
import { t } from "_utils/lang";

// The rider's side of §8. Types are offered as plain complaints — "I was at the
// stop" — rather than as the internal taxonomy, because a rider should never have
// to work out which category their problem belongs to.
//
// The result is reported honestly and immediately: decided now, or a person will
// look within 48 hours. Never a vague "thanks for your feedback".
const REASONS = [
  { type: "no_show_contested", icon: "person-pin-circle", key: "noShowContested", hintKey: "noShowContestedHint" },
  { type: "driver_late_contested", icon: "schedule", key: "driverLateContested" },
  { type: "ride_contested", icon: "not-interested", key: "rideContested" },
  { type: "unsafe_behaviour", icon: "report", key: "unsafeBehaviour", hintKey: "unsafeBehaviourHint" },
];

export default function ReportProblem({ navigation, route }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const getRequest = useApi();

  const { tripId, bookingId } = route.params || {};
  const [reason, setReason] = useState(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    const result = await getRequest({
      method: "POST",
      endpoint: "carpool/raiseDispute",
      params: { type: reason.type, tripId, bookingId, note: note.trim() || null },
    }).catch((err) => ({ error: err }));
    setBusy(false);

    if (!result?.success) {
      const code = result?.error?.code;
      Alert.alert(
        t("dispute.title"),
        code === "errors.carpoolDisputeAlreadyRaised"
          ? t("dispute.alreadyRaised")
          : t("dispute.failed")
      );
      return;
    }

    const message = !result.autoResolved
      ? t("dispute.sentHuman")
      : result.dispute?.outcome === "upheld"
      ? t("dispute.sentAuto")
      : t("dispute.sentAutoRejected");

    // Appealing only makes sense once there is a verdict to disagree with, and
    // not when it already went the rider's way — matches exactly what the
    // server itself enforces in appealDispute, so this is a shortcut to a
    // clearly-losing tap, not the real gate.
    const canAppeal = result.autoResolved && result.dispute?.outcome !== "upheld";

    Alert.alert(t("dispute.sentTitle"), message, [
      ...(canAppeal
        ? [{ text: t("dispute.appeal"), onPress: () => appeal(result.dispute._id) }]
        : []),
      { text: "OK", onPress: () => navigation.goBack() },
    ]);
  };

  const appeal = async (disputeId) => {
    const result = await getRequest({
      method: "POST",
      endpoint: "carpool/appealDispute",
      params: { disputeId },
    }).catch((err) => ({ error: err }));

    Alert.alert(
      t("dispute.title"),
      result?.success ? t("dispute.appealSent") : t("dispute.appealFailed"),
      [{ text: "OK", onPress: () => navigation.goBack() }]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <StepHeader title={t("dispute.title")} onBack={() => navigation.goBack()} />

        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.body,
            { paddingBottom: Math.max(insets.bottom + 24, 32) },
          ]}
        >
          {REASONS.map((r) => (
            <ChoiceCard
              key={r.type}
              icon={r.icon}
              title={t(`dispute.${r.key}`)}
              subtitle={r.hintKey ? t(`dispute.${r.hintKey}`) : undefined}
              selected={reason?.type === r.type}
              onPress={() => setReason(r)}
            />
          ))}

          {!!reason && (
            <>
              <PaperInput
                mode="outlined"
                label={t("dispute.noteLabel")}
                value={note}
                onChangeText={setNote}
                multiline
                numberOfLines={4}
                style={styles.input}
              />
              <Button
                mode="contained"
                icon="send"
                loading={busy}
                disabled={busy}
                onPress={submit}
                style={styles.button}
                contentStyle={styles.buttonContent}
              >
                {t("dispute.submit")}
              </Button>
            </>
          )}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  body: { paddingHorizontal: 20 },
  input: { marginTop: 12, marginBottom: 16 },
  button: { borderRadius: 12 },
  buttonContent: { height: 54 },
});
