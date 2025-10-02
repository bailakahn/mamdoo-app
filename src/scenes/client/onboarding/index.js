import React, { useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, useTheme, Button } from "react-native-paper";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEvent } from "expo";
import { Image } from "_atoms";
import { useApp } from "_hooks";
import * as Mixins from "../../../styles/mixins";
import { Classes } from "_styles";
import { t } from "_utils/lang";

const videoSource =
  "https://dwfhhymkzgxdd.cloudfront.net/videos/demos/demo.mp4";

export default function Onboarding() {
  const { colors } = useTheme();
  const [step, setStep] = useState(1);
  const app = useApp();

  const PriceView = () => (
    <View
      style={{
        flexGrow: 1,
        justifyContent: "center",
      }}
    >
      <View style={{ alignItems: "center" }}>
        <Image
          source={require("_assets/price-fr.png")}
          cacheKey={"price-fr"}
          resizeMode="contain"
          style={{
            width: Mixins.width(0.7, true),
            height: Mixins.height(0.5, true),
          }}
        />
      </View>
      <View style={{ marginTop: 50, alignItems: "center" }}>
        <View style={{}}>
          <Text
            variant="headlineLarge"
            style={{
              color: colors.primary,
              fontWeight: "bold",
            }}
          >
            {t("main.onboardingPriceTitle")}
          </Text>
        </View>
        <View style={{ marginTop: 20 }}>
          <Text variant="titleLarge" style={{ textAlign: "left" }}>
            {t("main.onboardingPriceDescription")}
          </Text>
        </View>
      </View>
    </View>
  );

  const MapView = () => (
    <View
      style={{
        flexGrow: 1,
        justifyContent: "center",
      }}
    >
      <View style={{ alignItems: "center" }}>
        <Image
          source={require("_assets/map-3.png")}
          cacheKey={"map-3"}
          resizeMode="contain"
          style={{
            width: Mixins.width(0.8, true),
            height: Mixins.height(0.5, true),
          }}
        />
      </View>
      <View style={{ marginTop: 30, alignItems: "center" }}>
        <View>
          <Text
            variant="headlineLarge"
            style={{
              color: colors.primary,
              fontWeight: "bold",
            }}
          >
            {t("main.onboardingMapTitle")}
          </Text>
        </View>
        <View style={{ marginTop: 20 }}>
          <Text variant="titleLarge" style={{ textAlign: "left" }}>
            {t("main.onboardingMapDescription")}
          </Text>
        </View>
      </View>
    </View>
  );

  const DestinationView = () => (
    <View
      style={{
        flexGrow: 1,
        justifyContent: "center",
      }}
    >
      <View style={{ alignItems: "center" }}>
        <Image
          source={require("_assets/onboarding.png")}
          cacheKey={"onboarding"}
          resizeMode="contain"
          style={{
            width: Mixins.width(0.8, true),
            height: Mixins.height(0.5, true),
          }}
        />
      </View>
      <View
        style={{
          marginTop: 50,
          alignItems: "center",
        }}
      >
        <View>
          <Text
            variant="headlineLarge"
            style={{
              color: colors.primary,
              fontWeight: "bold",
            }}
          >
            {t("main.onboardingDestinationTitle")}
          </Text>
        </View>
        <View style={{ marginTop: 20 }}>
          <Text variant="titleLarge" style={{ textAlign: "left" }}>
            {t("main.onboardingDestinationDescription")}
          </Text>
        </View>
      </View>
    </View>
  );

  const VideoDemo = () => {
    const player = useVideoPlayer(videoSource, (player) => {
      player.loop = true;
      player.play();
    });

    const { isPlaying } = useEvent(player, "playingChange", {
      isPlaying: player.playing,
    });

    return (
      <View
        style={{
          flexGrow: 1,
          justifyContent: "center",
        }}
      >
        <View style={styles.contentContainer}>
          <VideoView
            style={{
              width: Mixins.width(0.5, true),
              height: Mixins.height(0.5, true),
            }}
            player={player}
            allowsPictureInPicture
          />
          <View style={styles.controlsContainer}>
            <Button
              title={isPlaying ? "Pause" : "Play"}
              onPress={() => {
                if (isPlaying) {
                  player.pause();
                } else {
                  player.play();
                }
              }}
            />
          </View>
        </View>
        <View style={{ marginTop: 20, alignItems: "center" }}>
          <View>
            <Text
              variant="titleLarge"
              style={{
                color: colors.primary,
                fontWeight: "bold",
              }}
            >
              {t("main.onboardingVideoTitle")}
            </Text>
          </View>
        </View>
      </View>
    );
  };

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
          width: Mixins.width(0.9, true),
          padding: 5,
        }}
      >
        {step === 1 ? (
          <PriceView />
        ) : step === 2 ? (
          <DestinationView />
        ) : (
          <VideoDemo />
        )}

        <View style={Classes.bottonView(colors)}>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <View>
              <Button
                onPress={() => {
                  app.actions.setAppLaunched(true);
                }}
              >
                <Text variant="titleMedium">{`${t("main.skip")}`}</Text>
              </Button>
            </View>
            <View>
              <Button
                mode="contained"
                onPress={() => {
                  if (step === 3) {
                    app.actions.setAppLaunched(true);
                    return;
                  }
                  setStep(step + 1);
                }}
                // {...Classes.nextOnboardingButtonContainer(colors)}
              >
                {step === 3 ? t("main.done") : t("main.next")}
              </Button>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 50,
  },
  controlsContainer: {
    padding: 10,
  },
});
