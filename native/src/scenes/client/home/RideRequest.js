import React, { useRef, useEffect } from "react";
import { View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { Classes } from "_styles";
import { t } from "_utils/lang";
import LottieView from "lottie-react-native";
import PinAnimation from "_assets/animation/location-pin-jumping-animation-11.json";
import { useRide, useRequest } from "_hooks";
import { Info } from "_molecules";

export default function RideRequestScreen({ navigation }) {
    const { colors } = useTheme();
    const animation = useRef();

    const ride = useRide();
    const request = useRequest();

    useEffect(() => {
        if (animation.current) animation.current.play();
    }, []);

    useEffect(() => {
        if (ride.canceled) request.actions.makeRideRequest(navigation);
    }, [ride.canceled]);

    return (
        <View style={Classes.container(colors)}>
            {ride.canceled && (
                <Info
                    visible={ride.canceled}
                    text={t(`ride.rideCanceled`)}
                    onDismiss={() => ride.actions.setRideCanceled(false)}
                    onClose={() => ride.actions.setRideCanceled(false)}
                />
            )}
            <Text style={{ fontSize: 30, fontWeight: "bold" }}>
                {t("ride.driverSearch")}
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
            <Text style={{ fontSize: 30, fontWeight: "bold" }}>
                {t("ride.mamdoo")}
            </Text>
        </View>
    );
}
