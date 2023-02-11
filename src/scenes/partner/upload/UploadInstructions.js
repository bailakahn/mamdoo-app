import React from "react";
import { View, SafeAreaView, ScrollView } from "react-native";
import { useTheme, Text, List } from "react-native-paper";
import { Classes } from "_styles";
import { t2 } from "_utils/lang";
import { Button } from "_atoms";

export default function ForgotPassword({ navigation }) {
  const { colors } = useTheme();

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
        <View
          style={{
            ...Classes.centeredView(colors),
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              fontSize: 25,
              fontWeight: "bold",
            }}
          >
            {t2("upload.uploadDocumentsTipsTitle")}
          </Text>

          <Text
            style={{
              fontSize: 15,
              marginTop: 10,
            }}
          >
            {t2("upload.uploadDocumentsTipsDescription")}
          </Text>
        </View>
        <View
          style={{
            ...Classes.centeredView(colors),
            marginTop: 20,
          }}
        >
          <ScrollView style={Classes.uploadInstructions(colors)}>
            <List.Item
              title={t2("upload.tipOneTitle")}
              description={t2("upload.tipOneDescription")}
              titleNumberOfLines={5}
              descriptionNumberOfLines={15}
              descriptionStyle={{ marginTop: 5 }}
              left={(props) => (
                <List.Icon
                  {...props}
                  icon={"file-star"}
                  color={colors.primary}
                />
              )}
            />
            <List.Item
              title={t2("upload.tipTwoTitle")}
              description={t2("upload.tipTwoDescription")}
              titleNumberOfLines={5}
              descriptionNumberOfLines={15}
              descriptionStyle={{ marginTop: 5 }}
              left={(props) => (
                <List.Icon
                  {...props}
                  icon={"vector-square"}
                  color={colors.primary}
                />
              )}
            />
            <List.Item
              title={t2("upload.tipThreeTitle")}
              description={t2("upload.tipThreeDescription")}
              titleNumberOfLines={5}
              descriptionNumberOfLines={15}
              descriptionStyle={{ marginTop: 5 }}
              left={(props) => (
                <List.Icon
                  {...props}
                  icon={"safe-square"}
                  color={colors.primary}
                />
              )}
            />
            <List.Item
              title={t2("upload.tipFourTitle")}
              description={t2("upload.tipFourDescription")}
              titleNumberOfLines={5}
              descriptionNumberOfLines={15}
              descriptionStyle={{ marginTop: 5 }}
              left={(props) => (
                <List.Icon
                  {...props}
                  icon={"cloud-upload"}
                  color={colors.primary}
                />
              )}
            />
          </ScrollView>
          <View
            style={{
              alignItems: "center",
              marginTop: 50,
            }}
          >
            <Button
              mode="contained"
              onPress={() => {
                navigation.navigate("Upload");
              }}
              color={colors.primary}
              {...Classes.callButtonContainer(colors)}
            >
              {t2("upload.understood")}
            </Button>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
