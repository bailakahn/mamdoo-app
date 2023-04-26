import React from "react";
import {
  View,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  TouchableOpacity,
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
            <View style={{ marginBottom: 25 }}>
              <Text style={{ fontSize: 25, fontWeight: "bold" }}>
                {t("main.forgotPassword")}
              </Text>
            </View>
            <View style={Classes.centeredLargeText(colors)}>
              <Text style={{ textAlign: "left", fontSize: 20 }}>
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
          </View>
          <View style={Classes.bottonView(colors)}>
            <View>
              <Button
                {...Classes.buttonContainer(colors)}
                mode="contained"
                onPress={() => {
                  user.actions.sendForgotPinVerification(navigation);
                }}
                disabled={!user?.forgotPasswordUser.phoneNumber}
              >
                <Text style={{ color: "#fff" }} variant="titleLarge">
                  {t("main.resetPassword")}
                </Text>
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
