import React from "react";
import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import Icon from "@expo/vector-icons/MaterialIcons";
import { useTheme } from "react-native-paper";
import { t2 } from "_utils/lang";
import HomeTabStack from "./HomeTabStack";
import TripsTabStack from "./TripsTabStack";
import EarningsTabStack from "./EarningsTabStack";
import AccountTabStack from "./AccountTabStack";

const Tab = createMaterialBottomTabNavigator();

// Four tabs, not the ride driver app's drawer — covoiturage does four things,
// not the dozen a ride driver's app does, so a drawer would be hiding a small
// feature set behind an extra tap rather than earning its keep.
export default function CarpoolHomeTabs() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      barStyle={{ backgroundColor: colors.surface }}
      activeColor={colors.primary}
      inactiveColor={colors.placeholder}
      shifting={false}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeTabStack}
        options={{
          tabBarLabel: t2("carpoolDriver.tabHome"),
          tabBarIcon: ({ color }) => <Icon name="home" size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name="TripsTab"
        component={TripsTabStack}
        options={{
          tabBarLabel: t2("carpoolDriver.tabTrips"),
          tabBarIcon: ({ color }) => <Icon name="calendar-today" size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name="EarningsTab"
        component={EarningsTabStack}
        options={{
          tabBarLabel: t2("carpoolDriver.tabEarnings"),
          tabBarIcon: ({ color }) => <Icon name="account-balance-wallet" size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name="AccountTab"
        component={AccountTabStack}
        options={{
          tabBarLabel: t2("carpoolDriver.tabAccount"),
          tabBarIcon: ({ color }) => <Icon name="person" size={24} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}
