import React, { useEffect } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { useUser } from "_hooks";

const Stack = createStackNavigator();

import { VerificationScene } from "_scenes/client";

export default function VerificationStack({}) {
    const user = useUser();
    useEffect(() => {
        user.actions.refresh();
    }, []);

    return (
        <Stack.Navigator
            initialRouteName="VerificationScene"
            screenOptions={{ headerShown: false }}
        >
            <Stack.Screen
                name="VerificationScene"
                component={VerificationScene}
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
