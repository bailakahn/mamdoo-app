import React from "react";
import { View, Image, TouchableOpacity } from "react-native";
import { useTheme, Text, TextInput } from "react-native-paper";
import { Classes } from "_styles";
import { t } from "_utils/lang";
import { Button } from "_atoms";
import { useUser } from "_hooks";

export default function ForgotPassword({ navigation }) {
    const { colors } = useTheme();
    const user = useUser();

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

            <View style={{ marginTop: 10 }}>
                <TextInput
                    style={Classes.formInput(colors)}
                    mode="outlined"
                    label={t("form.phoneNumber")}
                    placeholder={t("form.phoneNumberPlaceholder")}
                    value={user.forgotPasswordUser.phoneNumber}
                    onChangeText={(phoneNumber) =>
                        user.actions.setForgotPasswordUser({
                            ...user.forgotPasswordUser,
                            phoneNumber
                        })
                    }
                    maxLength={9}
                    keyboardType="number-pad"
                    returnKeyType="done"
                />
            </View>
            <View style={Classes.error(colors)}>
                {user.forgotPasswordError && (
                    <Text style={Classes.errorText(colors)}>
                        {user.forgotPasswordError}
                    </Text>
                )}
            </View>
            <View style={{ marginTop: 10 }}>
                <Button
                    {...Classes.verifyButtonContainer(colors)}
                    mode="contained"
                    onPress={() => {
                        user.actions.sendForgotPinVerification(navigation);
                    }}
                >
                    {`${t("main.resetPassword")}`}
                </Button>
            </View>
            <View
                style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    marginTop: 50
                }}
            >
                <TouchableOpacity
                    style={{ marginLeft: 10 }}
                    onPress={() => navigation.navigate("Login")}
                >
                    <Text style={{ color: colors.accent, fontSize: 20 }}>
                        {t("main.goBack")}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
