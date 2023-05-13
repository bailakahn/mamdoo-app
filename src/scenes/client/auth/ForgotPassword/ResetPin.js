import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
} from "react-native";
import { useTheme, Text, TextInput } from "react-native-paper";
import { Classes } from "_styles";
import { t } from "_utils/lang";
import { Button, LoadingV2, Image } from "_atoms";
import { useUser } from "_hooks";

export default function PinVerification({ navigation }) {
  const { colors } = useTheme();
  const user = useUser();
  const [hidePin, setHidePin] = useState(true);

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
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View
            style={{
              ...Classes.container(colors),
              justifyContent: "flex-start",
            }}
          >
            <View style={{ marginBottom: 10 }}>
              <Text style={{ fontSize: 25, fontWeight: "bold" }}>
                {t("form.pinResetTitle")}
              </Text>
            </View>

            <View style={{ ...Classes.centeredLargeText(colors) }}>
              <Text>
                <Text variant="titleMedium" style={{ textAlign: "center" }}>
                  {t("main.verificationSent")}
                </Text>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "bold",
                    color: colors.primary,
                  }}
                >
                  {user.user?.phoneNumber}
                </Text>
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

            <View style={Classes.centeredLargeText(colors)}>
              <Text style={{ fontSize: 15 }}>
                {t("form.pinResetDescription")}
              </Text>
            </View>

            <View>
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
                secureTextEntry={hidePin}
                right={
                  <TextInput.Icon
                    style={{ marginTop: 15 }}
                    icon={hidePin ? "eye" : "eye-off"}
                    iconColor={colors.primary}
                    onPress={() => setHidePin(!hidePin)}
                  />
                }
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
                secureTextEntry={hidePin}
                right={
                  <TextInput.Icon
                    style={{ marginTop: 15 }}
                    icon={hidePin ? "eye" : "eye-off"}
                    iconColor={colors.primary}
                    onPress={() => setHidePin(!hidePin)}
                  />
                }
              />
            </View>
            <View style={Classes.error(colors)}>
              {user.verificationError && (
                <Text style={Classes.errorText(colors)}>
                  {user.verificationError}
                </Text>
              )}
            </View>

            <View
              style={{
                justifyContent: "center",
              }}
            >
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
          <View style={Classes.bottonView(colors)}>
            <View>
              <Button
                {...Classes.buttonContainer(colors)}
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
                {t("main.resetPassword")}
              </Button>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                marginTop: 20,
              }}
            >
              <TouchableOpacity
                style={{ marginLeft: 10 }}
                onPress={() => navigation.navigate("Login")}
              >
                <Text style={{ color: colors.accent, fontSize: 20 }}>
                  {t("form.backToLogin")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
