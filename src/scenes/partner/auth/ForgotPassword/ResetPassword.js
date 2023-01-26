import React, { useState } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { useTheme, Text, TextInput } from "react-native-paper";
import { Classes } from "_styles";
import { t, t2 } from "_utils/lang";
import { Button, LoadingV2 } from "_atoms";
import { usePartner } from "_hooks";

export default function PinVerification({ navigation }) {
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
      <ScrollView>
        <View style={Classes.container(colors)}>
          <View>
            <Image
              source={require("_assets/logo.png")}
              style={Classes.formLogo(colors)}
            />
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
          <View style={{ marginTop: 10 }}>
            <TextInput
              style={Classes.formInput(colors)}
              mode="outlined"
              label={t("main.verificationPlaceholder")}
              placeholder={t("main.verificationPlaceholder")}
              value={partner.forgotPinUser.code}
              onChangeText={(code) =>
                partner.actions.setForgotPinUser({
                  ...partner.forgotPinUser,
                  code,
                })
              }
              maxLength={4}
              keyboardType="number-pad"
              returnKeyType="done"
            />
          </View>
          <View style={Classes.centeredText(colors)}>
            <Text style={{ textAlign: "center" }}>
              {t2("main.pinVerificationNotice")}
            </Text>
          </View>
          <View style={{ marginTop: 10 }}>
            <TextInput
              style={Classes.formInput(colors)}
              mode="outlined"
              label={t2("form.pin")}
              placeholder={t2("form.pin")}
              value={partner.forgotPinUser.pin}
              onChangeText={(pin) =>
                partner.actions.setForgotPinUser({
                  ...partner.forgotPinUser,
                  pin,
                })
              }
              maxLength={4}
              keyboardType="number-pad"
              returnKeyType="done"
            />
            <TextInput
              style={Classes.formInput(colors)}
              mode="outlined"
              label={t2("form.pinValidation")}
              placeholder={t2("form.pinValidation")}
              value={partner.forgotPinUser.pinValidation}
              onChangeText={(pinValidation) =>
                partner.actions.setForgotPinUser({
                  ...partner.forgotPinUser,
                  pinValidation,
                })
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
              onPress={() => {
                partner.actions.resetPin();
              }}
              disabled={
                !partner.forgotPinUser.code ||
                !partner.forgotPinUser.pin ||
                !partner.forgotPinUser.pinValidation
              }
            >
              {`${t2("main.resetPassword")}`}
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
            }}
          >
            <TouchableOpacity
              style={{ marginLeft: 10, marginBottom: 100 }}
              onPress={() => navigation.navigate("ForgotPassword")}
            >
              <Text style={{ color: colors.accent, fontSize: 20 }}>
                {t("main.editPhoneNumber")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
