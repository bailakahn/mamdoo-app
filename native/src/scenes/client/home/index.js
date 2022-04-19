import React, { useState, useEffect } from "react";
import { View, TouchableOpacity } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { Classes } from "_styles";
import { t } from "_utils/lang";
import { useProxy, useRequest, useNotifications, useLanguage } from "_hooks";
import { Info } from "_molecules";

export default function HomeScreen({ navigation, route }) {
    const [info, setInfo] = useState(false);
    // connect to proxy server
    useProxy();
    useNotifications();
    useLanguage();

    const { colors } = useTheme();

    const request = useRequest();
    const { params: { notFound } = {} } = route;

    useEffect(() => {
        setInfo(notFound ? true : false);
    }, [notFound]);

    return (
        <View style={Classes.container(colors)}>
            <TouchableOpacity
                onPress={() => {
                    request.actions.makeRideRequest(navigation);
                    navigation.navigate("RideRequest");
                }}
                style={Classes.roundedButton(colors)}
            >
                <Text>{t("home.bookRide")}</Text>
            </TouchableOpacity>
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
    );
}
