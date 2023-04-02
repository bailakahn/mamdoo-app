import React from "react";
import {
  View,
  Image,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { useTheme, Text, TextInput } from "react-native-paper";
import { Classes } from "_styles";
import { t, t2 } from "_utils/lang";
import { Button, LoadingV2 } from "_atoms";
import { usePartner } from "_hooks";

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
            <View style={{ marginBottom: 25 }}>
              <Text style={{ fontSize: 25, fontWeight: "bold" }}>
                {t2("main.forgotPassword")}
              </Text>
            </View>
            <View style={Classes.centeredText(colors)}>
              <Text style={{ textAlign: "center" }}>
                {t2("main.forgotPasswordText")}
              </Text>
            </View>

            <View style={{ marginTop: 10 }}>
              <TextInput
                style={Classes.formInput(colors)}
                outlineStyle={{ borderRadius: 10 }}
                mode="outlined"
                label={t2("form.phoneNumber")}
                placeholder={t2("form.phoneNumberPlaceholder")}
                value={partner.forgotPinUser.phoneNumber}
                onChangeText={(phoneNumber) =>
                  partner.actions.setForgotPinUser({
                    ...partner.forgotPinUser,
                    phoneNumber,
                  })
                }
                maxLength={9}
                keyboardType="number-pad"
                returnKeyType="done"
              />
            </View>
            <View style={Classes.error(colors)}>
              {partner.forgotPinError && (
                <Text style={Classes.errorText(colors)}>
                  {partner.forgotPinError}
                </Text>
              )}
            </View>
            <View style={{ marginTop: 10 }}>
              <Button
                {...Classes.verifyButtonContainer(colors)}
                mode="contained"
                onPress={() => {
                  partner.actions.sendForgotPinVerification(navigation);
                }}
              >
                {`${t2("main.resetPassword")}`}
              </Button>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                marginTop: 50,
              }}
            >
              <TouchableOpacity
                style={{ marginLeft: 10 }}
                onPress={() => navigation.navigate("Login")}
              >
                <Text style={{ color: colors.accent, fontSize: 20 }}>
                  {t("main.goBack")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
