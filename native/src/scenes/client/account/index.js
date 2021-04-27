import React from "react";
import { View, Text } from "react-native";
import { Button, useTheme } from "react-native-paper";
import { Classes } from "_styles";
import { t } from "_utils/lang";
import { useApp } from "_hooks";

export default function AccountScene({}) {
    const { colors } = useTheme();

    const app = useApp();
    return (
        <View style={Classes.container(colors)}>
            <Button
                mode="contained"
                onPress={() => {
                    app.actions.removeApp();
                }}
            >
                {t("account.changeApp")}
            </Button>
        </View>
    );
}
