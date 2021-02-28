import React from "react";
import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import HomeStack from "./stacks/Home";
import { useTheme } from "@react-navigation/native";

const Tab = createMaterialBottomTabNavigator();

export default function MainTabs({ role }) {
    const { colors } = useTheme();
    return (
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
        </Tab.Navigator>
    );
}
