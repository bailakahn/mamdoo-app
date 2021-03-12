import React from "react";
import { SafeAreaView, View } from "react-native";
import { PricingCard } from "react-native-elements";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import { useTheme, Text, TouchableRipple, Switch } from "react-native-paper";
import { useStore } from "_store";
import { Classes } from "_styles";
import { t } from "_utils/lang";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { PreferencesContext } from "./context/preferencesContext";

const Drawer = createDrawerNavigator();

function DrawerContent() {
  const { colors } = useTheme();
  const { themeName, toggleTheme } = React.useContext(PreferencesContext);

  return (
    <DrawerContentScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <View
        style={Classes.container(colors) && { justifyContent: "space-between" }}
      >
        <TouchableRipple onPress={toggleTheme}>
          <View style={Classes.drawerPreference(colors)}>
            <Text style={{ color: colors.text }}> {t("main.darkTheme")}</Text>
            <View pointerEvents="none">
              <Switch color={"#3adb76"} value={themeName === "dark"} />
            </View>
          </View>
        </TouchableRipple>
      </View>
    </DrawerContentScrollView>
  );
}

function MainScreen() {
  const { colors } = useTheme();

  const {
    actions: { setApp },
  } = useStore();

  return (
    <SafeAreaView style={Classes.container(colors)}>
      <PricingCard
        color={colors.primary}
        title={t("main.iAmAClient")}
        info={[t("main.bookABike")]}
        button={{ title: t("main.start") }}
        onButtonPress={() => setApp("client")}
        containerStyle={{
          backgroundColor: colors.background,
          borderColor: colors.border,
        }}
        infoStyle={{
          color: colors.text,
        }}
      />
      <PricingCard
        color={colors.accent}
        title={t("main.iAmAPartner")}
        info={[t("main.iWantMoreClients")]}
        button={{ title: t("main.start") }}
        onButtonPress={() => setApp("driver")}
        containerStyle={{
          backgroundColor: colors.background,
          borderColor: colors.border,
        }}
        infoStyle={{
          color: colors.text,
        }}
      />
    </SafeAreaView>
  );
}

const MainNavigator = () => {
  return (
    <Drawer.Navigator drawerContent={() => <DrawerContent />}>
      <Drawer.Screen name="Main" component={MainScreen} />
    </Drawer.Navigator>
  );
};

export default MainNavigator;
