import React from "react";
import { View } from "react-native";
import { Text, Portal, Dialog, useTheme, Paragraph } from "react-native-paper";
import Button from "../atoms/Button";
import RoundButton from "../atoms/RoundButton";
import { t2 } from "_utils/lang";

export default function PopConfirm({
    visible,
    setVisible,
    onDismiss,
    title,
    content,
    cancelText,
    onCancel,
    cancelButtonProps = {},
    okButtonProps = {},
    okText,
    onConfirm,
    isRounded = false
}) {
    const { colors } = useTheme();

    return (
        <Portal>
            <Dialog
                visible={visible}
                onDismiss={onDismiss ? onDismiss : () => setVisible(false)}
            >
                <Dialog.Title>{title || t2("main.confirmTitle")}</Dialog.Title>
                <Dialog.Content>
                    <Paragraph>
                        {content || t2("main.confirmWarning")}
                    </Paragraph>
                </Dialog.Content>
                {isRounded ? (
                    <Dialog.Actions style={{ justifyContent: "space-around" }}>
                        <RoundButton
                            size={0.35}
                            shadow={{ size: 0.3 }}
                            color={cancelButtonProps?.color || "primary"}
                            text={cancelText || t2("main.cancel")}
                            onPress={
                                onCancel ? onCancel : () => setVisible(false)
                            }
                        />
                        <RoundButton
                            size={0.35}
                            shadow={{ size: 0.3 }}
                            color={okButtonProps?.color || "error"}
                            text={okText || t2("main.confirm")}
                            onPress={onConfirm}
                        />
                    </Dialog.Actions>
                ) : (
                    <Dialog.Actions>
                        <Button
                            onPress={
                                onCancel ? onCancel : () => setVisible(false)
                            }
                            style={{ marginRight: 50 }}
                        >
                            <Text
                                style={{
                                    color: colors[
                                        cancelButtonProps?.color || "text"
                                    ]
                                }}
                            >
                                {cancelText || t2("main.cancel")}
                            </Text>
                        </Button>
                        <Button mode="text" onPress={onConfirm}>
                            <Text
                                style={{
                                    color: colors[
                                        okButtonProps?.color || "error"
                                    ]
                                }}
                            >
                                {okText || t2("main.confirm")}
                            </Text>
                        </Button>
                    </Dialog.Actions>
                )}
            </Dialog>
        </Portal>
    );
}
