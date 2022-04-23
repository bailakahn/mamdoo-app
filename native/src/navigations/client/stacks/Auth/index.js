import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

const Stack = createStackNavigator();

import { FormScene, LoginScene, ForgotPasswordScene } from "_scenes/client";

export default function AuthStack({}) {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen
                name="Login"
                component={LoginScene}
                options={({ navigation }) => ({
                    headerStyle: {
                        borderBottomWidth: 1
                    },
                    headerTitleStyle: {
                        // color: "#000"
                    }
                })}
            />

            <Stack.Screen
                name="Register"
                component={FormScene}
                options={({ navigation }) => ({
                    headerStyle: {
                        borderBottomWidth: 1
                    },
                    headerTitleStyle: {
                        // color: "#000"
                    }
                })}
            />

            <Stack.Screen
                name="ForgotPassword"
                component={ForgotPasswordScene}
                options={({ navigation }) => ({
                    headerStyle: {
                        borderBottomWidth: 1
                    },
                    headerTitleStyle: {
                        // color: "#000"
                    }
                })}
            />
        </Stack.Navigator>
    );
}
