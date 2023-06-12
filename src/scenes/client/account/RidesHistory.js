import React, { useEffect } from "react";
import { View, FlatList } from "react-native";
import { useTheme, Text, List, Divider } from "react-native-paper";
import { Classes } from "_styles";
import { useUser, useRide } from "_hooks";
import date from "../../../utils/helpers/date";
import { t, lang } from "_utils/lang"; // without this line it didn't work
import { LoadingV2 } from "_atoms";

export default function RidesHistoryScene() {
  const { colors } = useTheme();
  const user = useUser();
  const rideHook = useRide();

  useEffect(() => {
    user.actions.getRidesHistory();
  }, []);

  return user.isLoading ? (
    <LoadingV2 />
  ) : (
    <View>
      <FlatList
        data={user.ridesHistory}
        keyExtractor={(ride) => ride._id}
        ListEmptyComponent={
          <View style={{ alignItems: "center", marginTop: 20 }}>
            <Text>{t("ridesHistory.noRides")}</Text>
          </View>
        }
        onEndReachedThreshold={0.1}
        onEndReached={() => {
          console.log(
            "more...",
            user.ridesHistory[user.ridesHistory.length - 1].createdAt
          );
          user.actions.getMoreRidesHistory(
            user.ridesHistory[user.ridesHistory.length - 1].createdAt
          );
        }}
        renderItem={({ item: ride }) => {
          return (
            <View>
              <List.Item
                title={
                  ride.driver
                    ? `${ride.driver.firstName} ${ride.driver.lastName}`
                    : "Inconu"
                }
                description={date(ride.createdAt).format(
                  lang === "fr" ? "D MMM YYYY, HH:mm:ss" : "YYYY MMM Do, HH:mm"
                )}
                left={(props) => (
                  <List.Icon
                    {...props}
                    icon={
                      ride.status === "completed"
                        ? "checkbox-marked-circle"
                        : "chevron-right"
                    }
                    color={colors.primary}
                  />
                )}
                right={(props) => (
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text style={{ fontWeight: "bold" }}>
                      {`${
                        ride?.finalPrice
                          ? rideHook.actions.formatPrice(ride?.finalPrice) +
                            " GNF"
                          : ride?.maxPrice
                          ? rideHook.actions.formatPrice(ride?.maxPrice) +
                            " GNF"
                          : "N/A"
                      }`}
                    </Text>
                    <List.Icon
                      {...props}
                      icon={"chevron-right"}
                      color={colors.primary}
                    />
                  </View>
                )}
              />
              <Divider />
            </View>
          );
        }}
      />
    </View>
  );
}
