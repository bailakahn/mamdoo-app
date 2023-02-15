import React, { useRef, useEffect, useState } from "react";
import { View, SafeAreaView, ScrollView, Platform } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { Classes } from "_styles";
import Icon from "react-native-vector-icons/MaterialIcons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { t } from "_utils/lang";
import LottieView from "lottie-react-native";
import PinAnimation from "_assets/animation/location-pin-jumping-animation-11.json";
import { useRide, useRequest } from "_hooks";
import { Info } from "_molecules";
import { RoundButton } from "_atoms";
import PopConfirm from "_organisms/PopConfirm";

export default function RideRequestScreen({ navigation, route }) {
  const { colors } = useTheme();
  const animation = useRef();

  const ride = useRide();
  const request = useRequest();
  const [visible, setVisible] = useState(false);

  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    if (animation.current) animation.current.play();
  }, []);

  useEffect(() => {
    if ((ride.canceled && route?.params?.driverId) || ride.denied) {
      setDisabled(true);
      request.actions.makeRideRequest(
        navigation,
        route?.params?.driverId,
        setDisabled
      );
    }
  }, [ride.canceled, ride.denied, route]);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colors.background,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 50,
      }}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View style={Classes.container(colors)}>
          <PopConfirm
            title={t("ride.cancelConfirmTitle")}
            visible={visible}
            setVisible={setVisible}
            content={t("ride.canceConfirmContent")}
            onCancel={() => setVisible(false)}
            cancelText={
              <View
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MaterialCommunityIcons
                  size={40}
                  name="arrow-left"
                  color={"#fff"}
                />
                <Text style={{ color: "#fff" }}>
                  {t("ride.cancelConfirmCancel")}
                </Text>
              </View>
            }
            onConfirm={() => {
              setVisible(false);
              ride.actions.cancelNewRequest();
            }}
            okText={
              <View
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon size={40} name="clear" color={"#fff"} />
                <Text style={{ color: "#fff" }}>
                  {t("ride.cancelConfirmOk")}
                </Text>
              </View>
            }
            isRounded={true}
          />
          {!!request.nearByDrivers && (
            <PopConfirm
              title={t("ride.rideFoundExactDrivers", {
                drivers: request.nearByDrivers,
              })}
              visible={!!request.nearByDrivers}
              setVisible={request.actions.setNearByDrivers}
              content={
                Platform.OS === "ios" ? (
                  <View style={{ display: "flex", alignItems: "center" }}>
                    <Text style={{ fontSize: 20 }}>
                      {t("ride.confirmRide")}
                    </Text>
                  </View>
                ) : (
                  <Text>{t("ride.confirmRide")}</Text>
                )
              }
              onDismiss={() => {
                request.actions.setNearByDrivers(false);
                navigation.navigate("Home");
              }}
              onCancel={() => {
                request.actions.setNearByDrivers(false);
                navigation.navigate("Home");
              }}
              cancelText={
                <View
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={40} name="clear" color={"#fff"} />
                  <Text style={{ color: "#fff" }}>
                    {t("ride.cancelConfirmCancel")}
                  </Text>
                </View>
              }
              onConfirm={() => {
                request.actions.setNearByDrivers(false);
                request.actions.makeRideRequest(navigation);
                navigation.navigate("RideRequest");
              }}
              okText={
                <View
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={40} name="check" color={"#fff"} />
                  <Text style={{ color: "#fff" }}>
                    {t("ride.cancelConfirmOk")}
                  </Text>
                </View>
              }
              okButtonProps={{ color: "primary" }}
              cancelButtonProps={{ color: "error" }}
              isRounded={true}
            />
          )}
          {ride.canceled && (
            <Info
              visible={ride.canceled}
              text={t(`ride.rideCanceled`)}
              onDismiss={() => ride.actions.setRideCanceled(false)}
              onClose={() => ride.actions.setRideCanceled(false)}
            />
          )}
          {ride.denied && (
            <Info
              visible={ride.denied}
              text={t(`ride.rideDenied`)}
              onDismiss={() => ride.actions.setRideDenied(false)}
              onClose={() => ride.actions.setRideDenied(false)}
            />
          )}
          {ride.rideRequestMessage && (
            <Info
              visible={!!ride.rideRequestMessage}
              text={
                <Text style={{ fontSize: 20 }}>{ride.rideRequestMessage}</Text>
              }
              onDismiss={() => ride.actions.setRideRequestMessage(false)}
              onClose={() => ride.actions.setRideRequestMessage(false)}
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
                height: 400,
              },
            ]}
            source={PinAnimation}
          />
          <Text style={{ fontSize: 30, fontWeight: "bold" }}>
            {t("ride.mamdoo")}
          </Text>

          <View style={{ marginTop: 20 }}>
            <RoundButton
              disabled={disabled}
              size={0.35}
              shadow={{ size: 0.3 }}
              color="error"
              text={
                <View
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={40} name="clear" color={"#fff"} />
                  <Text style={{ color: "#fff" }}>{t("ride.cancelRide")}</Text>
                </View>
              }
              onPress={() => setVisible(true)}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
