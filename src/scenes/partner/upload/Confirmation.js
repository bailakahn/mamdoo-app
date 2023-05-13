import React, { useRef, useEffect } from "react";
import { View, ScrollView, SafeAreaView } from "react-native";
import { useTheme, Text } from "react-native-paper";
import LottieView from "lottie-react-native";
import { Classes } from "_styles";
import { t2 } from "_utils/lang";
import { Button } from "_atoms";
import { usePartner, useTheme as useMamdooTheme } from "_hooks";
import ReadyAmimation from "_assets/animation/ready.json";
import * as Mixins from "../../../styles/mixins";

export default function Confirmation() {
  const { colors } = useTheme();
  const theme = useMamdooTheme();
  const partner = usePartner();

  const animation = useRef();

  useEffect(() => {
    if (animation.current) animation.current.play();
  }, []);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colors.background,
        alignItems: "center",
      }}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          alignItems: "center",
        }}
      >
        <View
          style={{
            flexGrow: 1,
            justifyContent: "center",
            alignItems: "center",
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
        <View style={Classes.bottonView(colors)}>
          <Button
            {...Classes.buttonContainer(colors)}
            mode="contained"
            onPress={() =>
              partner.actions.setPartner({
                ...partner.partner,
                active: true,
              })
            }
          >
            {t2("upload.continue")}
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
