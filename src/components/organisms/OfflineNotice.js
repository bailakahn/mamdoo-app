import React from "react";
import { View, Text, SafeAreaView } from "react-native";
// import { useNetworkState } from "expo-network";
import * as Network from "expo-network";
import { Classes } from "_styles";
import { t } from "_utils/lang";

export default function OfflineNotice() {
  const network = Network.useNetworkState();

  // network.isConnected may be null initially
  if (network.isConnected === null || network.isConnected === true) {
    return null;
  }

  return (
    <SafeAreaView>
      <View style={[Classes.offlineContainer, { backgroundColor: "#b52424" }]}>
        <Text style={Classes.text}>{t("main.noInternetConnection")}</Text>
      </View>
    </SafeAreaView>
  );
}
