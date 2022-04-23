import React from "react";
import { View, Image, TouchableOpacity } from "react-native";
import { useTheme, Text, TextInput } from "react-native-paper";
import { Classes } from "_styles";
import { t } from "_utils/lang";
import { useUser, useApp } from "_hooks";
import { Button, RoundButton } from "_atoms";

export default function Login({ navigation }) {
    const { colors } = useTheme();
    const app = useApp();

    const user = useUser();

    return (
        <View style={Classes.container(colors)}>
            <View style={{ marginTop: -100 }}>
                <Image
                    source={require("_assets/logo.png")}
                    style={Classes.formLogo(colors)}
                />
            </View>
            <>
                <View style={{ marginBottom: 25 }}>
                    <Text style={{ fontSize: 25, fontWeight: "bold" }}>
                        {t("form.loginHeader")}
                    </Text>
                </View>
                <View>
                    <TextInput
                        style={Classes.formInput(colors)}
                        mode="outlined"
                        label={t("form.phoneNumber")}
                        placeholder={t("form.phoneNumberPlaceholder")}
                        value={user.auth.phoneNumber}
                        onChangeText={(phoneNumber) =>
                            user.actions.setAuth({
                                ...user.auth,
                                phoneNumber
                            })
                        }
                        maxLength={9}
                        keyboardType="number-pad"
                        returnKeyType="done"
                    />

                    <TextInput
                        style={Classes.formInput(colors)}
                        mode="outlined"
                        label={t("form.pin")}
                        placeholder={t("form.pin")}
                        value={user.auth.pin}
                        onChangeText={(pin) =>
                            user.actions.setAuth({
                                ...user.auth,
                                pin
                            })
                        }
                        maxLength={4}
                        keyboardType="number-pad"
                        returnKeyType="done"
                    />
                </View>
            </>
            <View style={Classes.error(colors)}>
                {user.formError && (
                    <Text style={Classes.errorText(colors)}>
                        {user.formError}
                    </Text>
                )}
            </View>

            <View>
                <Button
                    mode="contained"
                    onPress={user.actions.loginUser}
                    style={Classes.formButton(colors)}
                    disabled={!user.auth.phoneNumber || !user.auth.pin}
                >
                    {t("form.start")}
                </Button>
            </View>

            <View
                style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    marginTop: 30
                }}
            >
                <TouchableOpacity
                    style={{ marginLeft: 10 }}
                    onPress={() => navigation.navigate("ForgotPassword")}
                >
                    <Text style={{ color: colors.accent, fontSize: 20 }}>
                        {t("form.forgotPassword")}
                    </Text>
                </TouchableOpacity>
            </View>

            <View
                style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    marginTop: 30
                }}
            >
                <Text style={{ fontSize: 20 }}>
                    {t("form.notRegisteredYet")}
                </Text>
                <TouchableOpacity
                    style={{ marginLeft: 10 }}
                    onPress={() => navigation.navigate("Register")}
                >
                    <Text style={{ color: colors.accent, fontSize: 20 }}>
                        {t("form.register")}
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={{ marginTop: 50 }}>
                <RoundButton
                    size={0.3}
                    color={"grey"}
                    text={"Changer d'application"}
                    onPress={() => {
                        app.actions.removeApp();
                    }}
                    shadow={{ size: 0.27 }}
                />
            </View>
        </View>
    );
}
