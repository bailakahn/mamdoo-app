import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { useTheme, TextInput } from "react-native-paper";
import { Classes } from "_styles";
import { t } from "_utils/lang";
import { useUser, useApp } from "_hooks";
import { Button, RoundButton } from "_atoms";

export default function Form({ navigation }) {
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
            <View>
                <TextInput
                    style={Classes.formInput(colors)}
                    mode="outlined"
                    label={t("form.firstName")}
                    placeholder={t("form.firstName")}
                    value={user.formUser.firstName}
                    onChangeText={(firstName) =>
                        user.actions.setFormUser({
                            ...user.formUser,
                            firstName
                        })
                    }
                    maxLength={50}
                />

                <TextInput
                    style={Classes.formInput(colors)}
                    mode="outlined"
                    label={t("form.lastName")}
                    placeholder={t("form.lastName")}
                    value={user.formUser.lastName}
                    onChangeText={(lastName) =>
                        user.actions.setFormUser({
                            ...user.formUser,
                            lastName
                        })
                    }
                    maxLength={50}
                />

                <TextInput
                    style={Classes.formInput(colors)}
                    mode="outlined"
                    label={t("form.phoneNumber")}
                    value={user.formUser.phoneNumber}
                    onChangeText={(phoneNumber) =>
                        user.actions.setFormUser({
                            ...user.formUser,
                            phoneNumber
                        })
                    }
                    maxLength={9}
                    keyboardType="number-pad"
                />

                <TextInput
                    style={Classes.formInput(colors)}
                    mode="outlined"
                    label={t("form.pin")}
                    value={user.formUser.pin}
                    onChangeText={(pin) =>
                        user.actions.setFormUser({
                            ...user.formUser,
                            pin
                        })
                    }
                    maxLength={4}
                    keyboardType="number-pad"
                />
            </View>
            <View>
                <Text style={Classes.text(colors)}>{t("form.pinText")}</Text>
                {user.formError && (
                    <Text style={Classes.errorText(colors)}>
                        {user.formError}
                    </Text>
                )}
            </View>
            <View>
                <Button
                    mode="contained"
                    onPress={user.actions.saveUser}
                    style={Classes.formButton(colors)}
                    disabled={
                        !user.formUser.firstName ||
                        !user.formUser.lastName ||
                        !user.formUser.phoneNumber ||
                        !user.formUser.pin
                    }
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
                <Text style={{ ...Classes.text(colors), fontSize: 20 }}>
                    {t("form.alreadyHaveAccount")}
                </Text>
                <TouchableOpacity
                    style={{ marginLeft: 10 }}
                    onPress={() => navigation.navigate("Login")}
                >
                    <Text style={{ color: colors.accent, fontSize: 20 }}>
                        {t("form.login")}
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={{ marginTop: 50, alignItems: "center" }}>
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
