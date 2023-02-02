import React, { useRef, useEffect, useState } from "react";
import { View, ScrollView, SafeAreaView } from "react-native";
import { useTheme, Text } from "react-native-paper";
import LottieView from "lottie-react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { Classes } from "_styles";
import { t } from "_utils/lang";
import LightAvatar from "_assets/animation/light-avatar.json";
import LightAvatarGif from "_assets/animation/light-avatar.gif";
import DarkAvatarGif from "_assets/animation/dark-avatar.gif";
import DarkAvatar from "_assets/animation/dark-avatar.json";
import ReadyAmimation from "_assets/animation/ready.json";
import LightReadyAmimation from "_assets/animation/light-ready.gif";
import DarkReadyAmimation from "_assets/animation/dark-ready.gif";
import { useRide, useTheme as useMamdooTheme } from "_hooks";
import { RoundButton } from "_atoms";
import PopConfirm from "_organisms/PopConfirm";

export default function RideRequestScreen() {
  const { colors } = useTheme();
  const ride = useRide();
  const theme = useMamdooTheme();

  const avatarAnimation = theme.isDarkMode ? DarkAvatar : LightAvatar;
  const avatarAnimationGif = theme.isDarkMode ? DarkAvatarGif : LightAvatarGif;
  const readyAnimationGif = theme.isDarkMode
    ? DarkReadyAmimation
    : LightReadyAmimation;

  const animation = useRef();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (animation.current) animation.current.play();
  }, [ride.driverArrived]);

  if (!ride.driver) return null;

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colors.background,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <ScrollView>
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
                  {t("ride.cancelConfirmOk")}
                </Text>
              </View>
            }
            isRounded={true}
          />
          <Text style={{ fontSize: 30, fontWeight: "bold" }}>
            {`${ride.driver.firstName} ${ride.driver.lastName}`}
            {/* {t("ride.foundMamdoo")} */}
          </Text>

          {ride.driverArrived && (
            <Text
              style={{
                fontSize: 30,
                fontWeight: "bold",
              }}
            >
              {t("ride.driverArrived")}
            </Text>
          )}

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

          {!ride.driverArrived && (
            <View style={{ alignItems: "center" }}>
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "bold",
                }}
              >
                {t("ride.isOnHisWay")}
              </Text>
              {ride.distanceMatrix && (
                <View style={{ alignItems: "center" }}>
                  <Text
                    style={{
                      marginTop: 20,
                      marginBottom: 20,
                      fontSize: 20,
                      fontWeight: "bold",
                      color: colors.primary,
                    }}
                  >
                    {`${t("ride.arrivesIn")} ${
                      ride.distanceMatrix?.duration?.text || "10 mins"
                    }`}
                  </Text>
                </View>
              )}
            </View>
          )}

          <View>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
              }}
            >
              {t("ride.meetHimOutside")}
            </Text>
          </View>

          <View style={{ marginTop: 40, flexDirection: "row" }}>
            <Text
              style={{
                fontWeight: "bold",
                marginRight: 20,
              }}
            >
              <Icon size={40} name="phone-forwarded" />
            </Text>
            <Text
              style={{
                fontSize: 25,
                fontWeight: "bold",
              }}
            >
              {ride.driver.phoneNumber}
            </Text>
          </View>

          <View
            style={{ marginTop: 30, flexDirection: "row", marginBottom: 20 }}
          >
            {!ride.driverArrived && (
              <>
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
                        {t("ride.cancelRide")}
                      </Text>
                    </View>
                  }
                  onPress={() => setVisible(true)}
                />
                <View style={{ marginRight: 50 }} />
              </>
            )}

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
                  <Text style={{ color: "#fff" }}>{t("ride.callDriver")}</Text>
                </View>
              }
              onPress={ride.actions.callDriver}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
