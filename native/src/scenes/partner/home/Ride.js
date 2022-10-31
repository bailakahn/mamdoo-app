import React, { useRef, useEffect, useState } from "react";
import { View, Image, Platform, useColorScheme } from "react-native";
import { useTheme, Text } from "react-native-paper";
import LottieView from "lottie-react-native";
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
import { RoundButton, Button } from "_atoms";
import { Info } from "_molecules";
import PopConfirm from "_organisms/PopConfirm";

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
    const [visible, setVisible] = useState(false);
    const [endRidePopConfirmVisible, setEndRidePopConfirmVisible] =
        useState(false);

    useEffect(() => {
        if (animation.current) animation.current.play();
    }, [ride.driverArrived]);

    if (!ride.request) return null;

    return (
        <View style={Classes.container(colors)}>
            {visible && (
                <PopConfirm
                    title={t2("ride.cancelConfirmTitle")}
                    visible={visible}
                    setVisible={setVisible}
                    content={t2("ride.canceConfirmContent")}
                    onCancel={() => setVisible(false)}
                    cancelText={t2("ride.cancelConfirmCancel")}
                    onConfirm={() => {
                        setVisible(false);
                        ride.actions.cancelRide();
                    }}
                    okText={t2("ride.cancelConfirmOk")}
                    isRounded={true}
                />
            )}
            {endRidePopConfirmVisible && (
                <PopConfirm
                    title={t2("ride.endConfirmTitle")}
                    visible={endRidePopConfirmVisible}
                    setVisible={setEndRidePopConfirmVisible}
                    content={t2("ride.endConfirmContent")}
                    onCancel={() => setEndRidePopConfirmVisible(false)}
                    cancelText={t2("ride.endConfirmCancel")}
                    onConfirm={() => {
                        setEndRidePopConfirmVisible(false);
                        ride.actions.onEndRide();
                    }}
                    okText={t2("ride.endConfirmOk")}
                    isRounded={true}
                    okButtonProps={{ color: "success" }}
                    cancelButtonProps={{ color: "error" }}
                />
            )}

            <Text style={{ fontSize: 30, fontWeight: "bold" }}>
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
                    {ride.request.client.phoneNumber}
                </Text>
            </View>

            {!ride.driverArrived && (
                <View style={{ marginTop: 30, flexDirection: "row" }}>
                    <RoundButton
                        size={0.35}
                        shadow={{ size: 0.3 }}
                        color="error"
                        text={t2("ride.cancelRide")}
                        onPress={() => setVisible(true)}
                    />
                    <View style={{ marginRight: 50 }} />
                    <RoundButton
                        size={0.35}
                        shadow={{ size: 0.3 }}
                        color="grey"
                        text={t2("ride.openMap")}
                        onPress={ride.actions.openMap}
                    />
                </View>
            )}

            <View style={{ marginTop: 30, flexDirection: "row" }}>
                <RoundButton
                    size={0.35}
                    shadow={{ size: 0.3 }}
                    color="primary"
                    text={`${t2("ride.callRider")} ${
                        ride.request.client.firstName
                    }`}
                    onPress={ride.actions.callDriver}
                />
                <View style={{ marginRight: 50 }} />

                {!ride.driverArrived ? (
                    <RoundButton
                        size={0.35}
                        shadow={{ size: 0.3 }}
                        color="success"
                        text={t2("ride.arrived")}
                        onPress={ride.actions.onDriverArrived}
                    />
                ) : (
                    <RoundButton
                        size={0.35}
                        shadow={{ size: 0.3 }}
                        color="success"
                        text={t2("ride.endRide")}
                        onPress={() => setEndRidePopConfirmVisible(true)}
                    />
                )}
            </View>

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
