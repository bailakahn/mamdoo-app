import React from "react";
import { View, Image, ScrollView, TouchableOpacity } from "react-native";
import { useTheme, Text } from "react-native-paper";
import { Classes } from "_styles";
import { t2 } from "_utils/lang";
import { Button, LoadingV2 } from "_atoms";
import { useApp, usePartner } from "_hooks";

export default function ForgotPassword({ navigation }) {
  const { colors } = useTheme();
  const app = useApp();
  const partner = usePartner();

  return partner.isLoading ? (
    <LoadingV2 />
  ) : (
    <ScrollView>
      <View style={Classes.container(colors)}>
        <View style={{ marginTop: 20 }}>
          <Image
            source={require("_assets/logo.png")}
            style={Classes.formLogo(colors)}
          />
        </View>
        <View style={{ marginBottom: 25 }}>
          <Text style={{ fontSize: 25, fontWeight: "bold" }}>
            {t2("upload.notActive")}
          </Text>
        </View>
        <View style={Classes.centeredText(colors)}>
          <Text style={{ textAlign: "left" }}>
            {t2("upload.notActiveText")}
          </Text>
        </View>
        <View style={{ ...Classes.centeredText(colors), marginTop: 10 }}>
          <Text style={{ textAlign: "left" }}>{t2("upload.listOfIds")}</Text>
        </View>
        <View style={{ ...Classes.centeredText(colors), marginTop: 10 }}>
          <Text style={{ textAlign: "left" }}>
            {`\u2022 ${t2("upload.driverLicence")}`}
          </Text>
          <Text style={{ textAlign: "left" }}>
            {`\u2022 ${t2("upload.licenceRegistration")}`}
          </Text>
        </View>
        <View style={{ ...Classes.centeredText(colors), marginTop: 10 }}>
          <Text style={{ textAlign: "left" }}>
            {t2("upload.timeToValidate")}
          </Text>
        </View>
        <View style={{ ...Classes.centeredText(colors), marginTop: 10 }}>
          <Text style={{ textAlign: "left" }}>{t2("upload.reloadText")}</Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            marginTop: 30,
          }}
        >
          <TouchableOpacity
            style={{ marginLeft: 10 }}
            onPress={partner.actions.refresh}
          >
            <Text style={{ color: colors.accent, fontSize: 20 }}>
              {t2("upload.reloadButton")}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={{ marginTop: 30, marginBottom: 20 }}>
          <Button
            // style={Classes.callButton(colors)}
            {...Classes.callButtonContainer(colors)}
            mode="contained"
            onPress={() => navigation.navigate("UploadInstructions")}
          >
            {`${t2("upload.addDocuments")}`}
          </Button>
        </View>
        <View style={{ marginTop: 15, marginBottom: 20 }}>
          <Button
            {...Classes.logoutButton(colors)}
            mode="contained"
            onPress={() => partner.actions.logout()}
          >
            {`${t2("upload.logout")}`}
          </Button>
        </View>
        <View style={{ ...Classes.centeredText(colors), marginTop: 10 }}>
          <Text style={{ textAlign: "left" }}>{t2("upload.afterDelay")}</Text>
        </View>
        <View style={{ marginTop: 30, marginBottom: 20 }}>
          <Button
            // style={Classes.callButton(colors)}
            {...Classes.callButtonContainer(colors)}
            mode="contained"
            onPress={app.actions.call}
          >
            {`${t2("upload.call")} ${app.settings.phone}`}
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}
