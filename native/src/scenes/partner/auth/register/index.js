import React, { useState } from "react";
import { View, Image, TouchableOpacity } from "react-native";
import { Button, useTheme, TextInput, Text } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useStore } from "_store";
import { Classes } from "_styles";
import { t2 } from "_utils/lang";
import { usePartner } from "_hooks";

export default function Register({ navigation }) {
    const { colors } = useTheme();
    const {
        main: { app }
    } = useStore();

    const partner = usePartner();

    const [step, setStep] = useState(1);

    return (
        <View style={Classes.container(colors)}>
            <View style={{ marginTop: -100 }}>
                <Image
                    source={require("_assets/logo.png")}
                    style={Classes.formLogo(colors)}
                />
            </View>
            {step === 1 ? (
                <>
                    <View style={{ marginBottom: 25 }}>
                        <Text style={{ fontSize: 25, fontWeight: "bold" }}>
                            {t2("form.personalInfo")}
                        </Text>
                    </View>
                    <View>
                        <TextInput
                            style={Classes.formInput(colors)}
                            mode="outlined"
                            label={t2("form.firstName")}
                            placeholder={t2("form.firstName")}
                            value={partner.formPartner.firstName}
                            onChangeText={(firstName) =>
                                partner.actions.setFormPartner({
                                    ...partner.formPartner,
                                    firstName
                                })
                            }
                            maxLength={50}
                        />

                        <TextInput
                            style={Classes.formInput(colors)}
                            mode="outlined"
                            label={t2("form.lastName")}
                            placeholder={t2("form.lastName")}
                            value={partner.formPartner.lastName}
                            onChangeText={(lastName) =>
                                partner.actions.setFormPartner({
                                    ...partner.formPartner,
                                    lastName
                                })
                            }
                            maxLength={50}
                        />

                        <TextInput
                            style={Classes.formInput(colors)}
                            mode="outlined"
                            label={t2("form.phoneNumber")}
                            value={partner.formPartner.phoneNumber}
                            onChangeText={(phoneNumber) =>
                                partner.actions.setFormPartner({
                                    ...partner.formPartner,
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
                            placeholder={t2("form.password")}
                            value={partner.formPartner.password}
                            onChangeText={(password) =>
                                partner.actions.setFormPartner({
                                    ...partner.formPartner,
                                    password
                                })
                            }
                            secureTextEntry={true}
                        />
                    </View>
                </>
            ) : (
                <View>
                    <View
                        style={{
                            alignItems: "flex-start",
                            marginBottom: 10
                        }}
                    >
                        <Button
                            mode="contained"
                            onPress={() => setStep((step) => step - 1)}
                            style={[
                                Classes.backButton(colors),
                                {
                                    alignItems: "center"
                                }
                            ]}
                        >
                            <View
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center"
                                }}
                            >
                                <Icon
                                    name="arrow-back"
                                    size={25}
                                    style={{
                                        alignSelf: "flex-start",
                                        width: 50,
                                        color: colors.text
                                    }}
                                />
                                <Text
                                    style={{
                                        fontSize: 20,
                                        textAlign: "center",
                                        paddingRight: 50
                                    }}
                                >
                                    {t2("form.back")}
                                </Text>
                            </View>
                        </Button>
                    </View>
                    <View>
                        <View
                            style={{
                                marginTop: 10,
                                marginBottom: 25,
                                alignItems: "center"
                            }}
                        >
                            <Text style={{ fontSize: 25, fontWeight: "bold" }}>
                                {t2("form.cabInfo")}
                            </Text>
                        </View>
                        <TextInput
                            style={Classes.formInput(colors)}
                            mode="outlined"
                            label={t2("form.cabModel")}
                            placeholder={t2("form.cabModel")}
                            value={partner.formPartner.cab.model}
                            onChangeText={(model) =>
                                partner.actions.setFormPartner({
                                    ...partner.formPartner,
                                    cab: { ...partner.formPartner.cab, model }
                                })
                            }
                            maxLength={20}
                        />

                        <TextInput
                            style={Classes.formInput(colors)}
                            mode="outlined"
                            label={t2("form.licensePlate")}
                            placeholder={t2("form.licensePlate")}
                            value={partner.formPartner.cab.licensePlate}
                            onChangeText={(licensePlate) =>
                                partner.actions.setFormPartner({
                                    ...partner.formPartner,
                                    cab: {
                                        ...partner.formPartner.cab,
                                        licensePlate: licensePlate.toUpperCase()
                                    }
                                })
                            }
                            maxLength={6}
                        />
                    </View>
                </View>
            )}
            <View>
                {partner.formError && (
                    <Text style={Classes.errorText(colors)}>
                        {partner.formError}
                    </Text>
                )}
            </View>
            <View>
                {step === 1 ? (
                    <View style={Classes.nextButtonView(colors)}>
                        <Button
                            mode="contained"
                            onPress={() => setStep((step) => step + 1)}
                            style={[
                                Classes.nextButton(colors)
                                // { alignItems: "flex-end" }
                            ]}
                            // disabled={
                            //     !partner.formPartner.firstName ||
                            //     !partner.formPartner.lastName ||
                            //     !partner.formPartner.phoneNumber
                            // }
                        >
                            <View
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "center"
                                }}
                            >
                                <Text
                                    style={{
                                        fontSize: 25,
                                        textAlign: "center",
                                        alignSelf: "center"
                                    }}
                                >
                                    {t2("form.next")}
                                </Text>
                                <Icon
                                    name="arrow-forward"
                                    size={25}
                                    style={{
                                        alignSelf: "flex-end",
                                        color: colors.text
                                    }}
                                />
                            </View>
                        </Button>
                    </View>
                ) : (
                    <Button
                        mode="contained"
                        onPress={partner.actions.savePartner}
                        style={Classes.formButton(colors)}
                        disabled={
                            !partner.formPartner.firstName ||
                            !partner.formPartner.lastName ||
                            !partner.formPartner.phoneNumber ||
                            !partner.formPartner.cab.model ||
                            !partner.formPartner.cab.licensePlate
                        }
                    >
                        {t2("form.start")}
                    </Button>
                )}

                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "center",
                        marginTop: 30
                    }}
                >
                    <Text style={{ fontSize: 20 }}>
                        {t2("form.alreadyHaveAccount")}
                    </Text>
                    <TouchableOpacity
                        style={{ marginLeft: 10 }}
                        onPress={() => navigation.navigate("Login")}
                    >
                        <Text style={{ color: colors.accent, fontSize: 20 }}>
                            {t2("form.login")}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}
