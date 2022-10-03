import React from "react";
import { View } from "react-native";
import { useTheme, Text } from "react-native-paper";
import { Classes } from "_styles";
import { t2 } from "_utils/lang";
import { Button } from "_atoms";

export default function LocationDisclosure({ setBackgroundPermission }) {
    const { colors } = useTheme();

    return (
        <View style={Classes.container(colors)}>
            <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 20, fontWeight: "bold" }}>
                    {t2("main.locationDisclosureTitle")}
                </Text>
            </View>
            <View style={{ padding: 10 }}>
                <Text style={{ fontSize: 15, textAlign: "center" }}>
                    {t2("main.locationDisclosureText")}
                </Text>
            </View>

            <View style={{ marginTop: 20 }}>
                <Button
                    style={Classes.authorizeButton(colors)}
                    mode="contained"
                    onPress={() => setBackgroundPermission("loaded")}
                >
                    {t2("main.understand")}
                </Button>
            </View>
        </View>
    );
}
