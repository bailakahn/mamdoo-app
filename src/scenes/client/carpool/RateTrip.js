import React, { useState, useCallback } from "react";
import { View, ScrollView, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { Text, useTheme, TextInput as PaperInput } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import Icon from "@expo/vector-icons/MaterialIcons";
import { StepHeader, StarPicker } from "_molecules";
import { Button } from "_atoms";
import { useApi } from "_api";
import { t } from "_utils/lang";

// Rating the driver after a trip.
//
// One person at a time and skippable. Rating is genuinely optional — a rider who
// does not want to is not blocked from using the app, and pretending otherwise
// just produces pressured five-star noise that makes the whole signal useless.
export default function RateTrip({ navigation }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const getRequest = useApi();

  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const result = await getRequest({
      method: "GET",
      endpoint: "carpool/getPendingRatings",
    }).catch(() => null);
    setPending(result?.pending || []);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const current = pending[0];

  const next = () => {
    setScore(0);
    setNote("");
    const remaining = pending.slice(1);
    setPending(remaining);
    if (!remaining.length) navigation.navigate("CarpoolHome");
  };

  const submit = async () => {
    setBusy(true);
    await getRequest({
      method: "POST",
      endpoint: "carpool/submitRating",
      params: {
        tripId: current.tripId,
        rateeId: current.rateeId,
        score,
        note: note.trim() || null,
      },
    }).catch(() => null);
    setBusy(false);
    next();
  };

  if (loading) {
    return (
      <View style={[styles.screen, styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!current) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <StepHeader
          title={t("rate.noneTitle")}
          onBack={() => navigation.navigate("CarpoolHome")}
        />
        <View style={styles.center}>
          <Icon name="check-circle-outline" size={48} color="#1F6F43" />
          <Text style={styles.empty}>{t("rate.noneHint")}</Text>
        </View>
      </View>
    );
  }

  const labels = [
    t("rate.star1"),
    t("rate.star2"),
    t("rate.star3"),
    t("rate.star4"),
    t("rate.star5"),
  ];

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <StepHeader
          title={t("rate.driverTitle", { name: current.name })}
          subtitle={pending.length > 1 ? t("rate.remaining", { count: pending.length }) : undefined}
          onBack={() => navigation.navigate("CarpoolHome")}
        />

        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.body,
            { paddingBottom: Math.max(insets.bottom + 24, 32) },
          ]}
        >
          <StarPicker value={score} onChange={setScore} labels={labels} />

          {score > 0 && (
            <>
              <PaperInput
                mode="outlined"
                label={t("rate.noteLabel")}
                value={note}
                onChangeText={setNote}
                multiline
                numberOfLines={3}
                style={styles.input}
              />
              <Button
                mode="contained"
                icon="check"
                loading={busy}
                disabled={busy}
                onPress={submit}
                style={styles.button}
                contentStyle={styles.buttonContent}
              >
                {t("rate.submit")}
              </Button>
            </>
          )}

          <Button mode="text" onPress={next} disabled={busy} style={styles.skip}>
            {t("rate.skip")}
          </Button>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 12 },
  empty: { fontSize: 15, color: "#6B7280", textAlign: "center", lineHeight: 21 },
  body: { paddingHorizontal: 20, paddingTop: 20 },
  input: { marginTop: 24, marginBottom: 16 },
  button: { borderRadius: 12 },
  buttonContent: { height: 54 },
  skip: { marginTop: 12 },
});
