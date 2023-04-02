import React, { useEffect, useRef } from "react";
import {
  View,
  SafeAreaView,
  ScrollView,
  Platform,
  Linking,
  Image,
} from "react-native";
import { useTheme, Text } from "react-native-paper";
import { Classes } from "_styles";
import { Button } from "_atoms";
import { t2 } from "_utils/lang";
import * as Mixins from "../../styles/mixins";

export default function ForceUpdate({}) {
  const animation = useRef();

  const { colors } = useTheme();

  const openStore = () => {
    const url = Platform.select({
      ios: "https://apps.apple.com/us/app/mamdoo/id1608293063",
      android: "https://play.google.com/store/apps/details?id=com.mamdoo.app",
      //   android: 'market://details?id=com.mamdoo.app'
    });

    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        console.log("Unable to open URL: " + url);
      }
    });
  };

  useEffect(() => {
    if (animation.current) animation.current.play();
  }, []);

  return (
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
        <View>
          <Image
            source={require("_assets/update-app.png")}
            style={{
              width: Mixins.width(0.9, true),
              height: Mixins.height(0.5, true),
            }}
          />
        </View>

        <View
          style={{
            alignItems: "center",
            padding: 5,
          }}
        >
          <Text variant="titleLarge" style={{ textAlign: "center" }}>
            {t2("main.appUpdateDescription")}
          </Text>
        </View>

        <View style={{ marginTop: 50 }}>
          <Button
            style={Classes.authorizeButton(colors)}
            mode="contained"
            onPress={openStore}
          >
            <Text variant="titleLarge" style={{ color: "#fff" }}>
              {t2("main.appUpdateButton")}
            </Text>
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
