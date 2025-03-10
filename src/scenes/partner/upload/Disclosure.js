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
            ...Classes.centeredViewUpload(colors),
            marginTop: 20,
            // alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: "900",
            }}
          >
            {t2("upload.disclosureTitle")}
          </Text>

          <Text
            style={{
              fontSize: 15,
              marginTop: 10,
            }}
          >
            {t2("upload.disclosureSubTitle")}
          </Text>
        </View>
        <View
          style={{
            ...Classes.centeredViewUpload(colors),
            marginTop: 20,
          }}
        >
          <ScrollView style={Classes.uploadInstructions(colors)}>
            <List.Item
              title={t2("upload.collectedDataTitle")}
              description={t2("upload.collectedDataDescription")}
              titleNumberOfLines={5}
              descriptionNumberOfLines={15}
              descriptionStyle={{ marginTop: 5 }}
              left={(props) => (
                <List.Icon
                  {...props}
                  icon={"file-upload"}
                  color={colors.primary}
                />
              )}
            />
            <List.Item
              title={t2("upload.whyWeCollectTitle")}
              description={
                <Text>
                  <Text>
                    {t2("upload.whyWeCollectDescription")} {"\n"}
                  </Text>
                  <Text>
                    {"\u2022"} {t2("upload.whyWeCollectDescription1")} {"\n"}
                  </Text>
                  <Text>
                    {"\u2022"} {t2("upload.whyWeCollectDescription2")} {"\n"}
                  </Text>
                  <Text>
                    {"\u2022"} {t2("upload.whyWeCollectDescription3")}
                  </Text>
                </Text>
              }
              titleNumberOfLines={5}
              descriptionNumberOfLines={15}
              descriptionStyle={{ marginTop: 5 }}
              left={(props) => (
                <List.Icon
                  {...props}
                  icon={"file-question"}
                  color={colors.primary}
                />
              )}
            />
            <List.Item
              title={t2("upload.dataUsageTitle")}
              description={t2("upload.dataUsageDescription")}
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
          </ScrollView>
        </View>

        <View
          style={{
            ...Classes.centeredViewUpload(colors),
            // alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 15,
              marginTop: 10,
            }}
          >
            {t2("upload.consentDescription")}
          </Text>
        </View>
        <View style={Classes.bottonView(colors)}>
          <View>
            <Button
              {...Classes.buttonContainer(colors)}
              mode="contained"
              onPress={() => navigation.navigate("Upload")}
            >
              {t2("upload.accept")}
            </Button>
          </View>
          <View>
            <Button
              {...Classes.logoutButtonContainer(colors)}
              mode="contained"
              onPress={() => navigation.navigate("NotActive")}
            >
              {t2("upload.decline")}
            </Button>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
