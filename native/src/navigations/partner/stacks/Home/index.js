import React, { useEffect } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { usePartner } from "_hooks";

const Stack = createStackNavigator();

import {
    HomeScene,
    Ride,
    NotActiveScene,
    UploadScene,
    UploadInstructionsScene
} from "_scenes/partner";

export default function HomeStack({ role }) {
    const partner = usePartner();

    useEffect(() => {
        partner.actions.refresh();
    }, []);

    return (
        <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{ headerShown: false, gestureEnabled: false }}
        >
            <Stack.Screen
                name="Home"
                component={
                    partner?.partner?.active ? HomeScene : NotActiveScene
                }
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
                name="DriverOnTheWay"
                component={Ride}
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
                name="UploadInstructions"
                component={UploadInstructionsScene}
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
                name="Upload"
                component={UploadScene}
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
