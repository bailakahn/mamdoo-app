import React from "react";
import {
  View,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { useTheme, Text, TextInput } from "react-native-paper";
import { Classes } from "_styles";
import { t, t2 } from "_utils/lang";
import { Button, LoadingV2, Image } from "_atoms";
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
                {t2("main.forgotPassword")}
              </Text>
            </View>

            <View style={Classes.centeredLargeText(colors)}>
              <Text style={{ textAlign: "left", fontSize: 20 }}>
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
          </View>
          <View style={Classes.bottonView(colors)}>
            <View>
              <Button
                {...Classes.buttonContainer(colors)}
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
                marginTop: 30,
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
