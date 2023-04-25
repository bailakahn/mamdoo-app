import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Linking,
  SafeAreaView,
} from "react-native";
import { useTheme, TextInput, Text } from "react-native-paper";
import { Classes } from "_styles";
import { t } from "_utils/lang";
import { useUser, useApp } from "_hooks";
import { Button, RoundButton, LoadingV2, Image } from "_atoms";

export default function Register({ navigation }) {
  const { colors } = useTheme();
  const app = useApp();
  const [hidePin, setHidePin] = useState(true);

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
            <View style={Classes.centeredView(colors)}>
              {user.formError && (
                <Text style={Classes.errorText(colors)}>{user.formError}</Text>
              )}
            </View>
          </View>
          <View style={Classes.bottonView(colors)}>
            <View style={Classes.privacyPolicyView(colors)}>
              <Text style={{ fontSize: 16 }}>
                <Text var>{t("main.privacyPolicyText")}</Text>
                <Text
                  style={{
                    color: colors.primary,
                    fontWeight: "bold",
                  }}
                  onPress={() =>
                    Linking.openURL("https://www.mamdoo.app/fr/policy")
                  }
                >
                  {t("main.privacyPolicyLink")}
                </Text>
              </Text>
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
                <Text style={{ color: "#000" }} variant="titleLarge">
                  {t("form.start")}
                </Text>
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
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
