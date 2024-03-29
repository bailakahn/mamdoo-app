import React, { useEffect, useState } from "react";
import { useKeepAwake } from "expo-keep-awake";
import { View, ScrollView, SafeAreaView, TouchableOpacity } from "react-native";
import {
  Headline,
  useTheme,
  Portal,
  Text,
  Modal,
  Dialog,
  Card,
  Avatar,
  IconButton,
} from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialIcons";
import { Classes } from "_styles";
import { t2 } from "_utils/lang";
import {
  usePartner,
  usePartnerProxy,
  useNotifications,
  useLanguage,
  useApp,
} from "_hooks";
import { useRide, useLocation } from "_hooks/partner";
import { RoundButton, Button, LoadingV2 } from "_atoms";
import { Info } from "_molecules";

const SearchDialog = ({ visible, setVisible }) => {
  const hideDialog = () => setVisible(false);

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={hideDialog}>
        <Dialog.Title>{t2("home.noRidesTitle")}</Dialog.Title>

        <Dialog.Content>
          <Text variant="bodyMedium">{t2("home.noRidesContent")}</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setVisible(false)}>Ok</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

export default function AccountScene({}) {
  const { colors } = useTheme();
  usePartnerProxy();
  useNotifications();
  useLanguage();
  useKeepAwake();
  const ride = useRide();
  const partner = usePartner();
  const location = useLocation();
  const app = useApp();
  const [showSearchDialog, setShowSearchDialog] = useState(false);

  useEffect(() => {
    ride.actions.bootstrapAsync();
  }, []);

  const acceptRequest = async () => {
    const { latitude, longitude } = await location.actions.getCurrentPosition();

    ride.actions.acceptRequest([longitude, latitude]);
  };

  return ride.isLoading ? (
    <LoadingV2 />
  ) : (
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
                flexDirection: "row",
              }}
            >
              <View style={{ marginRight: 20 }}>
                <RoundButton
                  size={0.35}
                  color="error"
                  text={
                    <View
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon size={40} name="clear" color={"#fff"} />
                      <Text style={{ color: "#fff" }}>
                        {t2("ride.denyRide")}
                      </Text>
                    </View>
                  }
                  onPress={ride.actions.denyRequest}
                  shadow={{ size: 0.3 }}
                />
              </View>

              <View style={{ marginLeft: 20 }}>
                <RoundButton
                  size={0.35}
                  color="primary"
                  text={
                    <View
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon size={40} name="check" color={"#fff"} />
                      <Text style={{ color: "#fff" }}>
                        {t2("ride.acceptRide")}
                      </Text>
                    </View>
                  }
                  onPress={acceptRequest}
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
      <SearchDialog
        visible={showSearchDialog}
        setVisible={setShowSearchDialog}
      />
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: colors.background,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View
          style={[
            Classes.driverConnectionStatusContainer,
            {
              backgroundColor: partner.partner.isOnline
                ? colors.primary
                : "#F1853F",
            },
          ]}
        >
          <Text style={Classes.text}>
            {partner.partner.isOnline
              ? t2("home.youAreOnline")
              : t2("home.youAreOffline")}
          </Text>
        </View>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View style={Classes.container(colors)}>
            <View>
              <Text style={{ ...Classes.text(colors), fontSize: 25 }}>
                {t2("home.welcome")}
              </Text>
            </View>

            <View
              style={Classes.driverWelcomeNoticeView(
                colors,
                partner.partner.isOnline
              )}
            >
              <Text style={{ fontSize: 20, fontWeight: "bold" }}>
                {partner.partner.isOnline
                  ? t2("home.offlineNotice")
                  : t2("home.onlineNotice")}
              </Text>
            </View>

            <View
              style={Classes.driverWelcomeNoticeView(
                colors,
                partner.partner.isOnline
              )}
            >
              <Card.Title
                title={t2("home.dailyCommission")}
                subtitle={
                  <Text
                    variant="titleLarge"
                    style={{ fontWeight: "bold" }}
                  >{`${ride.commission} GNF`}</Text>
                }
                left={(props) => <Avatar.Icon {...props} icon="percent" />}
              />
            </View>
          </View>
          {partner.partner?.isBlocked && (
            <View
              style={{
                ...Classes.notice(colors, "error"),
                justifyContent: "center",
                alignItems: "center",
                alignSelf: "center",
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
                  {t2("main.callUs")}
                </Button>
              </View>
            </View>
          )}
          <View style={[Classes.bottonView(colors)]}>
            {/* <RoundButton
              disabled={partner.partner?.isBlocked}
              size={0.35}
              color={!partner.partner.isOnline ? "primary" : "error"}
              text={
                <View
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon
                    size={40}
                    name={!partner.partner.isOnline ? "check" : "clear"}
                    color={"#fff"}
                  />
                  <Text style={{ color: "#fff" }}>
                    {t2(
                      `${!partner.partner.isOnline ? "home.go" : "home.stop"}`
                    )}
                  </Text>
                </View>
              }
              onPress={partner.actions.changeStatus}
              shadow={{ size: 0.3 }}
            /> */}
            {partner.partner.isOnline && (
              <TouchableOpacity
                style={Classes.driverOnlineNoticeView(
                  colors,
                  partner.partner.isOnline
                )}
                onPress={() => ride.actions.searchRides(setShowSearchDialog)}
              >
                <Text
                  style={{ fontSize: 20, fontWeight: "bold", color: "#fff" }}
                >
                  {t2("home.searchRides")}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
