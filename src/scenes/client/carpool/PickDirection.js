import React from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChoiceCard, StepHeader } from "_molecules";
import { useCarpool } from "_hooks";
import { t } from "_utils/lang";

// Direction is asked in the rider's own words — "going into Kaloum" / "leaving
// Kaloum" — rather than the model's inbound/outbound. §11 is explicit that copy
// should read the way people actually talk, not like translated tech terms.
export default function PickDirection({ navigation }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const carpool = useCarpool();

  const corridor = carpool.corridors.find((c) => c._id === carpool.search.corridorId);

  const onSelect = (direction) => {
    carpool.actions.selectDirection(direction);
    navigation.navigate("CarpoolStops");
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <StepHeader
        step={2}
        totalSteps={4}
        title={t("carpool.pickDirectionTitle")}
        subtitle={corridor?.name}
        onBack={() => navigation.goBack()}
      />

      <View style={[styles.list, { paddingBottom: Math.max(insets.bottom + 16, 28) }]}>
        <ChoiceCard
          testID="direction-inbound"
          icon="arrow-forward"
          title={t("carpool.directionInbound")}
          subtitle={t("carpool.directionInboundHint")}
          onPress={() => onSelect("inbound")}
        />
        <ChoiceCard
          testID="direction-outbound"
          icon="arrow-back"
          title={t("carpool.directionOutbound")}
          subtitle={t("carpool.directionOutboundHint")}
          onPress={() => onSelect("outbound")}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  list: { paddingHorizontal: 20, paddingTop: 4 },
});
