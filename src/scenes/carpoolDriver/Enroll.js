import React, { useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "@expo/vector-icons/MaterialIcons";
import { Button } from "_atoms";
import { StepHeader } from "_molecules";
import { useCarpool } from "_hooks/carpoolDriver";
import { t2 } from "_utils/lang";

const Point = ({ icon, text, colors }) => (
  <View style={styles.point}>
    <Icon name={icon} size={22} color={colors.primary} />
    <Text style={[styles.pointText, { color: colors.text }]}>{text}</Text>
  </View>
);

// Joining covoiturage. Says plainly what the driver is agreeing to before they
// agree to it — cost-sharing rather than earning, a fixed price they do not set,
// and a commission they will owe and settle separately.
export default function CarpoolEnroll({ navigation }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const carpool = useCarpool();
  const [busy, setBusy] = useState(false);

  const onJoin = async () => {
    setBusy(true);
    const result = await carpool.actions.enroll();
    setBusy(false);
    if (result?.success) navigation.navigate("CarpoolCar");
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <StepHeader
        title={t2("carpoolDriver.enrollTitle")}
        subtitle={t2("carpoolDriver.enrollSubtitle")}
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={[
          styles.body,
          { paddingBottom: Math.max(insets.bottom + 24, 32) },
        ]}
      >
        <Point icon="groups" text={t2("carpoolDriver.enrollPoint1")} colors={colors} />
        <Point icon="price-check" text={t2("carpoolDriver.enrollPoint2")} colors={colors} />
        <Point icon="payments" text={t2("carpoolDriver.enrollPoint3")} colors={colors} />
        <Point icon="event-available" text={t2("carpoolDriver.enrollPoint4")} colors={colors} />

        <Button
          mode="contained"
          icon="check"
          loading={busy}
          disabled={busy}
          onPress={onJoin}
          style={styles.button}
          contentStyle={styles.buttonContent}
        >
          {t2("carpoolDriver.enrollConfirm")}
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  body: { paddingHorizontal: 20 },
  point: { flexDirection: "row", alignItems: "flex-start", gap: 14, marginBottom: 20 },
  pointText: { flex: 1, fontSize: 16, lineHeight: 23 },
  button: { borderRadius: 12, marginTop: 12 },
  buttonContent: { height: 56 },
});
