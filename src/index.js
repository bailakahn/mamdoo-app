import React from "react";
import { SafeAreaView, View, ScrollView } from "react-native";
import { useTheme, Text } from "react-native-paper";
import _ from "lodash";
import { Classes } from "_styles";
import { t } from "_utils/lang";
import { useApp } from "_hooks";
import { Button, Image } from "_atoms";

const Main = () => {
  const { colors } = useTheme();
  const app = useApp();

  return (
    <SafeAreaView style={Classes.container(colors)}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View style={{ marginTop: -50 }}>
          <Image
            source={require("_assets/logo.png")}
            cacheKey={"logo"}
            style={Classes.formLogo(colors)}
          />
        </View>
        <View style={{ ...Classes.mamdooUse(colors), alignItems: "center" }}>
          <Text
            style={{
              fontSize: 30,
              fontWeight: "bold",
            }}
          >
            {t("main.iam") + ":"}
          </Text>
        </View>
        <View
          style={{
            alignItems: "flex-start",
            marginBottom: 10,
          }}
        >
          <Button
            mode="outlined"
            onPress={() => app.actions.setApp("client")}
            {...Classes.splashButton(colors)}
          >
            <Text
              style={{
                fontSize: 20,
                textAlign: "center",
                fontWeight: "bold",
                paddingRight: 50,
                color: colors.primary,
              }}
            >
              {t("main.iAmAClient")}
            </Text>
          </Button>
        </View>
        <View
          style={{
            alignItems: "flex-start",
            marginBottom: 10,
          }}
        >
          <Button
            mode="contained"
            onPress={() => app.actions.setApp("partner")}
            {...Classes.splashButton(colors)}
          >
            <Text
              style={{
                fontSize: 20,
                textAlign: "center",
                fontWeight: "bold",
                paddingRight: 50,
                color: colors.text,
              }}
            >
              {t("main.iAmAPartner")}
            </Text>
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Main;
