import React from "react";
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

export default function Verification({ navigation }) {
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
              <Text
                variant="titleLarge"
                style={{ fontSize: 25, fontWeight: "bold" }}
              >
                {t("main.verifyAccount")}
              </Text>
            </View>

            <View style={{ ...Classes.centeredLargeText(colors) }}>
              <Text>
                <Text variant="titleMedium" style={{ textAlign: "left" }}>
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

            <View style={{ marginTop: 30 }}>
              <TextInput
                style={Classes.formInput(colors)}
                outlineStyle={{ borderRadius: 10 }}
                mode="outlined"
                label={t("main.verificationPlaceholder")}
                placeholder={t("main.verificationPlaceholder")}
                value={user.verificationCode}
                onChangeText={(code) => user.actions.setVerificationCode(code)}
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

            <View
              style={{
                justifyContent: "center",
              }}
            >
              <TouchableOpacity
                style={{ alignItems: "center", marginTop: 10 }}
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
                onPress={user.actions.verifyAccount}
                disabled={!user.verificationCode}
              >
                <Text variant="titleLarge" style={{ color: "#fff" }}>{`${t(
                  "main.verify"
                )}`}</Text>
              </Button>
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                marginTop: 30,
              }}
            >
              <TouchableOpacity onPress={user.actions.logout}>
                <Text style={{ color: colors.accent, fontSize: 20 }}>
                  {t("main.editPhoneNumber")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
