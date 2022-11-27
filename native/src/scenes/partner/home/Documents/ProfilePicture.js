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

export default function ProfilePicture({ navigation }) {
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
        {partner.uploadDocuments.profilePicture ? (
            <View style={{ alignItems: "center" }}>
                <View style={{ alignItems: "center", marginTop: 20 }}>
                    <Image
                        source={{
                            uri: partner.uploadDocuments?.profilePicture
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
                        {`${t2("main.profilePictureUse")}`}
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
                                profilePicture: null
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
                        {t2("main.profilePictureTitle")}
                    </Text>
                    <Text
                        style={{
                            fontSize: 15,
                            marginTop: 20
                        }}
                    >
                        {t2("main.profilePictureDescription")}
                    </Text>
                    <ScrollView style={Classes.uploadInstructions(colors)}>
                        <Text
                            style={{
                                fontSize: 15,
                                marginTop: 10
                            }}
                        >
                            {`1. ${t2("main.profilePictureTipOne")}`}
                        </Text>
                        <Text
                            style={{
                                fontSize: 15,
                                marginTop: 10
                            }}
                        >
                            {`2. ${t2("main.profilePictureTipTwo")}`}
                        </Text>
                        <Text
                            style={{
                                fontSize: 15,
                                marginTop: 10
                            }}
                        >
                            {`3. ${t2("main.profilePictureTipThree")}`}
                        </Text>
                        <View style={{ alignItems: "center", marginTop: 30 }}>
                            <Text>Example</Text>
                            <Image
                                source={require("_assets/avatar.png")}
                                style={{
                                    width: Mixins.width(0.4, true),
                                    height: Mixins.height(0.2, true)
                                }}
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
                                    profilePicture: result.uri
                                });
                            })
                        }
                    >
                        <Text>{`${t2("main.profilePictureTake")}`}</Text>
                    </Button>
                </View>
            </View>
        )}
    </SafeAreaView>;
}
