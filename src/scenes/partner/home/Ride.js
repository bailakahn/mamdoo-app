import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Image,
  Platform,
  useColorScheme,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { useTheme, Text } from "react-native-paper";
import LottieView from "lottie-react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
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
import { RoundButton, LoadingV2 } from "_atoms";
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

  return ride.isLoading ? (
    <LoadingV2 />
  ) : (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colors.background,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View
          style={{
            ...Classes.container(colors),
          }}
        >
          {visible && (
            <PopConfirm
              title={t2("ride.cancelConfirmTitle")}
              visible={visible}
              setVisible={setVisible}
              content={t2("ride.canceConfirmContent")}
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
                    {t2("ride.cancelConfirmCancel")}
                  </Text>
                </View>
              }
              onConfirm={() => {
                setVisible(false);
                ride.actions.cancelRide();
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
                    {t2("ride.cancelConfirmOk")}
                  </Text>
                </View>
              }
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
              cancelText={
                <View
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={40} name="clear" color={"#fff"} />
                  <Text style={{ color: "#fff" }}>{t2("ride.cancelRide")}</Text>
                </View>
              }
              onConfirm={() => {
                setEndRidePopConfirmVisible(false);
                ride.actions.onEndRide();
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
                  <Text style={{ color: "#fff" }}>{t2("ride.endRide")}</Text>
                </View>
              }
              isRounded={true}
              okButtonProps={{ color: "success" }}
              cancelButtonProps={{ color: "error" }}
            />
          )}

          <Text style={{ fontSize: 30, fontWeight: "bold" }}>
            {`${ride.request.client.firstName} ${ride.request.client.lastName}`}
            {/* {t("ride.foundMamdoo")} */}
          </Text>

          <LottieView
            ref={animation}
            style={[
              Classes.animation(colors),
              {
                width: 200,
                height: 200,
              },
            ]}
            autoPlay
            loop
            source={ride.driverArrived ? ReadyAmimation : avatarAnimation}
          />

          {/* {ride.driverArrived && (
            <View>
              <Text variant="titleMedium" style={{ fontWeight: "bold" }}>
                Destination: {ride.request.dropOff?.text}
              </Text>
            </View>
          )} */}

          <View style={{ marginTop: 20, flexDirection: "row" }}>
            <Text
              style={{
                fontWeight: "bold",
                marginRight: 20,
              }}
            >
              <Icon size={30} name="phone-forwarded" />
            </Text>
            <Text
              style={{
                fontSize: 25,
                fontWeight: "bold",
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
                text={
                  <View
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon size={40} name="clear" color={"#fff"} />
                    <Text style={{ color: "#fff" }}>
                      {t2("ride.cancelRide")}
                    </Text>
                  </View>
                }
                onPress={() => setVisible(true)}
              />
              <View style={{ marginRight: 50 }} />
              <RoundButton
                size={0.35}
                shadow={{ size: 0.3 }}
                color="grey"
                text={
                  <View
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <MaterialCommunityIcons
                      size={40}
                      name="google-maps"
                      color={"#fff"}
                    />
                    <Text style={{ color: "#fff" }}>{t2("ride.openMap")}</Text>
                  </View>
                }
                onPress={() => ride.actions.openMap("pickUp")}
              />
            </View>
          )}

          <View style={{ marginTop: 30 }}>
            {ride.driverArrived && (
              <RoundButton
                size={0.35}
                shadow={{ size: 0.3 }}
                color="grey"
                text={
                  <View
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <MaterialCommunityIcons
                      size={40}
                      name="google-maps"
                      color={"#fff"}
                    />
                    <Text style={{ color: "#fff" }}>{t2("ride.openMap")}</Text>
                  </View>
                }
                onPress={() => ride.actions.openMap("dropOff")}
              />
            )}
          </View>
          <View style={{ marginTop: 10, flexDirection: "row" }}>
            <RoundButton
              size={0.35}
              shadow={{ size: 0.3 }}
              color="primary"
              text={
                <View
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={40} name="phone" color={"#fff"} />
                  <Text style={{ color: "#fff" }}>{t2("ride.callDriver")}</Text>
                </View>
              }
              onPress={ride.actions.callDriver}
            />
            <View style={{ marginRight: 50 }} />

            {!ride.driverArrived ? (
              <RoundButton
                size={0.35}
                shadow={{ size: 0.3 }}
                color="success"
                text={
                  <View
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <MaterialCommunityIcons
                      size={40}
                      name="map-marker-check"
                      color={"#fff"}
                    />
                    <Text style={{ color: "#fff" }}>{t2("ride.arrived")}</Text>
                  </View>
                }
                onPress={ride.actions.onDriverArrived}
              />
            ) : (
              <>
                <RoundButton
                  size={0.35}
                  shadow={{ size: 0.3 }}
                  color="success"
                  text={
                    <View
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <MaterialCommunityIcons
                        size={40}
                        name="location-exit"
                        color={"#fff"}
                      />
                      <Text style={{ color: "#fff" }}>
                        {t2("ride.endRide")}
                      </Text>
                    </View>
                  }
                  onPress={() => setEndRidePopConfirmVisible(true)}
                />
              </>
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
      </ScrollView>
    </SafeAreaView>
  );
}
