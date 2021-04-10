import React from "react";
import { View, Text, Image } from "react-native";
import { Button, useTheme, TextInput } from "react-native-paper";
import { useStore } from "_store";
import { Classes } from "_styles";
import { t } from "_utils/lang";
import { useUser } from "_hooks";

export default function Form() {
    const { colors } = useTheme();
    const {
        main: { app }
    } = useStore();

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
            </View>
            <View>
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
                        !user.formUser.phoneNumber
                    }
                >
                    {t("form.start")}
                </Button>
            </View>
        </View>
    );
}
