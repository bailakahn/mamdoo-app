import React from "react";
import { View, Modal, Pressable, StyleSheet } from "react-native";
import { useTheme, Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "@expo/vector-icons/MaterialIcons";
import { t2 } from "_utils/lang";
import { Button } from "_atoms";

export default function Info({ onDismiss, visible, text, onClose }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={!!visible} transparent animationType="slide" onRequestClose={onDismiss}>
      <Pressable style={styles.backdrop} onPress={onDismiss}>
        <View
          style={[
            styles.sheet,
            { backgroundColor: colors.background, paddingBottom: Math.max(insets.bottom + 16, 24) },
          ]}
          onStartShouldSetResponder={() => true}
        >
          <View style={styles.handle} />

          <View style={styles.iconWrap}>
            <View style={[styles.iconCircle, { backgroundColor: colors.primary + "18" }]}>
              <Icon name="info-outline" size={36} color={colors.primary} />
            </View>
          </View>

          <Text style={[styles.message, { color: colors.text }]}>{text}</Text>

          <Button
            mode="contained"
            onPress={onClose}
            style={styles.btn}
            contentStyle={styles.btnContent}
          >
            {t2("main.close")}
          </Button>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#e0e0e0",
    marginBottom: 4,
  },
  iconWrap: {
    alignItems: "center",
    marginTop: 8,
    marginBottom: 20,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 24,
  },
  btn: { borderRadius: 14 },
  btnContent: { height: 56 },
});
