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

const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

export default function CarpoolTemplates({ navigation }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const carpool = useCarpool();
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      carpool.actions.loadTemplates().then(() => setLoading(false));
    }, [])
  );

  const onDelete = (template) => {
    Alert.alert(t2("carpoolDriver.deleteTitle"), t2("carpoolDriver.deleteBody"), [
      { text: t2("carpoolDriver.wait"), style: "cancel" },
      {
        text: t2("carpoolDriver.deleteConfirm"),
        style: "destructive",
        onPress: () => carpool.actions.deleteTemplate(template._id),
      },
    ]);
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <StepHeader
        title={t2("carpoolDriver.myTripsTitle")}
        subtitle={t2("carpoolDriver.myTripsSubtitle")}
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
          {carpool.templates.map((template) => (
            <View key={template._id} style={[styles.card, { borderColor: colors.border }]}>
              <View style={styles.cardTop}>
                <Text style={[styles.time, { color: colors.text }]}>
                  {template.departureTime}
                </Text>
                {!template.active && (
                  <View style={[styles.pausedBadge, { backgroundColor: colors.overlap }]}>
                    <Text style={[styles.pausedText, { color: colors.placeholder }]}>
                      {t2("carpoolDriver.paused")}
                    </Text>
                  </View>
                )}
              </View>

              <Text style={[styles.corridor, { color: colors.placeholder }]}>
                {template.corridorId?.name}
              </Text>

              <View style={styles.daysRow}>
                {DAY_ORDER.map((d) => {
                  const on = template.daysOfWeek?.includes(d);
                  return (
                    <View
                      key={d}
                      style={[
                        styles.dayPill,
                        { backgroundColor: on ? colors.primary : colors.overlap },
                      ]}
                    >
                      <Text
                        style={[styles.dayText, { color: on ? "#fff" : colors.placeholder }]}
                      >
                        {t2(`carpoolDriver.day_${d}`)}
                      </Text>
                    </View>
                  );
                })}
              </View>

              <View style={styles.metaRow}>
                <Icon name="event-seat" size={16} color={colors.placeholder} />
                <Text style={[styles.meta, { color: colors.placeholder }]}>
                  {t2("carpoolDriver.seatsOffered", { count: template.defaultSeatsOffered })}
                </Text>
                {template.womenOnly && (
                  <>
                    <Icon name="female" size={16} color="#9D174D" />
                    <Text style={[styles.meta, { color: "#9D174D" }]}>
                      {t2("carpoolDriver.womenOnlyShort")}
                    </Text>
                  </>
                )}
              </View>

              <View style={styles.actions}>
                <TouchableOpacity
                  onPress={() => navigation.navigate("CarpoolTemplateForm", { template })}
                  accessibilityRole="button"
                >
                  <Text style={[styles.link, { color: colors.primary }]}>
                    {t2("carpoolDriver.edit")}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onDelete(template)} accessibilityRole="button">
                  <Text style={[styles.link, { color: "#B3261E" }]}>
                    {t2("carpoolDriver.delete")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          <Button
            mode="contained"
            icon="plus"
            onPress={() => navigation.navigate("CarpoolTemplateForm", {})}
            style={styles.addButton}
            contentStyle={styles.addContent}
          >
            {t2("carpoolDriver.addTrip")}
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
  card: { borderWidth: 1, borderRadius: 14, padding: 16, marginBottom: 14 },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  time: { fontSize: 24, fontWeight: "700" },
  pausedBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  pausedText: { fontSize: 12, fontWeight: "600" },
  corridor: { fontSize: 14, marginTop: 4 },
  daysRow: { flexDirection: "row", gap: 5, marginTop: 12 },
  dayPill: { width: 34, height: 30, borderRadius: 7, alignItems: "center", justifyContent: "center" },
  dayText: { fontSize: 12, fontWeight: "700" },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 12 },
  meta: { fontSize: 14, marginRight: 8 },
  actions: { flexDirection: "row", gap: 24, marginTop: 14 },
  link: { fontSize: 15, fontWeight: "600" },
  addButton: { borderRadius: 12, marginTop: 6 },
  addContent: { height: 54 },
});
