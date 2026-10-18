import React, { useCallback, useState } from "react";
import { View, ScrollView, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import Icon from "@expo/vector-icons/MaterialIcons";
import { Button } from "_atoms";
import { StepHeader } from "_molecules";
import { useCarpool } from "_hooks/carpoolDriver";
import { t2 } from "_utils/lang";

// A driver with more than one car — switching which one is "current" (used for
// new templates and for the document checklist), adding another, or retiring
// one they no longer use. Previously there was no way to reach a second car at
// all: every screen that needed "my car" just read cars[0].
export default function CarpoolMyCars({ navigation }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const carpool = useCarpool();
  const [loading, setLoading] = useState(true);
  const [busyCarId, setBusyCarId] = useState(null);

  useFocusEffect(
    useCallback(() => {
      carpool.actions.loadProfile().then(() => setLoading(false));
    }, [])
  );

  const cars = carpool.profile?.cars || [];

  const onSetActive = async (car) => {
    setBusyCarId(car._id);
    await carpool.actions.setActiveCar(car._id);
    setBusyCarId(null);
  };

  const onDelete = (car) => {
    Alert.alert(t2("carpoolDriver.deleteCarTitle"), t2("carpoolDriver.deleteCarBody"), [
      { text: t2("carpoolDriver.wait"), style: "cancel" },
      {
        text: t2("carpoolDriver.deleteConfirm"),
        style: "destructive",
        onPress: async () => {
          setBusyCarId(car._id);
          const result = await carpool.actions.deleteCar(car._id);
          setBusyCarId(null);
          if (!result?.success) {
            Alert.alert(t2("carpoolDriver.deleteCarTitle"), t2("carpoolDriver.deleteCarFailed"));
          }
        },
      },
    ]);
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <StepHeader
        title={t2("carpoolDriver.myCarsTitle")}
        subtitle={t2("carpoolDriver.myCarsSubtitle")}
        onBack={() => navigation.navigate("HomeTab", { screen: "CarpoolDriverHome" })}
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.body, { paddingBottom: Math.max(insets.bottom + 24, 32) }]}
        >
          {cars.map((car) => {
            const busy = busyCarId === car._id;
            return (
              <View
                key={car._id}
                style={[
                  styles.card,
                  { borderColor: car.active ? colors.primary : colors.border },
                ]}
              >
                <View style={styles.cardTop}>
                  <View style={styles.cardTitle}>
                    <Text style={[styles.model, { color: colors.text }]}>
                      {car.color} {car.make} {car.model}
                    </Text>
                    <Text style={[styles.plate, { color: colors.placeholder }]}>{car.plate}</Text>
                  </View>
                  {car.active && (
                    <View style={[styles.activeBadge, { backgroundColor: colors.primary + "18" }]}>
                      <Text style={[styles.activeBadgeText, { color: colors.primary }]}>
                        {t2("carpoolDriver.currentCar")}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.metaRow}>
                  <Icon name="event-seat" size={16} color={colors.placeholder} />
                  <Text style={[styles.meta, { color: colors.placeholder }]}>
                    {t2("carpoolDriver.seatsCount", { count: car.totalSeats })}
                  </Text>
                  <Icon
                    name={car.verified ? "verified" : "hourglass-empty"}
                    size={16}
                    color={car.verified ? colors.primary : colors.placeholder}
                  />
                  <Text
                    style={[
                      styles.meta,
                      { color: car.verified ? colors.primary : colors.placeholder },
                    ]}
                  >
                    {t2(car.verified ? "carpoolDriver.carVerified" : "carpoolDriver.carUnverified")}
                  </Text>
                </View>

                <View style={styles.actions}>
                  {!car.active && (
                    <TouchableOpacity
                      onPress={() => onSetActive(car)}
                      disabled={busy}
                      accessibilityRole="button"
                    >
                      <Text style={[styles.link, { color: colors.primary }]}>
                        {t2("carpoolDriver.useThisCar")}
                      </Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    onPress={() => navigation.navigate("CarpoolCar", { carId: car._id })}
                    disabled={busy}
                    accessibilityRole="button"
                  >
                    <Text style={[styles.link, { color: colors.text }]}>
                      {t2("carpoolDriver.edit")}
                    </Text>
                  </TouchableOpacity>
                  {cars.length > 1 && (
                    <TouchableOpacity
                      onPress={() => onDelete(car)}
                      disabled={busy}
                      accessibilityRole="button"
                    >
                      <Text style={[styles.link, { color: "#B3261E" }]}>
                        {t2("carpoolDriver.delete")}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}

          <Button
            mode="contained"
            icon="plus"
            onPress={() => navigation.navigate("CarpoolCar", {})}
            style={styles.addButton}
            contentStyle={styles.addContent}
          >
            {t2("carpoolDriver.addCar")}
          </Button>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  body: { paddingHorizontal: 20 },
  card: { borderWidth: 1.5, borderRadius: 14, padding: 16, marginBottom: 14 },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  cardTitle: { flex: 1 },
  model: { fontSize: 17, fontWeight: "700" },
  plate: { fontSize: 14, marginTop: 2 },
  activeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  activeBadgeText: { fontSize: 12, fontWeight: "700" },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 12 },
  meta: { fontSize: 14, marginRight: 10 },
  actions: { flexDirection: "row", gap: 24, marginTop: 14 },
  link: { fontSize: 15, fontWeight: "600" },
  addButton: { borderRadius: 12, marginTop: 6 },
  addContent: { height: 54 },
});
