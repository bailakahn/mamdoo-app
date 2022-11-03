import React, { useEffect } from "react";
import { View } from "react-native";
import { Headline, useTheme, Portal, Text, Modal } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialIcons";
import { Classes } from "_styles";
import { t2 } from "_utils/lang";
import {
    usePartner,
    usePartnerProxy,
    useNotifications,
    useLanguage,
    useApp
} from "_hooks";
import { useRide, useLocation } from "_hooks/partner";
import { RoundButton, Button } from "_atoms";
import { Info } from "_molecules";

export default function AccountScene({}) {
    const { colors } = useTheme();
    usePartnerProxy();
    useNotifications();
    useLanguage();
    const ride = useRide();
    const partner = usePartner();
    useLocation();
    const app = useApp();

    useEffect(() => {
        ride.actions.resetRide();
    }, []);

    useEffect(() => {
        if (partner) partner.actions.updateLocation();
    }, []);

    return (
        <>
            <Portal>
                <Modal
                    visible={ride.requestId}
                    contentContainerStyle={Classes.modalContent(colors)}
                    style={Classes.modalWrapper(colors)}
                >
                    <View>
                        <Headline style={Classes.text(colors)}>
                            {t2("ride.newRide")}
                        </Headline>
                        <Text>{t2("ride.newRideDescription")}</Text>

                        <View
                            style={{
                                justifyContent: "center",
                                alignItems: "center",
                                marginTop: 30,
                                flexDirection: "row"
                            }}
                        >
                            <View style={{ marginRight: 20 }}>
                                <RoundButton
                                    size={0.35}
                                    color="error"
                                    text={t2("ride.denyRide")}
                                    onPress={ride.actions.denyRequest}
                                    shadow={{ size: 0.3 }}
                                />
                            </View>

                            <View style={{ marginLeft: 20 }}>
                                <RoundButton
                                    size={0.35}
                                    color="primary"
                                    text={t2("ride.acceptRide")}
                                    onPress={ride.actions.acceptRequest}
                                    shadow={{ size: 0.3 }}
                                />
                            </View>
                        </View>
                    </View>
                </Modal>

                {ride.error && (
                    <Info
                        visible={ride.error}
                        text={t2(ride.error)}
                        onDismiss={() => ride.actions.setError(false)}
                        onClose={() => ride.actions.setError(false)}
                    />
                )}

                {ride.canceled && (
                    <Info
                        visible={ride.canceled}
                        text={t2(`ride.rideCanceled`)}
                        onDismiss={() => ride.actions.setRideCanceled(false)}
                        onClose={() => ride.actions.setRideCanceled(false)}
                    />
                )}
            </Portal>
            <View style={Classes.container(colors)}>
                <View>
                    <Headline style={Classes.text(colors)}>
                        {t2("home.welcome")}
                    </Headline>
                </View>

                <View
                    style={Classes.driverWelcomeNoticeView(
                        colors,
                        partner.partner.isOnline
                    )}
                >
                    <Text style={{ fontSize: 20, fontWeight: "bold" }}>
                        {partner.partner.isOnline
                            ? t2("home.onlineWelcomeText")
                            : t2("home.offlineWelcomeText")}
                    </Text>
                </View>
            </View>
            {partner.partner?.isBlocked && (
                <View
                    style={{
                        ...Classes.notice(colors, "error"),
                        justifyContent: "center",
                        alignItems: "center",
                        alignSelf: "center"
                    }}
                >
                    <View>
                        <Text style={{ fontSize: 20, fontWeight: "bold" }}>
                            {t2("home.accountBlocked")}
                        </Text>
                    </View>
                    <View style={{ marginTop: 30 }}>
                        <Button
                            {...Classes.callButtonContainer(colors)}
                            mode="contained"
                            onPress={app.actions.call}
                        >
                            {`${t2("main.callUs")}`}
                        </Button>
                    </View>
                </View>
            )}
            <View style={[Classes.bottonView(colors)]}>
                <RoundButton
                    disabled={partner.partner?.isBlocked}
                    size={0.35}
                    color={!partner.partner.isOnline ? "primary" : "error"}
                    text={
                        !partner.partner.isOnline
                            ? t2("home.go")
                            : t2("home.stop")
                    }
                    onPress={partner.actions.changeStatus}
                    shadow={{ size: 0.3 }}
                />
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
                <Text style={{ fontSize: 20, marginLeft: 10 }}>
                    {!partner.partner.isOnline
                        ? t2("home.goNotice")
                        : t2("home.stopNotice")}
                </Text>
            </View>
        </>
    );
}
