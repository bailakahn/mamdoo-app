import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

const Stack = createStackNavigator();

import { HomeScene } from "_scenes/partner";

export default function HomeStack({ role }) {
    return (
        <Stack.Navigator>
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
        </Stack.Navigator>
    );
}
