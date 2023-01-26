import React, { useState } from "react";
import { View, SafeAreaView } from "react-native";
import {
  useTheme,
  Text,
  List,
  Divider,
  Dialog,
  Portal,
  Paragraph,
} from "react-native-paper";
import { Classes } from "_styles";
import { t2 } from "_utils/lang";
import { Button, LoadingV2 } from "_atoms";
import { usePartner } from "_hooks";

export default function Upload({ navigation }) {
  const { colors } = useTheme();
  const partner = usePartner();
  const [visible, setVisible] = useState(false);

  const UploadConfirmation = () => (
    <Portal>
      <Dialog visible={visible} onDismiss={() => setVisible(false)}>
        <Dialog.Title>{t2("upload.uploadDocuments")}</Dialog.Title>
        <Dialog.Content>
          <Paragraph>{t2("upload.uploadDocumentsConfirmation")}</Paragraph>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setVisible(false)} style={{ marginRight: 50 }}>
            <Text style={{ color: colors.text }}>{t2("upload.cancel")}</Text>
          </Button>
          <Button
            mode="text"
            onPress={() => {
              setVisible(false);
              partner.actions.uploadDocumentsToS3(navigation);
            }}
          >
            <Text style={{ color: colors.primary }}>{t2("upload.upload")}</Text>
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );

  return partner.isLoading ? (
    <LoadingV2 />
  ) : (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colors.background,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <UploadConfirmation />
      <View
        style={{
          ...Classes.centeredView(colors),
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontSize: 25,
            fontWeight: "bold",
          }}
        >
          {t2("upload.mandatoyStepsTitle")}
        </Text>

        <Text
          style={{
            fontSize: 15,
            marginTop: 10,
          }}
        >
          {t2("upload.mandatoyStepsDescription")}
        </Text>
      </View>

      <View
        style={{
          ...Classes.centeredView(colors),
          marginTop: 20,
        }}
      >
        <View style={Classes.uploadDocuments(colors)}>
          <View style={{ marginBottom: 20 }}>
            <List.Item
              title={t2("upload.profilePicture")}
              titleNumberOfLines={5}
              left={(props) => (
                <List.Icon {...props} icon={"camera"} color={colors.primary} />
              )}
              right={(props) => (
                <List.Icon
                  {...props}
                  icon={
                    partner?.uploadDocuments?.profilePicture
                      ? "checkbox-marked-circle"
                      : "chevron-right"
                  }
                  color={colors.primary}
                />
              )}
              onPress={() => navigation.navigate("ProfilePicture")}
            />
            <Divider />
          </View>
          <View style={{ marginBottom: 20 }}>
            <List.Item
              title={`${t2("upload.driverLicense")} (${t2("upload.optional")})`}
              titleNumberOfLines={5}
              left={(props) => (
                <List.Icon
                  {...props}
                  icon={"card-account-details"}
                  color={colors.primary}
                />
              )}
              right={(props) => (
                <List.Icon
                  {...props}
                  icon={
                    partner?.uploadDocuments?.driverLicenseFront &&
                    partner?.uploadDocuments?.driverLicenseBack
                      ? "checkbox-marked-circle"
                      : "chevron-right"
                  }
                  color={colors.primary}
                />
              )}
              onPress={() => navigation.navigate("DriverLicense")}
            />
            <Divider />
          </View>

          <View style={{ marginBottom: 20 }}>
            <List.Item
              title={t2("upload.cabLicense")}
              titleNumberOfLines={5}
              left={(props) => (
                <List.Icon
                  {...props}
                  icon={"file-document"}
                  color={colors.primary}
                />
              )}
              right={(props) => (
                <List.Icon
                  {...props}
                  icon={
                    partner?.uploadDocuments?.cabLicense
                      ? "checkbox-marked-circle"
                      : "chevron-right"
                  }
                  color={colors.primary}
                />
              )}
              onPress={() => navigation.navigate("CabLicense")}
            />
            <Divider />
          </View>
        </View>
      </View>
      <View style={{ marginTop: 30 }}>
        <Button
          {...Classes.callButtonContainer(colors)}
          mode="contained"
          onPress={() => setVisible(true)}
          disabled={
            !partner.uploadDocuments?.profilePicture ||
            // !partner.uploadDocuments?.driverLicenseFront ||
            // !partner.uploadDocuments?.driverLicenseBack ||
            !partner.uploadDocuments?.cabLicense
          }
        >
          {`${t2("upload.uploadDocuments")}`}
        </Button>
      </View>
    </SafeAreaView>
  );
}
