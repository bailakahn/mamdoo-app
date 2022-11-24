import React from "react";
import { View, SafeAreaView, ScrollView } from "react-native";
import { useTheme, Text, List } from "react-native-paper";
import { Classes } from "_styles";
import { t2 } from "_utils/lang";
import { Button } from "_atoms";

export default function ForgotPassword({ navigation }) {
    const { colors } = useTheme();

    return (
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
                    {t2("main.uploadDocumentsTipsTitle")}
                </Text>

                <Text
                    style={{
                        fontSize: 15,
                        marginTop: 10
                    }}
                >
                    {t2("main.uploadDocumentsTipsDescription")}
                </Text>
            </View>
            <View
                style={{
                    ...Classes.centeredView(colors),
                    marginTop: 20
                }}
            >
                <ScrollView style={Classes.uploadInstructions(colors)}>
                    <List.Item
                        title={t2("main.tipOneTitle")}
                        description={t2("main.tipOneDescription")}
                        titleNumberOfLines={5}
                        descriptionNumberOfLines={15}
                        descriptionStyle={{ marginTop: 5 }}
                        left={(props) => (
                            <List.Icon
                                {...props}
                                icon={"file-star"}
                                color={colors.primary}
                            />
                        )}
                    />
                    <List.Item
                        title={t2("main.tipTwoTitle")}
                        description={t2("main.tipTwoDescription")}
                        titleNumberOfLines={5}
                        descriptionNumberOfLines={15}
                        descriptionStyle={{ marginTop: 5 }}
                        left={(props) => (
                            <List.Icon
                                {...props}
                                icon={"vector-square"}
                                color={colors.primary}
                            />
                        )}
                    />
                    <List.Item
                        title={t2("main.tipThreeTitle")}
                        description={t2("main.tipThreeDescription")}
                        titleNumberOfLines={5}
                        descriptionNumberOfLines={15}
                        descriptionStyle={{ marginTop: 5 }}
                        left={(props) => (
                            <List.Icon
                                {...props}
                                icon={"safe-square"}
                                color={colors.primary}
                            />
                        )}
                    />
                    <List.Item
                        title={t2("main.tipFourTitle")}
                        description={t2("main.tipFourDescription")}
                        titleNumberOfLines={5}
                        descriptionNumberOfLines={15}
                        descriptionStyle={{ marginTop: 5 }}
                        left={(props) => (
                            <List.Icon
                                {...props}
                                icon={"cloud-upload"}
                                color={colors.primary}
                            />
                        )}
                    />
                </ScrollView>
                <View
                    style={{
                        alignItems: "center",
                        marginTop: 50
                    }}
                >
                    <Button
                        mode="contained"
                        onPress={() => {
                            navigation.navigate("Upload");
                        }}
                        color={colors.primary}
                        {...Classes.callButtonContainer(colors)}
                    >
                        {t2("main.understood")}
                    </Button>
                </View>
            </View>
        </SafeAreaView>
    );
}
