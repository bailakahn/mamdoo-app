import React, { useEffect } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { usePartner } from "_hooks";
import { useTheme } from "react-native-paper";
import { t2 } from "_utils/lang";

const Stack = createStackNavigator();

import {
    NotActiveScene,
    UploadScene,
    UploadInstructionsScene,
    ProfilePictureScene,
    DriverLicenseScene,
    CabLicenseScene
} from "_scenes/partner";

export default function HomeStack({ role }) {
    const partner = usePartner();
    const { colors } = useTheme();

    useEffect(() => {
        partner.actions.refresh();
    }, []);

    return (
        <Stack.Navigator
            initialRouteName="NotActive"
            screenOptions={{ gestureEnabled: false }}
        >
            <Stack.Screen
                name="NotActive"
                component={NotActiveScene}
                options={({ navigation }) => ({
                    headerStyle: {
                        borderBottomWidth: 1,
                        backgroundColor: colors.background
                    },
                    headerTitleStyle: {
                        // color: "#000"
                    },
                    headerShown: false,
                    title: ""
                })}
            />

            <Stack.Screen
                name="UploadInstructions"
                component={UploadInstructionsScene}
                options={({ navigation }) => ({
                    headerStyle: {
                        borderBottomWidth: 1,
                        backgroundColor: colors.background
                    },
                    headerTitleStyle: {
                        // color: "#000"
                    },
                    title: "",
                    headerBackTitle: t2("main.back")
                })}
            />

            <Stack.Screen
                name="Upload"
                component={UploadScene}
                options={({ navigation }) => ({
                    headerStyle: {
                        borderBottomWidth: 1,
                        backgroundColor: colors.background
                    },
                    headerTitleStyle: {
                        // color: "#000"
                    },
                    title: "",
                    headerBackTitle: t2("main.back")
                })}
            />

            <Stack.Screen
                name="ProfilePicture"
                component={ProfilePictureScene}
                options={({ navigation }) => ({
                    headerStyle: {
                        borderBottomWidth: 1,
                        backgroundColor: colors.background
                    },
                    headerTitleStyle: {
                        // color: "#000"
                    },
                    title: "",
                    headerBackTitle: t2("main.back")
                })}
            />

            <Stack.Screen
                name="DriverLicense"
                component={DriverLicenseScene}
                options={({ navigation }) => ({
                    headerStyle: {
                        borderBottomWidth: 1,
                        backgroundColor: colors.background
                    },
                    headerTitleStyle: {
                        // color: "#000"
                    },
                    title: "",
                    headerBackTitle: t2("main.back")
                })}
            />

            <Stack.Screen
                name="CabLicense"
                component={CabLicenseScene}
                options={({ navigation }) => ({
                    headerStyle: {
                        borderBottomWidth: 1,
                        backgroundColor: colors.background
                    },
                    headerTitleStyle: {
                        // color: "#000"
                    },
                    title: "",
                    headerBackTitle: t2("main.back")
                })}
            />
        </Stack.Navigator>
    );
}
