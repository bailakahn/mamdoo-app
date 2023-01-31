import React from "react";
import { SafeAreaView, View, Image } from "react-native";
import { useTheme, Text } from "react-native-paper";
import { Classes } from "_styles";
import { t } from "_utils/lang";
import { useApp } from "_hooks";
import { Button } from "_atoms";
import MaintenanceMode from "_organisms/MaintenanceMode";

const Main = () => {
  const { colors } = useTheme();
  const app = useApp();

  if (app?.settings?.maintenanceMode?.active)
    return <MaintenanceMode message={app.settings.maintenanceMode.message} />;

  return (
    <SafeAreaView style={Classes.container(colors)}>
      <View style={{ marginTop: -50 }}>
        <Image
          source={require("_assets/logo.png")}
          style={Classes.formLogo(colors)}
        />
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
          style={[
            Classes.splashButton(colors),
            {
              borderColor: colors.primary,
              height: 50,
            },
          ]}
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
          style={[
            Classes.splashButton(colors),
            {
              borderColor: colors.accent,
              height: 50,
            },
          ]}
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
    </SafeAreaView>
  );
};

export default Main;
