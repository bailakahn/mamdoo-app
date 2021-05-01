import React, { useRef, useEffect, useMemo } from "react";
import { View, Text, Image, Platform } from "react-native";
import { Button, useTheme, us } from "react-native-paper";
import LottieView from "lottie-react-native";
import { useColorScheme } from "react-native-appearance";
import Icon from "react-native-vector-icons/MaterialIcons";
import { Classes } from "_styles";
import { t2 } from "_utils/lang";
import LightAvatar from "_assets/animation/light-avatar.json";
import LightAvatarGif from "_assets/animation/light-avatar.gif";
import DarkAvatarGif from "_assets/animation/dark-avatar.gif";
import DarkAvatar from "_assets/animation/dark-avatar.json";
import ReadyAmimation from "_assets/animation/ready.json";
import LightReadyAmimation from "_assets/animation/light-ready.gif";
import DarkReadyAmimation from "_assets/animation/dark-ready.gif";
import { useRide } from "_hooks/partner";

export default function DriverOnTheWayScene() {
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

    if (!ride.request) return null;

    return (
        <View style={Classes.container(colors)}>
            <Text
                style={[
                    Classes.text(colors),
                    { fontSize: 30, fontWeight: "bold" }
                ]}
            >
                {`${ride.request.client.firstName} ${ride.request.client.lastName}`}
                {/* {t("ride.foundMamdoo")} */}
            </Text>

            {ride.driverArrived && (
                <Text
                    style={[
                        Classes.text(colors),
                        {
                            fontSize: 30,
                            fontWeight: "bold"
                        }
                    ]}
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

            <View style={{ marginTop: 40, flexDirection: "row" }}>
                <Text
                    style={[
                        Classes.text(colors),
                        {
                            fontWeight: "bold",
                            marginRight: 20
                        }
                    ]}
                >
                    <Icon size={40} name="phone-forwarded" />
                </Text>
                <Text
                    style={[
                        Classes.text(colors),
                        {
                            fontSize: 25,
                            fontWeight: "bold"
                        }
                    ]}
                >
                    {ride.request.client.phoneNumber}
                </Text>
            </View>

            <View style={{ marginTop: 30 }}>
                <Button
                    style={Classes.openMapButton(colors)}
                    mode="contained"
                    onPress={ride.actions.openMap}
                    color="#04009A"
                    labelStyle={{ color: colors.text }}
                >
                    {t2("ride.openMap")}
                </Button>
            </View>

            <View style={{ marginTop: 30 }}>
                <Button
                    style={Classes.callButton(colors)}
                    mode="contained"
                    onPress={ride.actions.callDriver}
                >
                    {t2("ride.callDriver")} {ride.request.client.firstName}
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
                            {t2("ride.cancelRide")}
                        </Button>
                    ) : (
                        <Button
                            style={[
                                Classes.callButton(colors),
                                { backgroundColor: colors.accent }
                            ]}
                            mode="contained"
                            onPress={ride.actions.cancelRide}
                        >
                            {t2("ride.cancelRide")}
                        </Button>
                    )}
                </View>
            )}
        </View>
    );
}
