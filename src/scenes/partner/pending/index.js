import React from "react";
import { View, SafeAreaView, ScrollView } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { Image, Button } from "_atoms";
import { useApp, usePartner } from "_hooks";
import * as Mixins from "../../../styles/mixins";
import { Classes } from "_styles";
import { t2 } from "_utils/lang";

export default function Onboarding() {
  const { colors } = useTheme();
  const app = useApp();
  const partner = usePartner();

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
        <View
          style={{
            flexGrow: 1,
            justifyContent: "center",
          }}
        >
          <View style={{ alignItems: "center" }}>
            <Image
              source={require("_assets/pending.png")}
              cacheKey={"pending"}
              resizeMode="contain"
              style={{
                width: Mixins.width(0.7, true),
                height: Mixins.height(0.5, true),
              }}
            />
          </View>
          <View style={{ alignItems: "center" }}>
            <View style={{}}>
              <Text
                variant="headlineLarge"
                style={{
                  color: colors.primary,
                  fontWeight: "bold",
                }}
              >
                {t2("pending.title")}
              </Text>
            </View>
            <View style={{ marginTop: 20 }}>
              <Text variant="titleLarge" style={{ textAlign: "left" }}>
                {t2("pending.description")}
              </Text>
            </View>
            <View style={{ marginTop: 10 }}>
              <Button
                // mode="contained"
                onPress={() => {
                  app.actions.call();
                }}
              >
                <Text style={{ color: colors.primary }} variant="titleLarge">
                  {t2("pending.contactUs")}
                </Text>
              </Button>
            </View>
          </View>
        </View>
        <View style={Classes.bottonView(colors)}>
          <View style={{ alignItems: "center" }}>
            <Button
              {...Classes.logoutPendingButtonContainer(colors)}
              mode="contained"
              onPress={() => {
                partner.actions.logout();
              }}
            >
              {t2("upload.logout")}
            </Button>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
