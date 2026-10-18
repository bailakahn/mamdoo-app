import React, { useState, useEffect } from "react";
import { View, ScrollView, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { Text, useTheme, TextInput as PaperInput } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "_atoms";
import { StepHeader } from "_molecules";
import { useCarpool } from "_hooks/carpoolDriver";
import { t2 } from "_utils/lang";

const SEAT_OPTIONS = [1, 2, 3, 4];

// Registering the car. Seats are a row of big number buttons rather than a
// stepper or a picker: it is the one field a driver must get exactly right, and
// tapping "3" is unambiguous in a way that +/- controls are not.
export default function CarpoolCarForm({ navigation, route }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const carpool = useCarpool();

  // A carId in the route means edit; none means a genuinely new car — this
  // used to always mean "edit the first car", which made adding a second car
  // impossible from here.
  const { carId } = route.params || {};
  const existing = carId ? carpool.profile?.cars?.find((c) => c._id === carId) || null : null;

  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [plate, setPlate] = useState("");
  const [color, setColor] = useState("");
  const [totalSeats, setTotalSeats] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!carpool.profile) carpool.actions.loadProfile();
  }, []);

  // useState's initial value only applies on the very first render, and the
  // profile this car comes from loads asynchronously — it is very often not
  // there yet on that first render. Sync once it (or a different car) arrives.
  useEffect(() => {
    if (!existing) return;
    setMake(existing.make || "");
    setModel(existing.model || "");
    setPlate(existing.plate || "");
    setColor(existing.color || "");
    setTotalSeats(existing.totalSeats || null);
  }, [existing?._id]);

  const canSave = model.trim() && plate.trim() && totalSeats;

  const onSave = async () => {
    setBusy(true);
    const result = await carpool.actions.saveCar({
      ...(existing && { carId: existing._id }),
      make: make.trim(),
      model: model.trim(),
      plate: plate.trim(),
      color: color.trim(),
      totalSeats,
    });
    setBusy(false);
    if (result?.success) navigation.navigate("HomeTab", { screen: "CarpoolDriverHome" });
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <StepHeader
          title={t2("carpoolDriver.carTitle")}
          subtitle={t2("carpoolDriver.carSubtitle")}
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
            label={t2("carpoolDriver.carModel")}
            value={model}
            onChangeText={setModel}
            style={styles.input}
          />
          <PaperInput
            mode="outlined"
            label={t2("carpoolDriver.carMake")}
            value={make}
            onChangeText={setMake}
            style={styles.input}
          />
          <PaperInput
            mode="outlined"
            label={t2("carpoolDriver.carPlate")}
            value={plate}
            onChangeText={setPlate}
            autoCapitalize="characters"
            style={styles.input}
          />
          <PaperInput
            mode="outlined"
            label={t2("carpoolDriver.carColor")}
            value={color}
            onChangeText={setColor}
            style={styles.input}
          />

          <Text style={[styles.seatsLabel, { color: colors.text }]}>
            {t2("carpoolDriver.seatsQuestion")}
          </Text>
          <Text style={[styles.seatsHint, { color: colors.placeholder }]}>
            {t2("carpoolDriver.seatsHint")}
          </Text>

          <View style={styles.seatsRow}>
            {SEAT_OPTIONS.map((n) => {
              const active = totalSeats === n;
              return (
                <TouchableOpacity
                  key={n}
                  onPress={() => setTotalSeats(n)}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={t2("carpoolDriver.seatsCount", { count: n })}
                  style={[
                    styles.seatBox,
                    {
                      borderColor: active ? colors.primary : colors.border,
                      backgroundColor: active ? colors.primary : "transparent",
                      borderWidth: active ? 2 : 1,
                    },
                  ]}
                >
                  <Text
                    style={[styles.seatNumber, { color: active ? "#fff" : colors.text }]}
                  >
                    {n}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Button
            mode="contained"
            icon="check"
            loading={busy}
            disabled={busy || !canSave}
            onPress={onSave}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            {t2("carpoolDriver.saveCar")}
          </Button>

          {!!existing && (
            <Text style={[styles.note, { color: colors.placeholder }]}>
              {t2("carpoolDriver.carReverifyNote")}
            </Text>
          )}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  body: { paddingHorizontal: 20 },
  input: { marginBottom: 12 },
  seatsLabel: { fontSize: 18, fontWeight: "600", marginTop: 12 },
  seatsHint: { fontSize: 14, marginTop: 4, marginBottom: 14 },
  seatsRow: { flexDirection: "row", gap: 12, marginBottom: 24 },
  seatBox: {
    flex: 1,
    height: 68,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  seatNumber: { fontSize: 26, fontWeight: "700" },
  button: { borderRadius: 12 },
  buttonContent: { height: 56 },
  note: { fontSize: 13, textAlign: "center", marginTop: 14, lineHeight: 19 },
});
