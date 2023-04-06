import React from "react";
import { View } from "react-native";
import { useTheme, Text } from "react-native-paper";
import { Classes } from "_styles";
import { t2 } from "_utils/lang";
import { Button, Image } from "_atoms";

export default function LocationDisclosure({ setBackgroundPermission }) {
  const { colors } = useTheme();

  return (
    <View
      style={{
        ...Classes.container(colors),
        backgroundColor: "#fff",
      }}
    >
      <View style={{ marginTop: 20 }}>
        <Image
          source={require("_assets/logo.png")}
          cacheKey={"logo"}
          style={Classes.formLogo(colors)}
        />
      </View>
      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 25, fontWeight: "bold" }}>
          {t2("main.locationDisclosureTitle")}
        </Text>
      </View>

      <View style={{ padding: 20 }}>
        <View>
          <Text
            style={{
              fontSize: 20,
              textAlign: "left",
              fontWeight: "bold",
            }}
          >
            {`\u2022 ` + t2("main.locationDisclosureText")}
          </Text>
        </View>

        <View style={{ marginTop: 10 }}>
          <Text
            style={{
              fontSize: 20,
              textAlign: "left",
              fontWeight: "bold",
            }}
          >
            {`\u2022 ` + t2("main.locationDisclosureTextDetails")}
          </Text>
        </View>
      </View>

      <View style={{ padding: 10 }}>
        <Text style={{ fontSize: 15, textAlign: "center" }}>
          {t2("main.locationDisclosureApprovalText")}
        </Text>
      </View>

      <View style={{ marginTop: 20, marginBottom: 30 }}>
        <Button
          style={Classes.authorizeButton(colors)}
          mode="contained"
          onPress={() => setBackgroundPermission("loaded")}
        >
          {t2("main.locationDisclosureApprovalButton")}
        </Button>
      </View>
    </View>
  );
}
