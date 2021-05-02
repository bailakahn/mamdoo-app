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
import { RoundButton } from "_atoms";
import { Info } from "_molecules";

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

            {!ride.driverArrived && (
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
            )}

            <View style={{ marginTop: 30 }}>
                <Button
                    style={Classes.callButton(colors)}
                    mode="contained"
                    onPress={ride.actions.callDriver}
                >
                    {t2("ride.callRider")} {ride.request.client.firstName}
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
                        <Text
                            style={[
                                Classes.text(colors),
                                {
                                    fontSize: 20,
                                    fontWeight: "bold",
                                    color: colors.accent
                                }
                            ]}
                        >
                            Call Mamdoo to cancel ride
                        </Text>
                    )}
                </View>
            )}

            {!ride.driverArrived ? (
                <View style={{ marginTop: 30 }}>
                    <RoundButton
                        size={0.35}
                        shadow={{ size: 0.3 }}
                        color="text"
                        text={t2("ride.arrived")}
                        onPress={ride.actions.onDriverArrived}
                    />
                </View>
            ) : (
                <View style={{ marginTop: 30 }}>
                    <RoundButton
                        size={0.35}
                        shadow={{ size: 0.3 }}
                        color="accent"
                        text={t2("ride.endRide")}
                        onPress={ride.actions.onEndRide}
                    />
                </View>
            )}

            <View style={{ marginTop: 30 }}>
                <Info
                    visible={ride.info}
                    text={t2(`ride.clientOnHisWay`)}
                    onDismiss={() => ride.actions.setInfo(false)}
                    onClose={() => ride.actions.setInfo(false)}
                />
            </View>
        </View>
    );
}
