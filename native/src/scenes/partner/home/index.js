import React, { useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import {
    Button,
    Headline,
    useTheme,
    Portal,
    Dialog,
    Modal
} from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialIcons";
import { Classes } from "_styles";
import { t2 } from "_utils/lang";
import { usePartner, usePartnerProxy, useLocation } from "_hooks";
import { useRide } from "_hooks/partner";
import { RoundButton } from "_atoms";
import { Info } from "_molecules";

export default function AccountScene({}) {
    const { colors } = useTheme();
    usePartnerProxy();
    const ride = useRide();
    const partner = usePartner();
    const location = useLocation();

    useEffect(() => {
        ride.actions.resetRide();
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
                            Nouvelle demande de course
                        </Headline>
                        <Text style={Classes.text(colors)}>
                            Un utilisateur vient d'effectuer une demande de
                            course
                        </Text>

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
                                    size={0.25}
                                    color="accent"
                                    text="Refuser"
                                    onPress={ride.actions.resetRequest}
                                    shadow={{ size: 0.2 }}
                                />
                            </View>

                            <View style={{ marginLeft: 20 }}>
                                <RoundButton
                                    size={0.35}
                                    color="primary"
                                    text="Accepter"
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
                        onDismiss={() => ride.actions.setCancelRide(false)}
                        onClose={() => ride.actions.setCancelRide(false)}
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
                    <Text
                        style={[
                            Classes.text(colors),
                            { fontSize: 20, fontWeight: "bold" }
                        ]}
                    >
                        {partner.partner.isOnline
                            ? t2("home.onlineWelcomeText")
                            : t2("home.offlineWelcomeText")}
                    </Text>
                </View>
            </View>
            <View style={[Classes.bottonView(colors)]}>
                <RoundButton
                    size={0.35}
                    color={!partner.partner.isOnline ? "primary" : "accent"}
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
                <Text
                    style={[
                        Classes.text(colors),
                        { fontSize: 20, marginLeft: 10 }
                    ]}
                >
                    {!partner.partner.isOnline
                        ? t2("home.goNotice")
                        : t2("home.stopNotice")}
                </Text>
            </View>
        </>
    );
}
