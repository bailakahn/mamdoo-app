import React from "react";
import { View } from "react-native";
import { Portal, Modal, Headline, useTheme } from "react-native-paper";
import { t2 } from "_utils/lang";
import { Classes } from "_styles";
import { Button } from "_atoms";

export default function CustomModal({
  onDismiss,
  visible,
  children,
  onClose,
  title,
}) {
  const { colors } = useTheme();
  return (
    <Portal>
      <Modal
        contentContainerStyle={Classes.modal(colors)}
        style={Classes.modalWrapper(colors)}
        onDismiss={onDismiss}
        visible={visible}
      >
        <View style={{ alignItems: "center" }}>
          <Headline>{(title && title) || "Mamdoo"}</Headline>
        </View>
        {children}

        <View style={{ marginTop: 20 }}>
          <Button mode="contained" onPress={onClose} color={colors.error}>
            {t2("main.close")}
          </Button>
        </View>
      </Modal>
    </Portal>
  );
}
