import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Text, useTheme } from "react-native-paper";
import Icon from "@expo/vector-icons/MaterialIcons";

// Five big stars, and the chosen level named in words underneath.
//
// The word matters: stars alone assume the reader knows five is good, which §11
// says not to rely on. Each star is a 52pt target so it can be tapped without
// precision.
export default function StarPicker({ value, onChange, labels = [], size = 44 }) {
  const { colors } = useTheme();

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        {[1, 2, 3, 4, 5].map((star) => {
          const active = value >= star;
          return (
            <TouchableOpacity
              key={star}
              onPress={() => onChange(star)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityState={{ selected: value === star }}
              accessibilityLabel={labels[star - 1] || String(star)}
              style={styles.star}
            >
              <Icon
                name={active ? "star" : "star-border"}
                size={size}
                color={active ? "#F59E0B" : "#D1D5DB"}
              />
            </TouchableOpacity>
          );
        })}
      </View>

      {!!value && !!labels[value - 1] && (
        <Text style={[styles.label, { color: colors.text }]}>{labels[value - 1]}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center" },
  row: { flexDirection: "row", justifyContent: "center" },
  star: { width: 52, height: 52, alignItems: "center", justifyContent: "center" },
  label: { fontSize: 17, fontWeight: "600", marginTop: 8 },
});
