import React from "react";
import {
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
} from "react-native";
import { useTheme, Text, TextInput } from "react-native-paper";
import { Classes } from "_styles";
import { t } from "_utils/lang";
import { Button, LoadingV2 } from "_atoms";
import { usePartner } from "_hooks";

export default function Verification({ navigation }) {
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
        justifyContent: "center",
      }}
    >
      <KeyboardAvoidingView
        // behavior="height"
        // style={{ flex: 1, paddingHorizontal: 10 }}
        {...(Platform.OS === "ios"
          ? {
              enabled: true,
              behavior: "padding",
              keyboardVerticalOffset: 5,
            }
          : {})}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View style={Classes.container(colors)}>
            <View>
              <Image
                source={require("_assets/logo.png")}
                style={Classes.formLogo(colors)}
              />
            </View>
            {/* <View style={{ marginBottom: 25 }}>
                <Text style={{ fontSize: 25, fontWeight: "bold" }}>
                    {t("main.verification")}
                </Text>
            </View> */}
            <View style={{ marginBottom: 25 }}>
              <Text style={{ fontSize: 20, fontWeight: "bold" }}>
                {t("main.accountNotVerified")}
              </Text>
            </View>

            <View style={Classes.centeredText(colors)}>
              <Text style={{ textAlign: "center" }}>
                {t("main.verificationSent")}
              </Text>
            </View>

            <View style={{ marginTop: 10 }}>
              <Text
                style={{
                  fontSize: 25,
                  fontWeight: "bold",
                  color: colors.primary,
                }}
              >
                {partner.partner?.phoneNumber}
              </Text>
            </View>
            <View style={{ marginTop: 30 }}>
              <TextInput
                style={Classes.formInput(colors)}
                outlineStyle={{ borderRadius: 10 }}
                mode="outlined"
                label={t("main.verificationPlaceholder")}
                placeholder={t("main.verificationPlaceholder")}
                value={partner.verificationCode}
                onChangeText={(code) =>
                  partner.actions.setVerificationCode(code)
                }
                maxLength={4}
                keyboardType="number-pad"
                returnKeyType="done"
              />
            </View>
            <View style={Classes.error(colors)}>
              {partner.verificationError && (
                <Text style={Classes.errorText(colors)}>
                  {partner.verificationError}
                </Text>
              )}
            </View>
            <View style={{ marginTop: 30 }}>
              <Button
                {...Classes.verifyButtonContainer(colors)}
                mode="contained"
                onPress={partner.actions.verifyAccount}
                disabled={!partner.verificationCode}
              >
                <Text variant="titleLarge" style={{ color: "#fff" }}>{`${t(
                  "main.verify"
                )}`}</Text>
              </Button>
            </View>

            <View
              style={{
                justifyContent: "center",
                marginTop: 30,
              }}
            >
              <Text style={{ fontSize: 20 }}>
                {t("main.verificationNotReceived")}
              </Text>
              <TouchableOpacity
                style={{ marginTop: 10, alignItems: "center" }}
                onPress={partner.actions.resend}
              >
                <Text style={{ color: colors.accent, fontSize: 20 }}>
                  {t("main.sendVerificationAgain")}
                </Text>
              </TouchableOpacity>
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                marginTop: 30,
                marginBottom: 30,
              }}
            >
              <TouchableOpacity
                style={{ marginLeft: 10 }}
                onPress={partner.actions.logout}
              >
                <Text style={{ color: colors.accent, fontSize: 20 }}>
                  {t("main.editPhoneNumber")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
