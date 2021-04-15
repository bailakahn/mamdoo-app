import React, { useRef, useEffect, useMemo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Button, useTheme } from "react-native-paper";
import { Classes } from "_styles";
import { t } from "_utils/lang";
import LottieView from "lottie-react-native";
import PinAnimation from "_assets/animation/location-pin-jumping-animation-11.json";

export default function RideRequestScreen() {
    const { colors } = useTheme();
    const animation = useRef();

    useEffect(() => {
        if (animation.current) animation.current.play();
    }, []);

    return (
        <View style={Classes.container(colors)}>
            <Text
                style={[
                    Classes.text(colors),
                    { fontSize: 30, fontWeight: "bold" }
                ]}
            >
                {t("rideRequest.driverSearch")}
            </Text>

            <LottieView
                ref={animation}
                style={[
                    Classes.animation(colors),
                    {
                        width: 400,
                        height: 400
                    }
                ]}
                source={PinAnimation}
            />
            <Text
                style={[
                    Classes.text(colors),
                    { fontSize: 30, fontWeight: "bold" }
                ]}
            >
                {t("rideRequest.mamdoo")}
            </Text>
        </View>
    );
}
