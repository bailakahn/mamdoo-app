import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Text, useTheme } from "react-native-paper";
import Icon from "@expo/vector-icons/MaterialIcons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { t } from "_utils/lang";

// Header for each step of the covoiturage flow.
//
// It states the one question this screen asks, and shows how far through the
// rider is. §11 asks for a guided linear flow rather than a dashboard, and
// progress dots are the cheapest way to say "there are four steps, you are on
// two" without any reading.
export default function StepHeader({
  title,
  subtitle,
  step = null,
  totalSteps = null,
  onBack,
}) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.wrap,
        { paddingTop: insets.top + 8, backgroundColor: colors.background },
      ]}
    >
      <View style={styles.topRow}>
        {onBack ? (
          <TouchableOpacity
            onPress={onBack}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityRole="button"
            accessibilityLabel={t("carpool.back")}
            style={styles.back}
          >
            <Icon name="arrow-back" size={26} color={colors.text} />
          </TouchableOpacity>
        ) : (
          <View style={styles.back} />
        )}

        {step && totalSteps ? (
          <View style={styles.dots}>
            {Array.from({ length: totalSteps }).map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      index < step ? colors.primary : colors.surfaceVariant ?? "#E5E7EB",
                    width: index === step - 1 ? 22 : 8,
                  },
                ]}
              />
            ))}
          </View>
        ) : null}

        <View style={styles.back} />
      </View>

      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {!!subtitle && (
        <Text style={[styles.subtitle, { color: colors.placeholder }]}>{subtitle}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 20, paddingBottom: 16 },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  back: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  dots: { flexDirection: "row", alignItems: "center", gap: 6 },
  dot: { height: 8, borderRadius: 4 },
  title: { fontSize: 24, fontWeight: "700", marginTop: 8 },
  subtitle: { fontSize: 15, marginTop: 6, lineHeight: 21 },
});
