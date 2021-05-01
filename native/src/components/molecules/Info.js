import React from "react";
import { View, Text } from "react-native";
import { Portal, Modal, Headline, useTheme, Button } from "react-native-paper";
import { t2 } from "_utils/lang";
import { Classes } from "_styles";

export default function Info({ onDismiss, visible, text, onClose }) {
    const { colors } = useTheme();
    return (
        <Portal>
            <Modal
                contentContainerStyle={Classes.modalContent(colors)}
                style={Classes.modalWrapper(colors)}
                onDismiss={onDismiss}
                visible={visible}
            >
                <Headline>Mamdoo</Headline>
                <Text
                    style={[
                        Classes.text(colors),
                        { marginTop: 20, marginBottom: 20 }
                    ]}
                >
                    {text}
                </Text>

                <View>
                    <Button
                        mode="contained"
                        onPress={onClose}
                        color={colors.accent}
                    >
                        {t2("main.close")}
                    </Button>
                </View>
            </Modal>
        </Portal>
    );
}
