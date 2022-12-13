import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useTheme, DefaultTheme } from "react-native-paper";
import { Classes } from "_styles";

export default function RoundButton({
    size,
    text,
    color,
    onPress,
    shadow,
    disabled
}) {
    const { colors } = useTheme();

    return (
        <TouchableOpacity
            disabled={disabled}
            onPress={onPress}
            style={{
                ...Classes.roundButton(colors, size, color),
                ...(disabled && { backgroundColor: "lightgray" })
            }}
        >
            {shadow ? (
                <View style={Classes.buttonShadow(colors, shadow.size)}>
                    <Text
                        style={{
                            color: "#ffffff",
                            fontWeight: "bold",
                            fontSize: 15,
                            textAlign: "center"
                        }}
                    >
                        {text}
                    </Text>
                </View>
            ) : (
                <Text
                    style={{
                        color: colors.background,
                        fontWeight: "bold",
                        fontSize: 15
                    }}
                >
                    {text}
                </Text>
            )}
        </TouchableOpacity>
    );
}
