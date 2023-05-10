import React from "react";
import { View, SafeAreaView, ScrollView } from "react-native";
import { Text, useTheme, Chip, Surface } from "react-native-paper";
import { useRide } from "_hooks/partner";
import { Classes } from "_styles";
import { Button, LoadingV2 } from "_atoms";
import { t2 } from "_utils/lang";

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
        <View style={{ flexGrow: 1, justifyContent: "center" }}>
          <View>
            <Text variant="titleLarge" style={{ fontWeight: "bold" }}>
              {t2("ride.rideSummaryTitle")}
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-evenly",
              marginTop: 20,
            }}
          >
            <Text style={{ fontWeight: "900" }}>
              {ride.request.client.firstName}
            </Text>
            <Text style={{ fontWeight: "900" }}>
              {ride.request.client.lastName}
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "baseline",
              marginTop: 20,
              justifyContent: "space-around",
            }}
          >
            <Text variant="titleMedium">{t2("ride.price")}</Text>
            <Chip elevated elevation={4}>
              {ride.actions.formatPrice(ride.ridePrice) + " GNF"}
            </Chip>
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
              <Text style={{ color: "#fff" }} variant="titleLarge">
                {t2("ride.done")}
              </Text>
            </Button>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
