import React, { useEffect } from "react";
import * as Location from "expo-location";
import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import HomeStack from "./stacks/Home";
import AccountStack from "./stacks/Account";
import AuthStack from "./stacks/Auth";
import VerificationStack from "./stacks/Verification";
import { useTheme } from "@react-navigation/native";
import { usePartner } from "_hooks";
import { useLocation } from "_hooks/partner";
import { LoadingV2 } from "_atoms";
import { t2 } from "_utils/lang";
import LocationDenied from "_components/organisms/LocationDenied";
import { useStore } from "_store";
import { ENV_NAME } from "@env";

const Tab = createMaterialBottomTabNavigator();

export default function MainTabs({ role }) {
    const { colors } = useTheme();
    const partner = usePartner();
    const { grantStatus, isLoading, grantBackgroundStatus } = useLocation(
        partner.partner
    );
    const {
        ride: { onGoingRide }
    } = useStore();

    if (!partner.partnerLoaded || isLoading) return <LoadingV2 />;

    // if user don't give location permission then don't allow access to app
    // console.log({
    //     grantStatus,
    //     grantBackgroundStatus,
    //     ENV_NAME,
    //     cd: ENV_NAME !== "localhost" && grantBackgroundStatus !== "granted"
    // });
    if (
        grantStatus === Location.PermissionStatus.DENIED ||
        (ENV_NAME !== "localhost" &&
            grantBackgroundStatus === Location.PermissionStatus.DENIED)
    )
        return <LocationDenied />;

    return partner.partner?.accessToken ? (
        partner.partner?.verified ? (
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
                    listeners={{
                        tabPress: (e) => {
                            if (onGoingRide) e.preventDefault();
                        }
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
                    listeners={{
                        tabPress: (e) => {
                            if (onGoingRide) e.preventDefault();
                        }
                    }}
                />
            </Tab.Navigator>
        ) : (
            <VerificationStack />
        )
    ) : (
        <AuthStack />
    );
}
