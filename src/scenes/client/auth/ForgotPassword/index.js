import React from "react";
import {
  View,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";
import { useTheme, Text, TextInput } from "react-native-paper";
import { Classes } from "_styles";
import { t } from "_utils/lang";
import { Button, LoadingV2, Image } from "_atoms";
import { useUser } from "_hooks";

export default function ForgotPassword({ navigation }) {
  const { colors } = useTheme();
  const user = useUser();

  if (user.isLoading) return <LoadingV2 />;

  return (
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
        // if enabled then scrolling when keyboard is active does not work
        //   contentContainerStyle={{
        //     flexGrow: 1,
        //     justifyContent: "center",
        //     alignItems: "center",
        //   }}
        >
          <View style={Classes.container(colors)}>
            <View>
              <Image
                source={require("_assets/logo.png")}
                cacheKey="logo"
                style={Classes.formLogo(colors)}
              />
            </View>
            <View style={{ marginBottom: 25 }}>
              <Text style={{ fontSize: 25, fontWeight: "bold" }}>
                {t("main.forgotPassword")}
              </Text>
            </View>
            <View style={Classes.centeredText(colors)}>
              <Text style={{ textAlign: "center" }}>
                {t("main.forgotPasswordText")}
              </Text>
            </View>

            <View style={{ marginTop: 10 }}>
              <TextInput
                style={Classes.formInput(colors)}
                outlineStyle={{ borderRadius: 10 }}
                mode="outlined"
                label={t("form.phoneNumber")}
                placeholder={t("form.phoneNumberPlaceholder")}
                value={user.forgotPasswordUser.phoneNumber}
                onChangeText={(phoneNumber) =>
                  user.actions.setForgotPasswordUser({
                    ...user.forgotPasswordUser,
                    phoneNumber,
                  })
                }
                maxLength={9}
                keyboardType="number-pad"
                returnKeyType="done"
              />
            </View>
            <View style={Classes.error(colors)}>
              {user.forgotPasswordError && (
                <Text style={Classes.errorText(colors)}>
                  {user.forgotPasswordError}
                </Text>
              )}
            </View>
            <View style={{ marginTop: 10 }}>
              <Button
                {...Classes.verifyButtonContainer(colors)}
                mode="contained"
                onPress={() => {
                  user.actions.sendForgotPinVerification(navigation);
                }}
              >
                {`${t("main.resetPassword")}`}
              </Button>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
