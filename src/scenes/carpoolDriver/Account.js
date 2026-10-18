import React, { useMemo } from "react";
import { View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme, List, Divider, Avatar, Switch } from "react-native-paper";
import { Classes } from "_styles";
import { t2 } from "_utils/lang";
import { useApp, useTheme as useMamdooTheme } from "_hooks";
import { useCarpoolAuth, useCarpool } from "_hooks/carpoolDriver";
import { LoadingV2 } from "_atoms";

export default function CarpoolAccount({ navigation }) {
  const { colors } = useTheme();
  const app = useApp();
  const carpoolAuth = useCarpoolAuth();
  const carpool = useCarpool();
  const theme = useMamdooTheme();

  const car = carpool.profile?.cars?.find((c) => c.active) || carpool.profile?.cars?.[0];
  const driver = carpoolAuth.carpoolDriver;

  const menu = useMemo(
    () => [
      {
        title: t2("carpoolDriver.myCarsTitle"),
        icon: "car",
        onPress: () => navigation.navigate("CarpoolMyCars"),
      },
      {
        title: t2("carpoolDriver.documentsTitle"),
        icon: "file-document-outline",
        onPress: () => navigation.navigate("Documents", { carId: car?._id }),
      },
      ...(!driver?.cab
        ? [
            {
              title: t2("carpoolDriver.addRideVehicle"),
              icon: "steering",
              onPress: () => navigation.navigate("AddRideVehicle"),
            },
          ]
        : []),
      {
        title: t2("carpoolDriver.howItWorks"),
        icon: "help-circle-outline",
        onPress: () => navigation.navigate("CarpoolOnboarding"),
      },
      {
        title: t2("emergencyContacts.title"),
        icon: "shield-account-outline",
        onPress: () => navigation.navigate("EmergencyContacts"),
      },
      {
        title: t2("account.changeApp"),
        icon: "compare-horizontal",
        onPress: () => app.actions.removeApp(),
      },
      {
        title: t2("account.logout"),
        icon: "exit-to-app",
        onPress: async () => {
          await carpoolAuth.actions.logout();
          app.actions.removeApp();
        },
      },
    ],
    [car, driver?.cab]
  );

  return carpoolAuth.isLoading ? (
    <LoadingV2 />
  ) : (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}>
    <ScrollView style={Classes.container2(colors)}>
      <View>
        <List.Item
          left={(props) => (
            <View style={{ paddingLeft: 10 }}>
              <Avatar.Text
                size={60}
                label={`${(driver?.firstName || "?").charAt(0).toUpperCase()}${(driver?.lastName || "").charAt(0).toUpperCase()}`}
              />
            </View>
          )}
          title={`${driver?.firstName || ""} ${driver?.lastName || ""}`}
          description={t2("carpoolDriver.covoiturageDriver")}
          style={Classes.accountMenuItem(colors)}
          titleStyle={{ fontWeight: "bold", fontSize: 20 }}
        />
        <Divider />
      </View>

      <View>
        {menu.map(({ title, icon, onPress }, i) => (
          <View key={i}>
            <List.Item
              title={title}
              left={(props) => <List.Icon {...props} icon={icon} color={colors.primary} />}
              onPress={onPress}
              style={Classes.menuItem(colors)}
              right={(props) => <List.Icon {...props} icon={"chevron-right"} />}
            />
            <Divider />
          </View>
        ))}
      </View>

      <View>
        <List.Item
          title={t2("main.darkMode")}
          description={t2("main.enableDarkMode")}
          right={(props) => (
            <Switch
              color={colors.primary}
              value={theme.isDarkMode}
              onValueChange={() => theme.actions.setDarkMode(!theme.isDarkMode)}
            />
          )}
          style={Classes.accountMenuItem(colors)}
          titleStyle={{ fontWeight: "bold", fontSize: 20 }}
        />
        <Divider />
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}
