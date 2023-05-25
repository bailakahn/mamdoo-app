import React from "react";
import { View, ScrollView, SafeAreaView } from "react-native";
import { useTheme, Text } from "react-native-paper";
import { Classes } from "_styles";
import { Button } from "_atoms";
import { t2 } from "_utils/lang";

export default function LocationDenied({
  message,
  onReload = () => {},
  onLogout,
}) {
  const { colors } = useTheme();

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colors.background,
        alignItems: "center",
      }}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          alignItems: "center",
        }}
      >
        <View
          style={{
            ...Classes.container(colors),
            flexGrow: 1,
            // justifyContent: "flex-end",
          }}
        >
          <View>
            <Text
              style={{ fontSize: 25, fontWeight: "bold", color: "#25C0D2" }}
            >
              Mamdoo
            </Text>
          </View>
          <View style={{ padding: 10 }}>
            <Text style={{ fontSize: 25, textAlign: "center" }}>{message}</Text>
          </View>
        </View>
        <View style={Classes.bottonView(colors)}>
          <View>
            <Button
              {...Classes.buttonContainer(colors)}
              mode="contained"
              onPress={onReload}
            >
              {t2("main.reload")}
            </Button>
          </View>
          {onLogout && (
            <View style={{ marginTop: 20 }}>
              <Button
                {...Classes.logoutButtonContainer(colors)}
                mode="contained"
                onPress={onLogout}
              >
                {t2("main.logOut")}
              </Button>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
