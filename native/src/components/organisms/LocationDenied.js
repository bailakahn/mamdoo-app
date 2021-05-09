import React from "react";
import { View, Linking, Platform } from "react-native";
import { Button, useTheme, Text } from "react-native-paper";
import Constants from "expo-constants";
import * as IntentLauncher from "expo-intent-launcher";
import { Classes } from "_styles";
import { t } from "_utils/lang";

export default function LocationDenied() {
    const { colors } = useTheme();

    const openSettings = () => {
        if (Platform.OS === "ios") {
            Linking.openSettings();
        } else {
            const pkg = Constants.manifest.releaseChannel
                ? Constants.manifest.android.package
                : "host.exp.exponent";

            IntentLauncher.startActivityAsync(
                IntentLauncher.ACTION_APPLICATION_DETAILS_SETTINGS,
                { data: "package:" + pkg }
            );
        }
    };
    return (
        <View style={Classes.container(colors)}>
            <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 20, fontWeight: "bold" }}>
                    {t("main.locationPermission")}
                </Text>
            </View>
            <View style={{ padding: 10 }}>
                <Text style={{ fontSize: 15, textAlign: "center" }}>
                    {t("main.locationNeeded")}
                </Text>
            </View>

            <View style={{ marginTop: 20 }}>
                <Button mode="contained" onPress={openSettings}>
                    {t("main.givePermission")}
                </Button>
            </View>
        </View>
    );
}
