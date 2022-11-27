import React from "react";
import {
    View,
    Image,
    ScrollView,
    SafeAreaView,
    TouchableOpacity
} from "react-native";
import { useTheme, Text } from "react-native-paper";
import { Classes } from "_styles";
import { t2 } from "_utils/lang";
import { Button } from "_atoms";
import { usePartner } from "_hooks";
import useUpload from "../../../../hooks/partner/useUpload";
import * as Mixins from "../../../../styles/mixins";

export default function DriverLicense({ navigation }) {
    const { colors } = useTheme();
    const partner = usePartner();
    const upload = useUpload();

    return;
    <SafeAreaView
        style={{
            flex: 1,
            backgroundColor: colors.background,
            alignItems: "center",
            justifyContent: "center"
        }}
    >
        {partner.uploadDocuments.driverLicenseFront &&
        partner.uploadDocuments.driverLicenseBack ? (
            <View style={{ alignItems: "center" }}>
                <View style={{ alignItems: "center", marginTop: 20 }}>
                    <Image
                        source={{
                            uri: partner.uploadDocuments?.driverLicenseFront
                        }}
                        style={{
                            width: Mixins.width(0.6, true),
                            height: Mixins.height(0.2, true)
                        }}
                        resizeMode="contain"
                    />
                    <Image
                        source={{
                            uri: partner.uploadDocuments?.driverLicenseBack
                        }}
                        style={{
                            width: Mixins.width(0.6, true),
                            height: Mixins.height(0.2, true),
                            marginTop: 20
                        }}
                        resizeMode="contain"
                    />
                </View>

                <View style={{ marginTop: 30 }}>
                    <Button
                        {...Classes.callButtonContainer(colors)}
                        mode="contained"
                        onPress={() => navigation.navigate("Upload")}
                    >
                        {`${t2("main.useThisPicture")}`}
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
                        onPress={() => {
                            partner.actions.setUploadDocuments({
                                ...partner.uploadDocuments,
                                driverLicenseFront: null,
                                driverLicenseBack: null
                            });
                        }}
                    >
                        <Text style={{ color: colors.error, fontSize: 20 }}>
                            {t2("main.takeAgain")}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        ) : (
            <View>
                <View
                    style={{
                        width: Mixins.width(0.95, true),
                        alignItems: "center",
                        justifyContent: "center"
                    }}
                >
                    <Text
                        style={{
                            fontSize: 25,
                            fontWeight: "bold"
                        }}
                    >
                        {t2("main.driverLicenceTitle")}
                    </Text>
                    <Text
                        style={{
                            fontSize: 15,
                            marginTop: 20
                        }}
                    >
                        {t2("main.driverLicenceDescription")}
                    </Text>
                    <ScrollView style={Classes.uploadInstructions(colors)}>
                        <View
                            style={{
                                flexDirection: "column",
                                alignItems: "center",
                                marginTop: 30
                            }}
                        >
                            <Image
                                source={require("_assets/driver-license-front.png")}
                                style={{
                                    width: Mixins.width(0.6, true),
                                    height: Mixins.height(0.2, true)
                                }}
                                resizeMode="contain"
                            />
                            <Image
                                source={require("_assets/driver-license-back.png")}
                                style={{
                                    width: Mixins.width(0.6, true),
                                    height: Mixins.height(0.2, true)
                                }}
                                resizeMode="contain"
                            />
                        </View>
                    </ScrollView>
                </View>

                <View
                    style={{
                        marginTop: 30,
                        alignItems: "center"
                    }}
                >
                    <Button
                        {...Classes.callButtonContainer(colors)}
                        mode="contained"
                        onPress={() =>
                            upload.actions.pickImage((result) => {
                                partner.actions.setUploadDocuments({
                                    ...partner.uploadDocuments,
                                    driverLicenseFront: result.uri
                                });
                            })
                        }
                    >
                        <Text>{`${t2("main.driverLicenceFront")}`}</Text>
                    </Button>
                </View>
                <View
                    style={{
                        marginTop: 30,
                        alignItems: "center"
                    }}
                >
                    <Button
                        {...Classes.callButtonContainer(colors)}
                        mode="contained"
                        onPress={() =>
                            upload.actions.pickImage((result) => {
                                partner.actions.setUploadDocuments({
                                    ...partner.uploadDocuments,
                                    driverLicenseBack: result.uri
                                });
                            })
                        }
                    >
                        <Text>{`${t2("main.driverLicenceBack")}`}</Text>
                    </Button>
                </View>
            </View>
        )}
    </SafeAreaView>;
}
