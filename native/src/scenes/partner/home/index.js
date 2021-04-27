import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Button, Headline, useTheme } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialIcons";
import { Classes } from "_styles";
import { t } from "_utils/lang";
import { usePartner } from "_hooks";

export default function AccountScene({}) {
    const { colors } = useTheme();

    const partner = usePartner();

    return (
        <>
            <View style={Classes.container(colors)}>
                <View>
                    <Headline style={Classes.text(colors)}>
                        {t("home.welcome")}
                    </Headline>
                </View>

                <View
                    style={Classes.driverWelcomeNoticeView(
                        colors,
                        partner.partner.isOnline
                    )}
                >
                    <Text
                        style={[
                            Classes.text(colors),
                            { fontSize: 20, fontWeight: "bold" }
                        ]}
                    >
                        {partner.partner.isOnline
                            ? t("home.onlineWelcomeText")
                            : t("home.offlineWelcomeText")}
                    </Text>
                </View>
            </View>
            <View style={[Classes.bottonView(colors)]}>
                <TouchableOpacity
                    onPress={partner.actions.changeStatus}
                    style={
                        !partner.partner.isOnline
                            ? Classes.goButton(colors)
                            : Classes.stopButton(colors)
                    }
                >
                    <View style={Classes.shadowView(colors)}>
                        <Text
                            style={{
                                color: colors.background,
                                fontWeight: "bold",
                                fontSize: 15
                            }}
                        >
                            {!partner.partner.isOnline
                                ? t("home.go")
                                : t("home.stop")}
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>
            <View style={Classes.statusNoticeView(colors)}>
                <Icon
                    name="info-outline"
                    color={
                        !partner.partner.isOnline
                            ? colors.primary
                            : colors.accent
                    }
                    size={30}
                />
                <Text
                    style={[
                        Classes.text(colors),
                        { fontSize: 20, marginLeft: 10 }
                    ]}
                >
                    {!partner.partner.isOnline
                        ? t("home.goNotice")
                        : t("home.stopNotice")}
                </Text>
            </View>
        </>
    );
}
