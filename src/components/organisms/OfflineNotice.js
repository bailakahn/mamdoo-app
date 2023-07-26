import React from "react";
import { View, Text, SafeAreaView } from "react-native";
import { NetworkConsumer } from "react-native-offline";
import { Classes } from "_styles";
import { t } from "_utils/lang";

export default function OfflineNotice(params) {
  return (
    <NetworkConsumer>
      {({ isConnected }) =>
        isConnected ? null : (
          <SafeAreaView>
            <View
              style={[Classes.offlineContainer, { backgroundColor: "#b52424" }]}
            >
              <Text style={Classes.text}>{t("main.noInternetConnection")}</Text>
            </View>
          </SafeAreaView>
        )
      }
    </NetworkConsumer>
  );
}
