import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  SafeAreaView,
} from "react-native";
import { useTheme, Text, TextInput } from "react-native-paper";
import { Classes } from "_styles";
import { t2 } from "_utils/lang";
import { usePartner, useApp } from "_hooks";
import { Button, RoundButton, LoadingV2, Image } from "_atoms";

export default function Login({ navigation }) {
  const { colors } = useTheme();
  const app = useApp();
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
            <View style={{ marginTop: 20 }}>
              <Image
                source={require("_assets/logo.png")}
                cacheKey="logo"
                style={Classes.formLogo(colors)}
              />
            </View>
            <>
              <View style={{ marginBottom: 25 }}>
                <Text style={{ fontSize: 25, fontWeight: "bold" }}>
                  {t2("form.loginHeader")}
                </Text>
              </View>
              <View>
                <TextInput
                  style={Classes.formInput(colors)}
                  outlineStyle={{ borderRadius: 10 }}
                  mode="outlined"
                  label={t2("form.phoneNumber")}
                  placeholder={t2("form.phoneNumberPlaceholder")}
                  value={partner.auth.phoneNumber}
                  onChangeText={(phoneNumber) =>
                    partner.actions.setAuth({
                      ...partner.auth,
                      phoneNumber,
                    })
                  }
                  maxLength={9}
                  keyboardType="number-pad"
                  returnKeyType="done"
                />

                <TextInput
                  style={Classes.formInput(colors)}
                  outlineStyle={{ borderRadius: 10 }}
                  mode="outlined"
                  label={t2("form.pin")}
                  placeholder={t2("form.pin")}
                  value={partner.auth.pin}
                  onChangeText={(pin) =>
                    partner.actions.setAuth({
                      ...partner.auth,
                      pin,
                    })
                  }
                  maxLength={4}
                  keyboardType="number-pad"
                  returnKeyType="done"
                />
              </View>
            </>
            <View style={Classes.error(colors)}>
              {partner.formError && (
                <Text style={Classes.errorText(colors)}>
                  {partner.formError}
                </Text>
              )}
            </View>

            <View>
              <Button
                mode="contained"
                onPress={partner.actions.loginPartner}
                // style={Classes.formButton(colors)}
                {...Classes.buttonContainer(colors)}
                disabled={!partner.auth.phoneNumber || !partner.auth.pin}
              >
                {t2("form.start")}
              </Button>
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                marginTop: 30,
              }}
            >
              <Text style={{ fontSize: 20 }}>
                {t2("form.notRegisteredYet")}
              </Text>
              <TouchableOpacity
                style={{ marginLeft: 10 }}
                onPress={() => navigation.navigate("Register")}
              >
                <Text style={{ color: colors.accent, fontSize: 20 }}>
                  {t2("form.register")}
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
                style={{ marginLeft: 10 }}
                onPress={() => navigation.navigate("ForgotPassword")}
              >
                <Text style={{ color: colors.accent, fontSize: 20 }}>
                  {t2("form.forgotPassword")}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={{ marginTop: 50 }}>
              <RoundButton
                size={0.3}
                color={"grey"}
                text={"Changer d'application"}
                onPress={() => {
                  app.actions.removeApp();
                }}
                shadow={{ size: 0.27 }}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
