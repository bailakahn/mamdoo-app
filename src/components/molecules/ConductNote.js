import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, useTheme } from "react-native-paper";
import Icon from "@expo/vector-icons/MaterialIcons";

// A short reminder that people are sharing a car with a stranger.
//
// Placed where it is actually read — at the moment of booking, and before a trip
// starts — rather than buried in terms nobody opens. Kept to one sentence: a wall
// of rules gets skipped, and the point is a nudge, not a contract.
export default function ConductNote({ text, tone = "neutral" }) {
  const { colors } = useTheme();
  const accent = tone === "warm" ? "#B45309" : colors.primary;

  return (
    <View style={[styles.wrap, { backgroundColor: accent + "12" }]}>
      <Icon name="volunteer-activism" size={20} color={accent} />
      <Text style={[styles.text, { color: colors.text }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  text: { flex: 1, fontSize: 14, lineHeight: 20 },
});
