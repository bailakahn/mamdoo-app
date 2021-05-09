import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { AccountScene, ProfileScene, RidesHistoryScene } from "_scenes/partner";
import { t2 } from "_utils/lang";

const Stack = createStackNavigator();

export default function AccountStack({ role }) {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="Account"
                component={AccountScene}
                options={({ navigation }) => ({
                    headerStyle: {
                        borderBottomWidth: 1
                    },
                    headerTitleStyle: {
                        // color: "#000"
                    },
                    title: t2("screens.account")
                })}
            />

            <Stack.Screen
                name="Profile"
                component={ProfileScene}
                options={({ navigation }) => ({
                    headerStyle: {
                        borderBottomWidth: 1
                    },
                    headerTitleStyle: {
                        // color: "#000"
                    },
                    title: t2("screens.profile")
                })}
            />

            <Stack.Screen
                name="RidesHistory"
                component={RidesHistoryScene}
                options={({ navigation }) => ({
                    headerStyle: {
                        borderBottomWidth: 1
                    },
                    headerTitleStyle: {
                        // color: "#000"
                    },
                    title: t2("screens.ridesHistory")
                })}
            />
        </Stack.Navigator>
    );
}
