import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Text, useTheme } from "react-native-paper";
import Icon from "@expo/vector-icons/MaterialIcons";

// One tappable choice, sized for a first-time user: a large hit area, an icon
// paired with a text label (never icon alone), and a chevron so it reads as
// "leads somewhere" without needing app conventions.
//
// accentColor drives the leading swatch — used for the corridor colours, which are
// the same red/blue/purple riders see on the real map.
export default function ChoiceCard({
  title,
  subtitle,
  icon,
  accentColor,
  selected = false,
  disabled = false,
  right = null,
  onPress,
  testID,
}) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      testID={testID}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={subtitle ? `${title}. ${subtitle}` : title}
      accessibilityState={{ selected, disabled }}
      style={[
        styles.card,
        {
          backgroundColor: colors.background,
          borderColor: selected ? colors.primary : colors.surfaceVariant ?? "#E5E7EB",
          borderWidth: selected ? 2 : 1,
          opacity: disabled ? 0.5 : 1,
        },
      ]}
    >
      {accentColor ? (
        <View style={[styles.swatch, { backgroundColor: accentColor }]} />
      ) : icon ? (
        <View
          style={[
            styles.iconWrap,
            { backgroundColor: (colors.primary ?? "#000") + "18" },
          ]}
        >
          <Icon name={icon} size={24} color={colors.primary} />
        </View>
      ) : null}

      <View style={styles.textWrap}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {title}
        </Text>
        {!!subtitle && (
          <Text style={[styles.subtitle, { color: colors.placeholder }]} numberOfLines={2}>
            {subtitle}
          </Text>
        )}
      </View>

      {right || <Icon name="chevron-right" size={24} color={colors.placeholder} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    // Comfortably above the 44pt minimum, because §11 expects this to be tapped
    // quickly and with low precision.
    minHeight: 72,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    // iOS and Android express elevation differently; both are set.
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  swatch: { width: 14, height: 44, borderRadius: 7, marginRight: 14 },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  textWrap: { flex: 1 },
  title: { fontSize: 17, fontWeight: "600" },
  subtitle: { fontSize: 14, marginTop: 3 },
});
