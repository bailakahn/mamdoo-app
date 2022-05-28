import React, { useEffect } from "react";
import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import HomeStack from "./stacks/Home";
import AccountStack from "./stacks/Account";
import AuthStack from "./stacks/Auth";
import { useTheme } from "@react-navigation/native";
import { usePartner } from "_hooks";
import { useLocation } from "_hooks/partner";
import { Loading } from "_atoms";
import { t2 } from "_utils/lang";
import LocationDenied from "_components/organisms/LocationDenied";
import { ENV_NAME } from "@env";

const Tab = createMaterialBottomTabNavigator();

export default function MainTabs({ role }) {
    const { colors } = useTheme();
    const partner = usePartner();
    const { grantStatus, isLoading, grantBackgroundStatus } = useLocation(
        partner.partner
    );

    if (!partner.partnerLoaded || isLoading)
        return <Loading visible={true} size="large" />;

    // if user don't give location permission then don't allow access to app
    if (
        grantStatus !== "granted" ||
        (ENV_NAME !== "localhost" && grantBackgroundStatus !== "granted")
    )
        return <LocationDenied />;

    return partner.partner ? (
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
                    ),
                    title: t2("screens.home")
                }}
            />

            <Tab.Screen
                name="Account"
                children={({}) => <AccountStack />}
                options={({ navigation }) => ({
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons
                            name="account-settings"
                            color={color}
                            size={25}
                        />
                    ),
                    title: t2("screens.account")
                })}
            />
        </Tab.Navigator>
    ) : (
        <AuthStack />
    );
}
