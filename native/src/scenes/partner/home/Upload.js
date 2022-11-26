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
            {/* <ScrollView> */}
            {/* <View style={Classes.container(colors)}> */}
            <View
                style={{
                    ...Classes.centeredView(colors),
                    alignItems: "center"
                }}
            >
                <Text
                    style={{
                        fontSize: 25,
                        fontWeight: "bold"
                    }}
                >
                    {t2("main.mandatoyStepsTitle")}
                </Text>

                <Text
                    style={{
                        fontSize: 15,
                        marginTop: 10
                    }}
                >
                    {t2("main.mandatoyStepsDescription")}
                </Text>
            </View>

            <View
                style={{
                    ...Classes.centeredView(colors),
                    marginTop: 20
                }}
            >
                <View style={Classes.uploadDocuments(colors)}>
                    <List.Item
                        title={t2("main.profilePicture")}
                        titleNumberOfLines={5}
                        left={(props) => (
                            <List.Icon
                                {...props}
                                icon={"camera"}
                                color={colors.primary}
                            />
                        )}
                        right={(props) => (
                            <List.Icon {...props} icon={"chevron-right"} />
                        )}
                        onPress={() => navigation.navigate("ProfilePicture")}
                    />
                </View>
            </View>
            {/* </View> */}
            {/* </ScrollView> */}
        </SafeAreaView>
    );
}
