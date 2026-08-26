import React, { useEffect } from "react";
import { View, ScrollView, ActivityIndicator, StyleSheet } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChoiceCard, StepHeader } from "_molecules";
import { useCarpool } from "_hooks";
import { t } from "_utils/lang";

// Corridor colours match the real map riders already know: red, blue, purple.
// Named here rather than taken from the API so a missing colourCode can never
// render an invisible swatch.
const CORRIDOR_COLORS = {
  red: "#C8322D",
  blue: "#2563A8",
  purple: "#6D4AA6",
};

export default function PickCorridor({ navigation }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const carpool = useCarpool();

  useEffect(() => {
    carpool.actions.loadCorridors();
  }, []);

  const onSelect = (corridor) => {
    carpool.actions.selectCorridor(corridor);
    navigation.navigate("CarpoolDirection");
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <StepHeader
        step={1}
        totalSteps={4}
        title={t("carpool.pickCorridorTitle")}
        subtitle={t("carpool.pickCorridorSubtitle")}
        onBack={() => navigation.goBack()}
      />

      {carpool.isLoading && !carpool.corridorsLoaded ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : carpool.corridors.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.empty}>{t("carpool.noCorridors")}</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[
            styles.list,
            { paddingBottom: Math.max(insets.bottom + 16, 28) },
          ]}
        >
          {carpool.corridors.map((corridor) => (
            <ChoiceCard
              key={corridor._id}
              testID={`corridor-${corridor.code}`}
              accentColor={CORRIDOR_COLORS[corridor.code] || colors.primary}
              title={corridor.name}
              subtitle={t("carpool.stopsCount", { count: corridor.stops?.length || 0 })}
              onPress={() => onSelect(corridor)}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  list: { paddingHorizontal: 20, paddingTop: 4 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  empty: { fontSize: 16, color: "#6B7280", textAlign: "center", lineHeight: 22 },
});
