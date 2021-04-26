import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

const Stack = createStackNavigator();

import { AccountScene } from "_scenes/client";

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
                    }
                })}
            />
        </Stack.Navigator>
    );
}
