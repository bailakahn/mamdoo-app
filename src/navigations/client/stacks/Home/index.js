import React, { useEffect } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { useUser } from "_hooks";

const Stack = createStackNavigator();

import { HomeScene, RideRequestScene, RideScene } from "_scenes/client";

export default function HomeStack({ role }) {
    const user = useUser();

    useEffect(() => {
        user.actions.refresh();
    }, []);

    return (
        <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{ headerShown: false, gestureEnabled: false }}
        >
            <Stack.Screen
                name="Home"
                component={HomeScene}
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
                name="RideRequest"
                component={RideRequestScene}
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
                name="Ride"
                component={RideScene}
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
