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
import { useUser } from "_hooks";

export default function PinVerification({ navigation }) {
  const { colors } = useTheme();
  const user = useUser();

  return user.isLoading ? (
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
        // contentContainerStyle={{
        //   flexGrow: 1,
        //   justifyContent: "center",
        //   alignItems: "center",
        // }}
        >
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
                {user.user?.phoneNumber}
              </Text>
            </View>
            <View style={{ marginTop: 10 }}>
              <TextInput
                style={Classes.formInput(colors)}
                outlineStyle={{ borderRadius: 10 }}
                mode="outlined"
                label={t("main.verificationPlaceholder")}
                placeholder={t("main.verificationPlaceholder")}
                value={user.forgotPasswordUser.code}
                onChangeText={(code) =>
                  user.actions.setForgotPasswordUser({
                    ...user.forgotPasswordUser,
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
                {t("main.pinVerificationNotice")}
              </Text>
            </View>
            <View style={{ marginTop: 10 }}>
              <TextInput
                style={Classes.formInput(colors)}
                outlineStyle={{ borderRadius: 10 }}
                mode="outlined"
                label={t("form.pin")}
                placeholder={t("form.pin")}
                value={user.forgotPasswordUser.pin}
                onChangeText={(pin) =>
                  user.actions.setForgotPasswordUser({
                    ...user.forgotPasswordUser,
                    pin,
                  })
                }
                maxLength={4}
                keyboardType="number-pad"
                returnKeyType="done"
              />
              <TextInput
                style={Classes.formInput(colors)}
                outlineStyle={{ borderRadius: 10 }}
                mode="outlined"
                label={t("form.pinValidation")}
                placeholder={t("form.pinValidation")}
                value={user.forgotPasswordUser.pinValidation}
                onChangeText={(pinValidation) =>
                  user.actions.setForgotPasswordUser({
                    ...user.forgotPasswordUser,
                    pinValidation,
                  })
                }
                maxLength={4}
                keyboardType="number-pad"
                returnKeyType="done"
              />
            </View>
            <View style={Classes.error(colors)}>
              {user.verificationError && (
                <Text style={Classes.errorText(colors)}>
                  {user.verificationError}
                </Text>
              )}
            </View>
            <View style={{ marginTop: 30 }}>
              <Button
                {...Classes.verifyButtonContainer(colors)}
                mode="contained"
                onPress={() => {
                  user.actions.resetPin();
                }}
                disabled={
                  !user.forgotPasswordUser.code ||
                  !user.forgotPasswordUser.pin ||
                  !user.forgotPasswordUser.pinValidation
                }
              >
                {`${t("main.resetPassword")}`}
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
                onPress={user.actions.resend}
              >
                <Text style={{ color: colors.accent, fontSize: 20 }}>
                  {t("main.sendVerificationAgain")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
