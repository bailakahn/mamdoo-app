import React, { useState, useEffect } from "react";
import {
  View,
  SafeAreaView,
  ScrollView,
  Platform,
  TouchableOpacity,
} from "react-native";
import { Text, useTheme, List, Divider, DataTable } from "react-native-paper";
import { Classes } from "_styles";
import { t } from "_utils/lang";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Icon from "react-native-vector-icons/MaterialIcons";
import {
  useProxy,
  useRequest,
  useNotifications,
  useLanguage,
  useUser,
  useApp,
} from "_hooks";
import { Info, Modal } from "_molecules";
import { RoundButton, Button } from "_atoms";
import PopConfirm from "_organisms/PopConfirm";
import date from "../../../utils/helpers/date";

export default function HomeScreen({ navigation, route }) {
  const [info, setInfo] = useState(false);
  const [visible, setVisible] = useState(false);
  const [drivers, setDrivers] = useState(false);
  const [currentRideId, setCurrentRideId] = useState(false);
  // connect to proxy server
  useProxy();
  useNotifications();
  useLanguage();
  const user = useUser();
  const app = useApp();

  const { colors } = useTheme();

  const request = useRequest();
  const { params: { notFound, nearByDrivers, requestId } = {} } = route;

  useEffect(() => {
    setInfo(notFound ? true : false);
  }, [notFound]);

  useEffect(() => {
    setDrivers(!!nearByDrivers?.length ? nearByDrivers : false);
    setCurrentRideId(requestId);
  }, [nearByDrivers]);

  useEffect(() => {
    if (user) user.actions.updateLocation();
  }, []);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colors.background,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View style={Classes.container(colors)}>
          <PopConfirm
            // title={
            //   <Text style={{ fontSize: 20, fontWeight: "bold" }}>
            //     {t("ride.confirmRideTitle")}
            //   </Text>
            // }
            title={" "}
            visible={visible}
            setVisible={setVisible}
            content={
              Platform.OS === "ios" ? (
                <View>
                  <View>
                    <View style={{ alignItems: "center", marginBottom: 5 }}>
                      <Text
                        style={{
                          color: "red",
                          fontSize: 25,
                          fontWeight: "bold",
                        }}
                      >
                        IMPORTANT!
                      </Text>
                    </View>
                    <View style={{ alignItems: "center" }}>
                      <Text
                        style={{
                          fontSize: 20,
                          fontWeight: "bold",
                          textAlign: "center",
                        }}
                      >
                        {t("ride.confirmRideContent")}
                      </Text>
                    </View>
                  </View>
                  <View style={{ marginTop: 10, alignItems: "center" }}>
                    <Text style={{ fontSize: 20 }}>
                      {t("ride.confirmRide")}
                    </Text>
                  </View>
                </View>
              ) : (
                <>
                  <View>
                    <Text
                      style={{
                        color: "red",
                        fontSize: 20,
                        fontWeight: "bold",
                        marginRight: 15,
                      }}
                    >
                      IMPORTANT!
                    </Text>
                  </View>
                  <Text>{t("ride.confirmRideContent")}</Text>
                  <View style={{ marginTop: 10, alignItems: "center" }}>
                    <Text
                      style={{
                        fontSize: 20,
                        fontWeight: "bold",
                      }}
                    >
                      {t("ride.confirmRide")}
                    </Text>
                  </View>
                </>
              )
            }
            onCancel={() => setVisible(false)}
            cancelText={
              <View
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon size={40} name="clear" color={"#fff"} />
                <Text style={{ color: "#fff" }}>
                  {t("ride.cancelConfirmCancel")}
                </Text>
              </View>
            }
            onConfirm={() => {
              setVisible(false);
              request.actions.findDrivers(navigation);
              // request.actions.makeRideRequest(navigation);
              navigation.navigate("RideRequest");
            }}
            okText={
              <View
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon size={40} name="check" color={"#fff"} />
                <Text style={{ color: "#fff" }}>
                  {t("ride.cancelConfirmOk")}
                </Text>
              </View>
            }
            okButtonProps={{ color: "primary" }}
            cancelButtonProps={{ color: "error" }}
            isRounded={true}
          />
          <Text
            style={{ ...Classes.text(colors), fontSize: 25, marginBottom: 10 }}
          >
            {t("home.welcome")}
          </Text>
          {user.user?.firstName && (
            <Text style={{ fontSize: 20, fontWeight: "bold" }}>
              {user.user?.firstName}
            </Text>
          )}
        </View>
        {user.user?.isBlocked && (
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
                {t("home.accountBlocked")}
              </Text>
            </View>
            <View style={{ marginTop: 30 }}>
              <Button
                {...Classes.callButtonContainer(colors)}
                mode="contained"
                onPress={app.actions.call}
              >
                {`${t("main.callUs")}`}
              </Button>
            </View>
          </View>
        )}
        <View style={Classes.bottonView(colors)}>
          <RoundButton
            disabled={user.user?.isBlocked}
            size={0.35}
            color={user.user?.isBlocked ? "lightgray" : "primary"}
            text={
              <View
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MaterialCommunityIcons
                  size={40}
                  name="motorbike"
                  color={"#fff"}
                />

                <Text style={{ color: "#fff" }}>{t("home.bookRide")}</Text>
              </View>
            }
            onPress={() => {
              // setVisible(true);
              // request.actions.makeRideRequest(navigation);
              request.actions.findDrivers(navigation);
              navigation.navigate("RideRequest");
            }}
            shadow={{ size: 0.3 }}
          />

          <View style={{ marginTop: 30 }}>
            <Info
              visible={info}
              text={t("home.noDriverFound")}
              onDismiss={() => {
                navigation.setParams({ notFound: false });
                setInfo(false);
              }}
              onClose={() => {
                navigation.setParams({ notFound: false });
                setInfo(false);
              }}
            />
            <Modal
              title={
                <Text
                  style={{
                    color: colors.primary,
                    fontSize: 20,
                  }}
                >
                  {t("home.contactDrivers")}
                </Text>
              }
              visible={!!drivers}
              children={
                <View>
                  <ScrollView>
                    {/* <View>
                      <Text>{t("home.contactDrivers")}</Text>
                    </View> */}
                    <DataTable>
                      <DataTable.Header>
                        <DataTable.Title style={Classes.dataCell(colors)}>
                          {t("home.firstName")}
                        </DataTable.Title>
                        <DataTable.Title style={Classes.dataCell(colors)}>
                          {t("home.phoneNumber")}
                        </DataTable.Title>
                        <DataTable.Title style={Classes.dataCell(colors)}>
                          {t("home.call")}
                        </DataTable.Title>
                      </DataTable.Header>
                      {!!drivers &&
                        drivers?.slice(0, 3).map((driver, index) => (
                          <TouchableOpacity
                            key={index}
                            onPress={() => {
                              request.actions.updateStatus(
                                currentRideId,
                                driver?._id,
                                "referred"
                              );
                              app.actions.call(driver?.phoneNumber);
                            }}
                          >
                            <DataTable.Row>
                              <DataTable.Cell style={Classes.dataCell(colors)}>
                                {`${driver?.firstName}`}
                              </DataTable.Cell>
                              <DataTable.Cell
                                style={{
                                  ...Classes.dataCell(colors),
                                }}
                              >
                                {driver?.phoneNumber}
                              </DataTable.Cell>
                              <DataTable.Cell style={Classes.dataCell(colors)}>
                                <Icon
                                  size={20}
                                  color={colors.primary}
                                  name="phone-forwarded"
                                />
                              </DataTable.Cell>
                            </DataTable.Row>
                          </TouchableOpacity>
                        ))}
                    </DataTable>
                  </ScrollView>
                </View>
              }
              onDismiss={() => {
                navigation.setParams({ nearByDrivers: false });
                setDrivers(false);
              }}
              onClose={() => {
                navigation.setParams({ nearByDrivers: false });
                setDrivers(false);
              }}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
