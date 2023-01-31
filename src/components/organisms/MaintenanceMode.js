import React from "react";
import { View, Image } from "react-native";
import { useTheme, Text } from "react-native-paper";
import { Classes } from "_styles";
import { t } from "_utils/lang";
export default function LocationDenied({ message }) {
  const { colors } = useTheme();

  return (
    <View style={Classes.container(colors)}>
      <View>
        <Image
          source={require("_assets/logo.png")}
          style={Classes.formLogo(colors)}
        />
      </View>
      <View style={{ padding: 10 }}>
        <Text style={{ fontSize: 25, textAlign: "center" }}>{message}</Text>
      </View>
    </View>
  );
}
