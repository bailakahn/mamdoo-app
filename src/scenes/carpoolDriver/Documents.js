import React, { useState, useCallback } from "react";
import { View, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import Icon from "@expo/vector-icons/MaterialIcons";
import { Button } from "_atoms";
import { StepHeader } from "_molecules";
import { useCarpool } from "_hooks/carpoolDriver";
import useUpload from "_hooks/partner/useUpload";
import { t2 } from "_utils/lang";

// One screen for the whole checklist rather than one per document, because the
// checklist itself is configured server-side and can change shape — a fixed set
// of dedicated screens would need a release every time it did.
export default function CarpoolDocuments({ navigation, route }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const carpool = useCarpool();
  const upload = useUpload();
  const carId = route.params?.carId;
  const [uploadingKey, setUploadingKey] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useFocusEffect(
    useCallback(() => {
      carpool.actions.loadDocuments(carId);
    }, [carId])
  );

  const onUpload = (entry) => {
    upload.actions.takePhoto(async ({ uri }) => {
      setUploadingKey(entry.key);
      await carpool.actions.uploadDocument(entry.key, uri, entry.scope === "car" ? carId : undefined);
      setUploadingKey(null);
    });
  };

  const onSubmit = async () => {
    setSubmitError(null);
    setSubmitting(true);
    const result = await carpool.actions.submitDocuments(carId);
    setSubmitting(false);
    if (result) navigation.goBack();
    else setSubmitError(t2("carpoolDriver.errorGeneric"));
  };

  const allRequiredDone = carpool.documents
    .filter((d) => d.required)
    .every((d) => d.uploaded);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <StepHeader
        title={t2("carpoolDriver.documentsTitle")}
        subtitle={t2("carpoolDriver.documentsSubtitle")}
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={[styles.body, { paddingBottom: Math.max(insets.bottom + 24, 32) }]}
      >
        {carpool.documents.map((entry) => {
          const busy = uploadingKey === entry.key;
          const disabled = entry.scope === "car" && !carId;

          return (
            <TouchableOpacity
              key={entry.key}
              onPress={() => !busy && !disabled && onUpload(entry)}
              disabled={disabled}
              activeOpacity={0.7}
              style={[
                styles.row,
                {
                  borderColor: entry.uploaded ? colors.primary : colors.border,
                  opacity: disabled ? 0.5 : 1,
                },
              ]}
            >
              <Icon
                name={entry.uploaded ? "check-circle" : "camera-alt"}
                size={24}
                color={entry.uploaded ? colors.primary : colors.placeholder}
              />
              <View style={styles.rowText}>
                <Text style={[styles.rowLabel, { color: colors.text }]}>
                  {entry.labelFr}
                  {!entry.required && (
                    <Text style={{ color: colors.placeholder }}> · {t2("carpoolDriver.optional")}</Text>
                  )}
                </Text>
                {disabled && (
                  <Text style={[styles.rowHint, { color: colors.placeholder }]}>
                    {t2("carpoolDriver.addCarFirst")}
                  </Text>
                )}
              </View>
              {busy ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <Icon name="chevron-right" size={24} color={colors.placeholder} />
              )}
            </TouchableOpacity>
          );
        })}

        {!!submitError && (
          <Text style={[styles.error, { color: colors.error }]}>{submitError}</Text>
        )}

        <Button
          mode="contained"
          onPress={onSubmit}
          disabled={!allRequiredDone}
          loading={submitting}
          style={styles.submitButton}
        >
          {t2("carpoolDriver.submitDocuments")}
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  body: { paddingHorizontal: 20, paddingTop: 4 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderWidth: 1.5,
    borderRadius: 14,
    minHeight: 64,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  rowText: { flex: 1 },
  rowLabel: { fontSize: 15, fontWeight: "600" },
  rowHint: { fontSize: 12, marginTop: 2 },
  error: { fontSize: 13, marginBottom: 12 },
  submitButton: { marginTop: 8 },
});
