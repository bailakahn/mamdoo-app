import React from "react";
import { View, TouchableOpacity, ScrollView, SafeAreaView } from "react-native";
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
      <ScrollView>
        <View style={Classes.container(colors)}>
          <View>
            <Image
              source={require("_assets/logo.png")}
              cacheKey="logo"
              style={Classes.formLogo(colors)}
            />
          </View>
          {/* <View style={{ marginBottom: 25 }}>
                <Text style={{ fontSize: 25, fontWeight: "bold" }}>
                    {t("main.verification")}
                </Text>
            </View> */}
          <View style={{ marginBottom: 25 }}>
            <Text style={{ fontSize: 20, fontWeight: "bold" }}>
              {t("main.accountNotVerified")}
            </Text>
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
          <View style={{ marginTop: 30 }}>
            <TextInput
              style={Classes.formInput(colors)}
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
          <View style={{ marginTop: 30 }}>
            <Button
              {...Classes.verifyButtonContainer(colors)}
              mode="contained"
              onPress={user.actions.verifyAccount}
              disabled={!user.verificationCode}
            >
              {`${t("main.verify")}`}
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
              style={{ alignItems: "center", marginTop: 10 }}
              onPress={user.actions.resend}
            >
              <Text style={{ color: colors.accent, fontSize: 20 }}>
                {t("main.sendVerificationAgain")}
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
              onPress={user.actions.logout}
            >
              <Text style={{ color: colors.accent, fontSize: 20 }}>
                {t("main.editPhoneNumber")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
