import React, { useEffect } from "react";
import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import HomeStack from "./stacks/Home";
import AccountStack from "./stacks/Account";
import AuthStack from "./stacks/Auth";
import { useTheme } from "@react-navigation/native";
import { usePartner } from "_hooks";
import { Loading } from "_atoms";
const Tab = createMaterialBottomTabNavigator();

export default function MainTabs({ role }) {
    const { colors } = useTheme();
    const partner = usePartner();

    if (partner.isLoading) return <Loading visible={true} size="large" />;

    return partner.partner ? (
        <Tab.Navigator
            initialRouteName="Home"
            // shifting={true}
            sceneAnimationEnabled={false}
            activeColor={colors.primary}
            barStyle={{
                backgroundColor: colors.background,
                borderTopColor: colors.border,
                borderTopWidth: 1
            }}
        >
            <Tab.Screen
                name="Home"
                children={() => <HomeStack role={role} />}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons
                            name="home"
                            color={color}
                            size={25}
                        />
                    )
                }}
            />

            <Tab.Screen
                name="Account"
                children={({}) => <AccountStack />}
                options={({ navigation }) => ({
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons
                            name="account-settings"
                            color={color}
                            size={25}
                        />
                    )
                })}
            />
        </Tab.Navigator>
    ) : (
        <AuthStack />
    );
}
