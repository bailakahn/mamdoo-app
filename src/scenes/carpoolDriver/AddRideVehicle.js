import React, { useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { Text, useTheme, TextInput as PaperInput } from "react-native-paper";
import { Picker } from "@react-native-picker/picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "_atoms";
import { StepHeader } from "_molecules";
import { useApi } from "_api";
import { useApp } from "_hooks";
import { t2, lang } from "_utils/lang";

// The reverse direction of covoiturage signup: a carpool driver registering the
// vehicle they would use for ride-hailing, without switching apps to do it.
// Setting a cab alone does not make anyone dispatchable — that still needs ops
// approval and going online, both entirely separate from this screen.
export default function CarpoolAddRideVehicle({ navigation }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const getRequest = useApi();
  const app = useApp();

  const [cabTypeId, setCabTypeId] = useState(app.cabTypes?.[0]?._id || null);
  const [model, setModel] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const canSubmit = !!cabTypeId && model.length > 0 && licensePlate.length > 0;

  const onSubmit = async () => {
    setError(null);
    setBusy(true);
    const result = await getRequest({
      method: "POST",
      endpoint: "drivers/addCab",
      params: { model, licensePlate, cabTypeId },
    }).catch((err) => ({ error: err }));
    setBusy(false);

    if (result?.success) navigation.goBack();
    else setError(t2("carpoolDriver.errorGeneric"));
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <StepHeader
        title={t2("carpoolDriver.addRideVehicle")}
        subtitle={t2("carpoolDriver.addRideVehicleSubtitle")}
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.body, { paddingBottom: Math.max(insets.bottom + 24, 32) }]}
      >
        <Text style={[styles.pickerLabel, { color: colors.placeholder }]}>
          {t2("carpoolDriver.vehicleType")}
        </Text>
        <View style={[styles.pickerWrap, { borderColor: colors.border }]}>
          <Picker selectedValue={cabTypeId} onValueChange={setCabTypeId}>
            {(app.cabTypes || []).map(({ _id, description }) => (
              <Picker.Item key={_id} label={description?.[lang] || description?.fr} value={_id} />
            ))}
          </Picker>
        </View>

        <PaperInput
          mode="outlined"
          label={t2("carpoolDriver.carModel")}
          value={model}
          onChangeText={setModel}
          style={styles.input}
        />
        <PaperInput
          mode="outlined"
          label={t2("carpoolDriver.carPlate")}
          value={licensePlate}
          onChangeText={setLicensePlate}
          autoCapitalize="characters"
          style={styles.input}
        />

        {!!error && (
          <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
        )}

        <Button
          mode="contained"
          onPress={onSubmit}
          disabled={!canSubmit}
          loading={busy}
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
  body: { paddingHorizontal: 20 },
  pickerLabel: { fontSize: 13, marginBottom: 4, marginTop: 8 },
  pickerWrap: { borderWidth: 1, borderRadius: 12, marginBottom: 16, overflow: "hidden" },
  input: { marginBottom: 4 },
  error: { fontSize: 13, marginTop: 6 },
  button: { marginTop: 20 },
});
