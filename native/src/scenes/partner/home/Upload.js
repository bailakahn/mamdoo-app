import React from "react";
import { View, Image, ScrollView } from "react-native";
import { useTheme, Text } from "react-native-paper";
import { Classes } from "_styles";
import { t2 } from "_utils/lang";
import { Button, LoadingV2 } from "_atoms";
import { useApp, usePartner } from "_hooks";

export default function ForgotPassword({ navigation }) {
    const { colors } = useTheme();
    const app = useApp();
    const partner = usePartner();

    return partner.isLoading ? (
        <LoadingV2 />
    ) : (
        <>
            <ScrollView>
                <View style={Classes.container(colors)}>
                    <View style={{ marginTop: 20 }}>
                        <Image
                            source={require("_assets/logo.png")}
                            style={Classes.formLogo(colors)}
                        />
                    </View>
                    <View style={{ marginBottom: 25 }}>
                        <Text style={{ fontSize: 25, fontWeight: "bold" }}>
                            {t2("home.notActive")}
                        </Text>
                    </View>
                    <View style={Classes.centeredText(colors)}>
                        <Text style={{ textAlign: "left" }}>
                            {t2("home.notActiveText")}
                        </Text>
                    </View>
                    <View
                        style={{
                            ...Classes.centeredText(colors),
                            marginTop: 10
                        }}
                    >
                        <Text style={{ textAlign: "left" }}>
                            {t2("home.listOfIds")}
                        </Text>
                    </View>
                    <View
                        style={{
                            ...Classes.centeredText(colors),
                            marginTop: 10
                        }}
                    >
                        <Text style={{ textAlign: "left" }}>
                            {`\u2022 ${t2("home.driverLicence")}`}
                        </Text>
                        <Text style={{ textAlign: "left" }}>
                            {`\u2022 ${t2("home.licenceRegistration")}`}
                        </Text>
                    </View>
                    <View
                        style={{
                            ...Classes.centeredText(colors),
                            marginTop: 10
                        }}
                    >
                        <Text style={{ textAlign: "left" }}>
                            {t2("home.timeToValidate")}
                        </Text>
                    </View>
                    <View
                        style={{
                            ...Classes.centeredText(colors),
                            marginTop: 10
                        }}
                    >
                        <Text style={{ textAlign: "left" }}>
                            {t2("home.reloadText")}
                        </Text>
                    </View>
                    <View style={{ marginTop: 30, marginBottom: 20 }}>
                        <Button
                            // style={Classes.callButton(colors)}
                            {...Classes.callButtonContainer(colors)}
                            mode="contained"
                            onPress={partner.actions.refresh}
                        >
                            {`${t2("home.reloadButton")}`}
                        </Button>
                    </View>
                    <View
                        style={{
                            ...Classes.centeredText(colors),
                            marginTop: 10
                        }}
                    >
                        <Text style={{ textAlign: "left" }}>
                            {t2("home.afterDelay")}
                        </Text>
                    </View>
                    <View style={{ marginTop: 30, marginBottom: 20 }}>
                        <Button
                            // style={Classes.callButton(colors)}
                            {...Classes.callButtonContainer(colors)}
                            mode="contained"
                            onPress={app.actions.call}
                        >
                            {`${t2("home.call")} ${app.settings.phone}`}
                        </Button>
                    </View>
                </View>
            </ScrollView>
        </>
    );
}
