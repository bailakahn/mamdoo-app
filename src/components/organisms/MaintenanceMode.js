import React from "react";
import { View } from "react-native";
import { useTheme, Text } from "react-native-paper";
import { Classes } from "_styles";
import { Button } from "_atoms";
import { t2 } from "_utils/lang";

export default function LocationDenied({ message, onReload = () => {} }) {
  const { colors } = useTheme();

  return (
    <View style={Classes.container(colors)}>
      <View>
        <Text style={{ fontSize: 25, fontWeight: "bold", color: "#25C0D2" }}>
          Mamdoo
        </Text>
      </View>
      <View style={{ padding: 10 }}>
        <Text style={{ fontSize: 25, textAlign: "center" }}>{message}</Text>
      </View>
      <View style={{ marginTop: 20 }}>
        <Button
          style={Classes.authorizeButton(colors)}
          mode="contained"
          onPress={onReload}
        >
          {t2("main.reload")}
        </Button>
      </View>
    </View>
  );
}
