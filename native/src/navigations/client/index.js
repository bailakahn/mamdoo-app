import React, { useEffect } from "react";
import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import HomeStack from "./stacks/Home";
import AccountStack from "./stacks/Account";
import AuthtStack from "./stacks/Auth";
import { useTheme } from "@react-navigation/native";
import { useUser } from "_hooks";
import { Loading } from "_atoms";
const Tab = createMaterialBottomTabNavigator();
import { FormScene, LoginScene } from "_scenes/client";

export default function MainTabs({ role }) {
    const { colors } = useTheme();
    const user = useUser();

    if (!user.userLoaded) return <Loading visible={true} size="large" />;

    return user.user ? (
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
        <AuthtStack />
    );
}
