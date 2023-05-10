import React from "react";
import { View, ScrollView, SafeAreaView } from "react-native";
import { useTheme, Text } from "react-native-paper";
import { Classes } from "_styles";
import { t2 } from "_utils/lang";
import { Button, LoadingV2, Image } from "_atoms";
import { usePartner } from "_hooks";
import * as Mixins from "../../../styles/mixins";

export default function ForgotPassword({ navigation }) {
  const { colors } = useTheme();
  const partner = usePartner();

  return partner.isLoading ? (
    <LoadingV2 />
  ) : (
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
          // justifyContent: "center",
          // alignItems: "center",
        }}
      >
        <View style={Classes.container(colors)}>
          <View style={Classes.centeredViewUpload(colors)}>
            <Text
              variant="bodyLarge"
              style={{ textAlign: "left", fontWeight: "900", fontSize: 20 }}
            >
              {t2("upload.notActiveText")}
            </Text>
          </View>
          <View
            style={{ ...Classes.centeredViewUpload(colors), marginTop: 10 }}
          >
            <Text variant="bodyLarge" style={{ textAlign: "left" }}>
              {t2("upload.listOfIds")}
            </Text>
          </View>
          <View
            style={{
              ...Classes.centeredViewUpload(colors),
              marginTop: 10,
            }}
          >
            <Text variant="bodyLarge" style={{ textAlign: "left" }}>
              {`\u2022 ${t2("upload.aProfilePicture")}`}
            </Text>
            <Text variant="bodyLarge" style={{ textAlign: "left" }}>
              {`\u2022 ${t2("upload.driverLicence")}`}
            </Text>
            <Text variant="bodyLarge" style={{ textAlign: "left" }}>
              {`\u2022 ${t2("upload.licenceRegistration")}`}
            </Text>
          </View>
          <View>
            <Image
              source={require("_assets/id.png")}
              cacheKey="id"
              style={{
                width: Mixins.width(0.5, true),
                height: Mixins.height(0.4, true),
              }}
            />
          </View>
        </View>
        <View style={Classes.bottonView(colors)}>
          <View>
            <Button
              // style={Classes.callButton(colors)}
              {...Classes.buttonContainer(colors)}
              mode="contained"
              onPress={() => navigation.navigate("UploadInstructions")}
            >
              {`${t2("upload.addDocuments")}`}
            </Button>
          </View>
          <View>
            <Button
              {...Classes.logoutButtonContainer(colors)}
              mode="contained"
              onPress={() => partner.actions.logout()}
            >
              {`${t2("upload.logout")}`}
            </Button>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
