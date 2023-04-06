import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Linking,
  SafeAreaView,
} from "react-native";
import { useTheme, TextInput, Checkbox } from "react-native-paper";
import { Classes } from "_styles";
import { t } from "_utils/lang";
import { useUser, useApp } from "_hooks";
import { Button, RoundButton, LoadingV2, Image } from "_atoms";

export default function Form({ navigation }) {
  const { colors } = useTheme();
  const app = useApp();

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
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View style={Classes.container(colors)}>
            <View>
              <Image
                source={require("_assets/logo.png")}
                cacheKey="logo"
                style={Classes.formLogo(colors)}
              />
            </View>
            <View>
              <View style={{ marginBottom: 10 }}>
                <Text
                  style={{
                    ...{ fontSize: 25, fontWeight: "bold" },
                    ...Classes.text(colors),
                  }}
                >
                  {t("form.registerHeader")}
                </Text>
              </View>
            </View>
            <View>
              <TextInput
                style={Classes.formInput(colors)}
                outlineStyle={{ borderRadius: 10 }}
                mode="outlined"
                label={t("form.firstName")}
                placeholder={t("form.firstName")}
                value={user.formUser.firstName}
                onChangeText={(firstName) =>
                  user.actions.setFormUser({
                    ...user.formUser,
                    firstName,
                  })
                }
                maxLength={50}
              />

              <TextInput
                style={Classes.formInput(colors)}
                outlineStyle={{ borderRadius: 10 }}
                mode="outlined"
                label={t("form.lastName")}
                placeholder={t("form.lastName")}
                value={user.formUser.lastName}
                onChangeText={(lastName) =>
                  user.actions.setFormUser({
                    ...user.formUser,
                    lastName,
                  })
                }
                maxLength={50}
              />

              <TextInput
                style={Classes.formInput(colors)}
                outlineStyle={{ borderRadius: 10 }}
                mode="outlined"
                label={t("form.phoneNumber")}
                placeholder={t("form.phoneNumberPlaceholder")}
                value={user.formUser.phoneNumber}
                onChangeText={(phoneNumber) =>
                  user.actions.setFormUser({
                    ...user.formUser,
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
                label={t("form.pin")}
                value={user.formUser.pin}
                onChangeText={(pin) =>
                  user.actions.setFormUser({
                    ...user.formUser,
                    pin,
                  })
                }
                maxLength={4}
                keyboardType="number-pad"
                returnKeyType="done"
              />
            </View>
            <View style={Classes.centeredView(colors)}>
              <Text style={Classes.text(colors)}>{t("form.pinText")}</Text>
              {user.formError && (
                <Text style={Classes.errorText(colors)}>{user.formError}</Text>
              )}
            </View>
            <View
              style={{
                ...Classes.centeredView(colors),
                marginTop: 20,
                marginBottom: 20,
              }}
            >
              <Text
                style={{
                  textAlign: "center",
                  marginBottom: 5,
                  ...Classes.text(colors),
                }}
              >
                {t("main.privacyPolicyText")}
              </Text>
              <TouchableOpacity
                style={{ marginLeft: 10, alignItems: "center" }}
                onPress={() =>
                  Linking.openURL("https://www.mamdoo.app/fr/policy")
                }
              >
                <Text
                  style={{
                    color: colors.primary,
                    fontSize: 16,
                    fontWeight: "bold",
                  }}
                >
                  {t("main.privacyPolicyLink")}
                </Text>
              </TouchableOpacity>
            </View>
            <View>
              <Button
                mode="contained"
                onPress={user.actions.saveUser}
                // style={Classes.formButton(colors)}
                {...Classes.buttonContainer(colors)}
                disabled={
                  !user.formUser.firstName ||
                  !user.formUser.lastName ||
                  !user.formUser.phoneNumber ||
                  !user.formUser.pin
                }
              >
                {t("form.start")}
              </Button>
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                marginTop: 30,
              }}
            >
              <Text style={{ ...Classes.text(colors), fontSize: 20 }}>
                {t("form.alreadyHaveAccount")}
              </Text>
              <TouchableOpacity
                style={{ marginLeft: 10 }}
                onPress={() => navigation.navigate("Login")}
              >
                <Text style={{ color: colors.accent, fontSize: 20 }}>
                  {t("form.login")}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={{ marginTop: 50, alignItems: "center" }}>
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
