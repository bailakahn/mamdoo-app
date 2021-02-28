import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { Button, useTheme } from "react-native-paper";
import { useStore } from "_store";
import { Classes } from "_styles";

export default function HomeScreen() {
    const { colors } = useTheme();
    const {
        main: { app }
    } = useStore();
    return (
        <View style={Classes.container(colors)}>
            <>
                <Text style={{ color: colors.text }}>Welcome to {app} App</Text>
            </>
        </View>
    );
}
