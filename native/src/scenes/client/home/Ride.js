import React, { useRef, useEffect, useMemo } from "react";
import { View, Image, Platform } from "react-native";
import { useTheme, Text } from "react-native-paper";
import LottieView from "lottie-react-native";
import { useColorScheme } from "react-native-appearance";
import Icon from "react-native-vector-icons/MaterialIcons";
import { Classes } from "_styles";
import { t } from "_utils/lang";
import LightAvatar from "_assets/animation/light-avatar.json";
import LightAvatarGif from "_assets/animation/light-avatar.gif";
import DarkAvatarGif from "_assets/animation/dark-avatar.gif";
import DarkAvatar from "_assets/animation/dark-avatar.json";
import ReadyAmimation from "_assets/animation/ready.json";
import LightReadyAmimation from "_assets/animation/light-ready.gif";
import DarkReadyAmimation from "_assets/animation/dark-ready.gif";
import { useRide } from "_hooks";
import { Button } from "_atoms";

export default function RideRequestScreen() {
    const { colors } = useTheme();
    const ride = useRide();

    const colorScheme = useColorScheme();

    const avatarAnimation = colorScheme === "dark" ? DarkAvatar : LightAvatar;
    const avatarAnimationGif =
        colorScheme === "dark" ? DarkAvatarGif : LightAvatarGif;
    const readyAnimationGif =
        colorScheme === "dark" ? DarkReadyAmimation : LightReadyAmimation;

    const animation = useRef();

    useEffect(() => {
        if (animation.current) animation.current.play();
    }, [ride.driverArrived]);

    if (!ride.driver) return null;

    return (
        <View style={Classes.container(colors)}>
            <Text style={{ fontSize: 30, fontWeight: "bold" }}>
                {`${ride.driver.firstName} ${ride.driver.lastName}`}
                {/* {t("ride.foundMamdoo")} */}
            </Text>

            {ride.driverArrived && (
                <Text
                    style={{
                        fontSize: 30,
                        fontWeight: "bold"
                    }}
                >
                    {t("ride.driverArrived")}
                </Text>
            )}

            {Platform.OS === "ios" ? (
                <LottieView
                    ref={animation}
                    style={[
                        Classes.animation(colors),
                        {
                            width: 200,
                            height: 200
                        }
                    ]}
                    source={
                        ride.driverArrived ? ReadyAmimation : avatarAnimation
                    }
                />
            ) : (
                <Image
                    source={
                        ride.driverArrived
                            ? readyAnimationGif
                            : avatarAnimationGif
                    }
                    style={{
                        width: 200,
                        height: 200,
                        backgroundColor: colors.background
                    }}
                />
            )}

            {!ride.driverArrived && (
                <Text
                    style={{
                        fontSize: 15,
                        fontWeight: "bold"
                    }}
                >
                    {t("ride.isOnHisWay")}
                </Text>
            )}

            <View>
                <Text
                    style={{
                        fontSize: 20,
                        fontWeight: "bold"
                    }}
                >
                    {t("ride.meetHimOutside")}
                </Text>
            </View>

            <View style={{ marginTop: 40, flexDirection: "row" }}>
                <Text
                    style={{
                        fontWeight: "bold",
                        marginRight: 20
                    }}
                >
                    <Icon size={40} name="phone-forwarded" />
                </Text>
                <Text
                    style={{
                        fontSize: 25,
                        fontWeight: "bold"
                    }}
                >
                    {ride.driver.phoneNumber}
                </Text>
            </View>

            <View style={{ marginTop: 30 }}>
                <Button
                    style={Classes.callButton(colors)}
                    mode="contained"
                    onPress={ride.actions.callDriver}
                >
                    {t("ride.callDriver")} {ride.driver.firstName}
                </Button>
            </View>

            {!ride.driverArrived && (
                <View style={{ marginTop: 30 }}>
                    {ride.canCancel ? (
                        <Button
                            style={[
                                Classes.callButton(colors),
                                { backgroundColor: colors.accent }
                            ]}
                            mode="contained"
                            onPress={ride.actions.cancelRide}
                        >
                            {t("ride.cancelRide")}
                        </Button>
                    ) : (
                        <Text
                            style={{
                                fontSize: 20,
                                fontWeight: "bold",
                                color: colors.accent
                            }}
                        >
                            Call Mamdoo to cancel ride
                        </Text>
                    )}
                </View>
            )}
        </View>
    );
}
