import React, { useEffect } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { usePartner } from "_hooks";

const Stack = createStackNavigator();

import {
    NotActiveScene,
    UploadScene,
    UploadInstructionsScene,
    ProfilePictureScene
} from "_scenes/partner";

export default function HomeStack({ role }) {
    const partner = usePartner();

    useEffect(() => {
        partner.actions.refresh();
    }, []);

    return (
        <Stack.Navigator
            initialRouteName="NotActive"
            screenOptions={{ headerShown: false, gestureEnabled: false }}
        >
            <Stack.Screen
                name="NotActive"
                component={NotActiveScene}
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

            <Stack.Screen
                name="ProfilePicture"
                component={ProfilePictureScene}
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
