import React from "react";
import { View, Image, TouchableOpacity } from "react-native";
import { useTheme, TextInput, Text } from "react-native-paper";
import { useStore } from "_store";
import { Classes } from "_styles";
import { t2 } from "_utils/lang";
import { usePartner } from "_hooks";
import { Button } from "_atoms";

export default function Login({ navigation }) {
    const { colors } = useTheme();
    const {
        main: { app }
    } = useStore();

    const partner = usePartner();

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
                        {t2("form.loginHeader")}
                    </Text>
                </View>
                <View>
                    <TextInput
                        style={Classes.formInput(colors)}
                        mode="outlined"
                        label={t2("form.phoneNumber")}
                        value={partner.auth.phoneNumber}
                        onChangeText={(phoneNumber) =>
                            partner.actions.setAuth({
                                ...partner.auth,
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
                        label={t2("form.password")}
                        value={partner.auth.password}
                        onChangeText={(password) =>
                            partner.actions.setAuth({
                                ...partner.auth,
                                password
                            })
                        }
                        secureTextEntry={true}
                    />
                </View>
            </>
            <View style={Classes.error(colors)}>
                {partner.formError && (
                    <Text style={Classes.errorText(colors)}>
                        {partner.formError}
                    </Text>
                )}
            </View>

            <View>
                <Button
                    mode="contained"
                    onPress={partner.actions.loginPartner}
                    style={Classes.formButton(colors)}
                    disabled={
                        !partner.auth.phoneNumber || !partner.auth.password
                    }
                >
                    {t2("form.start")}
                </Button>
            </View>

            <View
                style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    marginTop: 30
                }}
            >
                <Text style={{ fontSize: 20 }}>
                    {t2("form.notRegisteredYet")}
                </Text>
                <TouchableOpacity
                    style={{ marginLeft: 10 }}
                    onPress={() => navigation.navigate("Register")}
                >
                    <Text style={{ color: colors.accent, fontSize: 20 }}>
                        {t2("form.register")}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
