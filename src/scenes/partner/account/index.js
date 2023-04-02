import React, { useMemo } from "react";
import { View, ScrollView } from "react-native";
import { useTheme, List, Divider, Avatar, Switch } from "react-native-paper";
import { Classes } from "_styles";
import { t2 } from "_utils/lang";
import { useApp, usePartner, useTheme as useMamdooTheme } from "_hooks";
import { LoadingV2 } from "_atoms";

export default function AccountScene({ navigation }) {
  const { colors } = useTheme();
  const partner = usePartner();
  const app = useApp();
  const theme = useMamdooTheme();

  const menu = useMemo(
    () => [
      {
        title: t2("account.ridesHistory"),
        icon: "format-list-text",
        onPress: () => {
          navigation.navigate("RidesHistory");
        },
      },
      {
        title: t2("account.changeApp"),
        icon: "compare-horizontal",
        onPress: () => {
          app.actions.removeApp();
        },
      },
      {
        title: t2("account.logout"),
        icon: "exit-to-app",
        onPress: () => {
          partner.actions.logout();
        },
      },
    ],
    []
  );

  return partner.isLoading ? (
    <LoadingV2 />
  ) : (
    <ScrollView style={Classes.container2(colors)}>
      <View>
        <List.Item
          left={(props) => (
            <View style={{ paddingLeft: 10 }}>
              <Avatar.Text
                size={60}
                label={`${partner.partner.firstName
                  .charAt(0)
                  .toUpperCase()}${partner.partner.lastName
                  .charAt(0)
                  .toUpperCase()}`}
              />
            </View>
          )}
          title={`${partner.partner.firstName} ${partner.partner.lastName}`}
          description={t2("account.viewProfile")}
          onPress={() => navigation.navigate("Profile")}
          right={(props) => <List.Icon {...props} icon={"chevron-right"} />}
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
              left={(props) => (
                <List.Icon {...props} icon={icon} color={colors.primary} />
              )}
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
  );
}
