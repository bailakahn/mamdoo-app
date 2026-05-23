import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme, Text } from "react-native-paper";
import Icon from "@expo/vector-icons/MaterialIcons";

export default function UploadHeader({ title, navigation }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.header, { borderBottomColor: colors.outline + "30" }]}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.side}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Icon name="arrow-back-ios" size={20} color={colors.text} />
      </TouchableOpacity>
      <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.side} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  side: { width: 44, justifyContent: "center", alignItems: "center" },
  title: { flex: 1, textAlign: "center", fontSize: 17, fontWeight: "600" },
});
