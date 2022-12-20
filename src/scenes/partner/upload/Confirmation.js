import React, { useRef, useEffect } from "react";
import { View, Platform, Image } from "react-native";
import {
  useTheme,
  Text,
  List,
  Divider,
  Dialog,
  Portal,
  Paragraph,
} from "react-native-paper";
import LottieView from "lottie-react-native";
import { Classes } from "_styles";
import { t2 } from "_utils/lang";
import { Button, LoadingV2 } from "_atoms";
import { usePartner, useTheme as useMamdooTheme } from "_hooks";
import ReadyAmimation from "_assets/animation/ready.json";
import LightReadyAmimation from "_assets/animation/light-ready.gif";
import DarkReadyAmimation from "_assets/animation/dark-ready.gif";
import * as Mixins from "../../../styles/mixins";

export default function Confirmation() {
  const { colors } = useTheme();
  const theme = useMamdooTheme();
  const partner = usePartner();

  const readyAnimationGif = theme.isDarkMode
    ? DarkReadyAmimation
    : LightReadyAmimation;

  const animation = useRef();

  useEffect(() => {
    if (animation.current) animation.current.play();
  }, []);

  return (
    <>
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          height: Mixins.height(0.9, true),
        }}
      >
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
          source={ReadyAmimation}
        />

        <View>
          <Text style={{ fontSize: 25, fontWeight: "bold" }}>
            {t2("upload.uploadConfirmation")}
          </Text>
        </View>
      </View>
      <View
        style={{
          justifyContent: "flex-end",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <Button
          {...Classes.callButtonContainer(colors)}
          mode="contained"
          onPress={() =>
            partner.actions.setPartner({
              ...partner.partner,
              active: true,
            })
          }
        >
          {`${t2("upload.continue")}`}
        </Button>
      </View>
    </>
  );
}
