import React from "react";
import { View, Image, ScrollView, SafeAreaView } from "react-native";
import { useTheme, Text, List } from "react-native-paper";
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
        <SafeAreaView
            style={{
                flex: 1,
                backgroundColor: colors.background,
                alignItems: "center",
                justifyContent: "center"
            }}
        >
            <View
                style={{
                    ...Classes.centeredViewUpload(colors),
                    alignItems: "center"
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
                        fontSize: 20,
                        marginTop: 10
                    }}
                >
                    {t2("main.profilePictureDescription")}
                </Text>
            </View>

            <View
                style={{
                    ...Classes.centeredView(colors),
                    marginTop: 20
                }}
            >
                <ScrollView style={Classes.uploadDocuments(colors)}>
                    <Text
                        style={{
                            fontSize: 15,
                            textAlign: "left",
                            marginTop: 10
                        }}
                    >
                        {`1. ${t2("main.profilePictureTipOne")}`}
                    </Text>
                    <Text
                        style={{
                            fontSize: 15,
                            textAlign: "left",
                            marginTop: 10
                        }}
                    >
                        {`2. ${t2("main.profilePictureTipTwo")}`}
                    </Text>
                    <Text
                        style={{
                            fontSize: 15,
                            textAlign: "left",
                            marginTop: 10
                        }}
                    >
                        {`3. ${t2("main.profilePictureTipThree")}`}
                    </Text>
                </ScrollView>
            </View>

            <View style={{ marginTop: 30, marginBottom: 20 }}>
                <Button
                    // style={Classes.callButton(colors)}
                    {...Classes.callButtonContainer(colors)}
                    mode="contained"
                    onPress={() => navigation.navigate("UploadInstructions")}
                >
                    {`${t2("main.profilePictureTake")}`}
                </Button>
            </View>
        </SafeAreaView>
    );
}
