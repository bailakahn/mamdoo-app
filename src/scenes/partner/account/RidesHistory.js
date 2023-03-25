import React, { useEffect } from "react";
import { View, FlatList } from "react-native";
import { useTheme, Text, List, Divider } from "react-native-paper";
import { Classes } from "_styles";
import { usePartner } from "_hooks";
import date from "../../../utils/helpers/date";
import { t2, lang } from "_utils/lang"; // without this line it didn't work
import { LoadingV2 } from "_atoms";

export default function RidesHistoryScene() {
  const { colors } = useTheme();
  const partner = usePartner();

  useEffect(() => {
    partner.actions.getRidesHistory();
  }, []);

  const getRideStatusColor = (status) => {
    let color = "primary";
    switch (status) {
      case "canceled":
        color = "error";
        break;
      case "ongoing":
        color = "warning";
        break;
      case "completed":
        color = "success";
        break;
      default:
        color = "primary";
        break;
    }

    return color;
  };

  return partner.isLoading ? (
    <LoadingV2 />
  ) : (
    <View>
      <FlatList
        data={partner.ridesHistory}
        keyExtractor={(ride) => ride._id}
        ListEmptyComponent={
          <View style={{ alignItems: "center", marginTop: 20 }}>
            <Text>{t2("ridesHistory.noRides")}</Text>
          </View>
        }
        onEndReachedThreshold={0.1}
        onEndReached={() => {
          console.log(
            "more...",
            partner.ridesHistory[partner.ridesHistory.length - 1].createdAt
          );
          partner.actions.getMoreRidesHistory(
            partner.ridesHistory[partner.ridesHistory.length - 1].createdAt
          );
        }}
        renderItem={({ item: ride }) => {
          return (
            <View>
              <List.Item
                title={
                  ride.client
                    ? `${ride.client.firstName} ${ride.client.lastName}`
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
                  <List.Icon
                    {...props}
                    icon={"chevron-right"}
                    color={colors.primary}
                  />
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
