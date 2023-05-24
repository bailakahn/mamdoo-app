import React, { useState, useRef } from "react";
import { View, SafeAreaView, ScrollView } from "react-native";
import { Text, useTheme, Button } from "react-native-paper";
import { Video, ResizeMode } from "expo-av";
import { Image } from "_atoms";
import { useApp } from "_hooks";
import * as Mixins from "../../../styles/mixins";
import { Classes } from "_styles";
import { t } from "_utils/lang";

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
          source={require("_assets/destination.jpg")}
          cacheKey={"destination-jpg"}
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
    const video = useRef(null);
    const [status, setStatus] = useState({});

    return (
      <View
        style={{
          flexGrow: 1,
          justifyContent: "center",
        }}
      >
        <View
          style={{
            flexGrow: 1,
            alignItems: "center",
            justifyContent: "flex-end",
          }}
        >
          <Video
            ref={video}
            style={{
              width: Mixins.width(0.5, true),
              height: Mixins.height(0.5, true),
            }}
            source={require("_assets/videos/demo.mp4")}
            // source={{
            //   uri: "https://www.youtube.com/watch?v=fQF6DBtTfsQ",
            // }}
            shouldPlay
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
            isLooping
            onPlaybackStatusUpdate={(status) => setStatus(() => status)}
          />
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

          {/* <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              marginTop: 20,
            }}
          >
            <Button
              icon={status.isPlaying ? "pause" : "play"}
              mode="contained"
              onPress={() =>
                status.isPlaying
                  ? video.current.pauseAsync()
                  : video.current.playAsync()
              }
            >
              {status.isPlaying ? "Pause" : "Jouer"}
            </Button>
          </View> */}
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
        ) : step === 3 ? (
          <MapView />
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
                  if (step === 4) {
                    app.actions.setAppLaunched(true);
                    return;
                  }
                  setStep(step + 1);
                }}
                // {...Classes.nextOnboardingButtonContainer(colors)}
              >
                {step === 4 ? t("main.done") : t("main.next")}
              </Button>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
