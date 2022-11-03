import React, { useState, useEffect } from "react";
import { View, TouchableOpacity } from "react-native";
import { Text, useTheme, Headline } from "react-native-paper";
import { Classes } from "_styles";
import { t } from "_utils/lang";
import {
    useProxy,
    useRequest,
    useNotifications,
    useLanguage,
    useUser,
    useApp
} from "_hooks";
import { Info } from "_molecules";
import { RoundButton, Button } from "_atoms";

export default function HomeScreen({ navigation, route }) {
    const [info, setInfo] = useState(false);
    // connect to proxy server
    useProxy();
    useNotifications();
    useLanguage();
    const user = useUser();
    const app = useApp();

    const { colors } = useTheme();

    const request = useRequest();
    const { params: { notFound } = {} } = route;

    useEffect(() => {
        setInfo(notFound ? true : false);
    }, [notFound]);

    return (
        <>
            <View style={Classes.container(colors)}>
                <Headline style={Classes.text(colors)}>
                    {t("home.welcome")}
                </Headline>
                {user.user?.firstName && (
                    <Text style={{ fontSize: 20, fontWeight: "bold" }}>
                        {user.user?.firstName}
                    </Text>
                )}
            </View>
            {user.user?.isBlocked && (
                <View
                    style={{
                        ...Classes.notice(colors, "error"),
                        justifyContent: "center",
                        alignItems: "center",
                        alignSelf: "center"
                    }}
                >
                    <View>
                        <Text style={{ fontSize: 20, fontWeight: "bold" }}>
                            {t("home.accountBlocked")}
                        </Text>
                    </View>
                    <View style={{ marginTop: 30 }}>
                        <Button
                            {...Classes.callButtonContainer(colors)}
                            mode="contained"
                            onPress={app.actions.call}
                        >
                            {`${t("main.callUs")}`}
                        </Button>
                    </View>
                </View>
            )}
            <View style={Classes.bottonView(colors)}>
                <RoundButton
                    disabled={user.user?.isBlocked}
                    size={0.35}
                    color={user.user?.isBlocked ? "lightgray" : "primary"}
                    text={t("home.bookRide")}
                    onPress={() => {
                        request.actions.makeRideRequest(navigation);
                        navigation.navigate("RideRequest");
                    }}
                    shadow={{ size: 0.3 }}
                />

                <View style={{ marginTop: 30 }}>
                    <Info
                        visible={info}
                        text={t("home.noDriver")}
                        onDismiss={() => {
                            navigation.setParams({ notFound: false });
                            setInfo(false);
                        }}
                        onClose={() => {
                            navigation.setParams({ notFound: false });
                            setInfo(false);
                        }}
                    />
                </View>
            </View>
        </>
    );
}
