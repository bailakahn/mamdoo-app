import React from "react";
import { View, SafeAreaView, ScrollView } from "react-native";
import { Text, useTheme, Avatar, List, Divider } from "react-native-paper";
import { useRide } from "_hooks/partner";
import { Classes } from "_styles";
import { Button, LoadingV2 } from "_atoms";
import { t2 } from "_utils/lang";
import { Mixins } from "../../../styles";

export default function RideSummaryScene({ navigation }) {
  const ride = useRide();
  const { colors } = useTheme();

  if (!ride.request?.client || !ride?.ridePrice) return <LoadingV2 />;

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colors.background,
        alignItems: "center",
        // justifyContent: "center",
      }}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View
          style={{
            flexGrow: 1,
            justifyContent: "center",
          }}
        >
          <Text variant="titleLarge" style={{ fontWeight: "bold" }}>
            {t2("ride.rideSummaryTitle")}
          </Text>
        </View>

        <View style={{ flexGrow: 1, justifyContent: "center" }}>
          <View style={{ alignItems: "center", marginBottom: 20 }}>
            <View>
              <Avatar.Text
                size={70}
                label={`${ride.request.client?.firstName
                  .charAt(0)
                  .toUpperCase()}${ride.request.client?.lastName
                  .charAt(0)
                  .toUpperCase()}`}
              />
            </View>

            <View
              style={{
                marginTop: 20,
              }}
            >
              <Text style={{ fontWeight: "900" }}>
                {`${ride.request.client.firstName} ${ride.request.client.lastName}`}
              </Text>
            </View>
          </View>

          <View style={{ width: Mixins.width(0.95, true) }}>
            <List.Item
              title={t2("ride.price")}
              right={() => (
                <Text variant="titleLarge" style={{ fontWeight: "900" }}>
                  {ride.actions.formatPrice(ride.ridePrice) + " GNF"}
                </Text>
              )}
            />
            <Divider />
          </View>
        </View>
        <View style={Classes.bottonView(colors)}>
          <View>
            <Button
              mode="contained"
              onPress={() => {
                ride.actions.resetRide();
                navigation.navigate("Home");
              }}
              {...Classes.buttonContainer(colors)}
            >
              {t2("ride.done")}
            </Button>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
