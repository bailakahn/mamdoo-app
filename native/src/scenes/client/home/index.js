import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { Classes } from "_styles";
import { t } from "_utils/lang";
import { useProxy, useRequest } from "_hooks";
export default function HomeScreen({ navigation }) {
    // connect to proxy server
    useProxy();
    const { colors } = useTheme();

    const request = useRequest();

    return (
        <View style={Classes.container(colors)}>
            <TouchableOpacity
                onPress={() => {
                    request.actions.makeRideRequest();
                    navigation.navigate("RideRequest");
                }}
                style={Classes.roundedButton(colors)}
            >
                <Text>{t("home.bookRide")}</Text>
            </TouchableOpacity>
        </View>
    );
}
