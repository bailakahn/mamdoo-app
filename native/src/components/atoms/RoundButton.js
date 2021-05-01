import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useTheme, DefaultTheme } from "react-native-paper";
import { Classes } from "_styles";

export default function RoundButton({ size, text, color, onPress, shadow }) {
    const { colors } = useTheme();

    return (
        <TouchableOpacity
            onPress={onPress}
            style={Classes.roundButton(colors, size, color)}
        >
            {shadow ? (
                <View style={Classes.buttonShadow(colors, shadow.size)}>
                    <Text
                        style={{
                            color: colors.background,
                            fontWeight: "bold",
                            fontSize: 15
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
