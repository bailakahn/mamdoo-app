import React from "react";
import { View, Image } from "react-native";
import { useTheme, Text } from "react-native-paper";
import { Classes } from "_styles";
import { t } from "_utils/lang";
import { Button } from "_atoms";
import { useApp } from "_hooks";

export default function ForgotPassword({ navigation }) {
    const { colors } = useTheme();
    const app = useApp();

    return (
        <View style={Classes.container(colors)}>
            <View style={{ marginTop: -100 }}>
                <Image
                    source={require("_assets/logo.png")}
                    style={Classes.formLogo(colors)}
                />
            </View>
            <View style={{ marginBottom: 25 }}>
                <Text style={{ fontSize: 25, fontWeight: "bold" }}>
                    {t("main.forgotPassword")}
                </Text>
            </View>
            <View style={Classes.centeredText(colors)}>
                <Text style={{ textAlign: "center" }}>
                    {t("main.forgotPasswordText")}
                </Text>
            </View>
            <View style={{ marginTop: 30 }}>
                <Button
                    {...Classes.callButtonContainer(colors)}
                    mode="contained"
                    onPress={app.actions.call}
                >
                    {`${t("main.call")} ${app.settings.phone}`}
                </Button>
            </View>
            <View style={{ marginTop: 30 }}>
                <Button
                    // style={{
                    //     ...Classes.backButton(colors),
                    //     backgroundColor: colors.error
                    // }}
                    {...Classes.backButtonContainer(colors, "error")}
                    mode="contained"
                    onPress={() => navigation.navigate("Login")}
                >
                    {t("main.goBack")}
                </Button>
            </View>
        </View>
    );
}
