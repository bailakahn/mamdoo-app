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

export default function CabLicense({ navigation }) {
    const { colors } = useTheme();
    const partner = usePartner();
    const upload = useUpload();

    return (
        <SafeAreaView
            style={{
                flex: 1,
                backgroundColor: colors.background,
                alignItems: "center",
                justifyContent: "center"
            }}
        >
            {partner.uploadDocuments.cabLicense ? (
                <View style={{ alignItems: "center" }}>
                    <View style={{ alignItems: "center", marginTop: 20 }}>
                        <Image
                            source={{
                                uri: partner.uploadDocuments?.cabLicense
                            }}
                            style={Classes.profilePicture(colors)}
                        />
                    </View>
                    <View style={{ marginTop: 30 }}>
                        <Button
                            {...Classes.callButtonContainer(colors)}
                            mode="contained"
                            onPress={() => navigation.navigate("Upload")}
                        >
                            {`${t2("upload.useThisPicture")}`}
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
                                    cabLicense: null
                                });
                            }}
                        >
                            <Text style={{ color: colors.error, fontSize: 20 }}>
                                {t2("upload.takeAgain")}
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
                            {t2("upload.cabLicenseTitle")}
                        </Text>
                        <Text
                            style={{
                                fontSize: 15,
                                marginTop: 20
                            }}
                        >
                            {t2("upload.cabLicenseDescription")}
                        </Text>
                        <ScrollView style={Classes.uploadInstructions(colors)}>
                            <View
                                style={{ alignItems: "center", marginTop: 30 }}
                            >
                                <Image
                                    source={require("_assets/registration.png")}
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
                            marginBottom: 20,
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
                                        cabLicense: result.uri
                                    });
                                })
                            }
                        >
                            <Text>{`${t2("upload.profilePictureTake")}`}</Text>
                        </Button>
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
}
