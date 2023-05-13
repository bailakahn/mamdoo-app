import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from "react-native";
import { useTheme, Text, TextInput, FAB } from "react-native-paper";
import { Classes } from "_styles";
import { t } from "_utils/lang";
import { useUser, useApp } from "_hooks";
import { Button, RoundButton, LoadingV2, Image } from "_atoms";

export default function Login({ navigation }) {
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
            {/* <View>
              <Image
                source={require("_assets/logo.png")}
                cacheKey="logo"
                style={Classes.formLogo(colors)}
              />
            </View> */}
            <View>
              <View style={{ marginBottom: 25 }}>
                <Text style={{ fontSize: 25, fontWeight: "bold" }}>
                  {t("form.loginHeader")}
                </Text>
              </View>
            </View>
            <View>
              <TextInput
                style={Classes.formInput(colors)}
                outlineStyle={Classes.textInputOutline(colors)}
                mode="outlined"
                label={t("form.phoneNumber")}
                placeholder={t("form.phoneNumberPlaceholder")}
                value={user.auth.phoneNumber}
                onChangeText={(phoneNumber) =>
                  user.actions.setAuth({
                    ...user.auth,
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
                placeholder={t("form.pin")}
                value={user.auth.pin}
                onChangeText={(pin) =>
                  user.actions.setAuth({
                    ...user.auth,
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
            <View style={Classes.error(colors)}>
              {user.formError && (
                <Text style={Classes.errorText(colors)}>{user.formError}</Text>
              )}
            </View>

            <View
              style={{
                ...Classes.mainView(colors),
                alignItems: "flex-end",
                marginTop: 10,
              }}
            >
              <TouchableOpacity
                style={{ marginLeft: 10 }}
                onPress={() => navigation.navigate("ForgotPassword")}
              >
                <Text style={{ color: colors.accent, fontSize: 20 }}>
                  {t("form.forgotPassword")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={Classes.bottonView(colors)}>
            <View style={{ alignSelf: "flex-end" }}>
              <FAB
                icon="swap-horizontal-bold"
                style={{
                  backgroundColor: colors.primary,
                }}
                color={"#fff"}
                onPress={() => app.actions.removeApp()}
              />
            </View>
            <View>
              <Button
                mode="contained"
                onPress={user.actions.loginUser}
                disabled={!user.auth.phoneNumber || !user.auth.pin}
                {...Classes.buttonContainer(colors)}
              >
                {t("form.login")}
              </Button>
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                marginTop: 30,
              }}
            >
              <Text style={{ fontSize: 20 }}>{t("form.notRegisteredYet")}</Text>
              <TouchableOpacity
                style={{ marginLeft: 10 }}
                onPress={() => navigation.navigate("Register")}
              >
                <Text style={{ color: colors.accent, fontSize: 20 }}>
                  {t("form.register")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
