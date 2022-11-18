import React, { useState } from "react";
import { View, Image, TouchableOpacity } from "react-native";
import { useTheme, Text, TextInput } from "react-native-paper";
import { Classes } from "_styles";
import { t, t2 } from "_utils/lang";
import { Button, LoadingV2 } from "_atoms";
import { usePartner } from "_hooks";

export default function PasswordVerification({ navigation }) {
    const { colors } = useTheme();
    const partner = usePartner();
    const [hidePassword, setHidePassword] = useState(true);

    return partner.isLoading ? (
        <LoadingV2 />
    ) : (
        <View style={Classes.container(colors)}>
            <View style={{ marginTop: -100 }}>
                <Image
                    source={require("_assets/logo.png")}
                    style={Classes.formLogo(colors)}
                />
            </View>

            <View style={Classes.centeredText(colors)}>
                <Text style={{ textAlign: "center" }}>
                    {t("main.verificationSent")}
                </Text>
            </View>

            <View style={{ marginTop: 10 }}>
                <Text
                    style={{
                        fontSize: 25,
                        fontWeight: "bold",
                        color: colors.primary
                    }}
                >
                    {partner.partner?.phoneNumber}
                </Text>
            </View>
            <View style={{ marginTop: 10 }}>
                <TextInput
                    style={Classes.formInput(colors)}
                    mode="outlined"
                    label={t("main.verificationPlaceholder")}
                    placeholder={t("main.verificationPlaceholder")}
                    value={partner.forgotPasswordUser.code}
                    onChangeText={(code) =>
                        partner.actions.setForgotPasswordUser({
                            ...partner.forgotPasswordUser,
                            code
                        })
                    }
                    maxLength={4}
                    keyboardType="number-pad"
                    returnKeyType="done"
                />
            </View>
            <View style={Classes.centeredText(colors)}>
                <Text style={{ textAlign: "center" }}>
                    {t2("main.passwordVerificationNotice")}
                </Text>
            </View>
            <View style={{ marginTop: 10 }}>
                <TextInput
                    style={Classes.formInput(colors)}
                    mode="outlined"
                    label={t2("form.password")}
                    placeholder={t2("form.passwordPlaceholder")}
                    value={partner.forgotPasswordUser.password}
                    onChangeText={(password) =>
                        partner.actions.setForgotPasswordUser({
                            ...partner.forgotPasswordUser,
                            password
                        })
                    }
                    secureTextEntry={hidePassword}
                    right={
                        <TextInput.Icon
                            name="eye"
                            onPress={() => setHidePassword(!hidePassword)}
                        />
                    }
                />
                <TextInput
                    style={Classes.formInput(colors)}
                    mode="outlined"
                    label={t2("form.passwordValidation")}
                    placeholder={t2("form.passwordPlaceholder")}
                    value={partner.forgotPasswordUser.passwordValidation}
                    onChangeText={(passwordValidation) =>
                        partner.actions.setForgotPasswordUser({
                            ...partner.forgotPasswordUser,
                            passwordValidation
                        })
                    }
                    secureTextEntry={hidePassword}
                    right={
                        <TextInput.Icon
                            name="eye"
                            onPress={() => setHidePassword(!hidePassword)}
                        />
                    }
                />
            </View>
            <View style={Classes.error(colors)}>
                {partner.verificationError && (
                    <Text style={Classes.errorText(colors)}>
                        {partner.verificationError}
                    </Text>
                )}
            </View>
            <View style={{ marginTop: 30 }}>
                <Button
                    {...Classes.verifyButtonContainer(colors)}
                    mode="contained"
                    onPress={() => {
                        partner.actions.resetPassword();
                    }}
                    disabled={
                        !partner.forgotPasswordUser.code ||
                        !partner.forgotPasswordUser.password ||
                        !partner.forgotPasswordUser.passwordValidation
                    }
                >
                    {`${t2("main.resetPassword")}`}
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
                    {t("main.verificationNotReceived")}
                </Text>
                <TouchableOpacity
                    style={{ marginLeft: 10 }}
                    onPress={partner.actions.resend}
                >
                    <Text style={{ color: colors.accent, fontSize: 20 }}>
                        {t("main.sendVerificationAgain")}
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
                <TouchableOpacity
                    style={{ marginLeft: 10 }}
                    onPress={() => navigation.navigate("ForgotPassword")}
                >
                    <Text style={{ color: colors.accent, fontSize: 20 }}>
                        {t("main.editPhoneNumber")}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
