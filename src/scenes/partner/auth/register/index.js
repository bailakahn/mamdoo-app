import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  Linking,
  SafeAreaView,
  TextInput as TI,
} from "react-native";
import { useTheme, Text, TextInput, Switch } from "react-native-paper";
import { Picker } from "@react-native-picker/picker";
import { Classes } from "_styles";
import { t2, t, lang } from "_utils/lang";
import { usePartner, useApp } from "_hooks";
import { Button, RoundButton, LoadingV2, Image } from "_atoms";

export default function Register({ navigation }) {
  const { colors } = useTheme();
  const app = useApp();

  const partner = usePartner();

  const [step, setStep] = useState(1);
  const [hidePin, setHidePin] = useState(true);

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
            {step === 1 ? (
              <>
                <View style={{ marginBottom: 25 }}>
                  <Text style={{ fontSize: 25, fontWeight: "bold" }}>
                    {t2("form.registerHeader")}
                  </Text>
                </View>
                <View style={Classes.centeredLargeText(colors)}>
                  <Text
                    style={{
                      fontWeight: "bold",
                      textAlign: "left",
                      color: colors.primary,
                    }}
                    variant="titleMedium"
                  >
                    {t2("form.personalInfo")}
                  </Text>
                </View>
                <View>
                  <TextInput
                    style={[Classes.formInput(colors)]}
                    outlineStyle={{ borderRadius: 10 }}
                    mode="outlined"
                    label={t2("form.firstName")}
                    placeholder={t2("form.firstName")}
                    value={partner.formPartner.firstName}
                    onChangeText={(firstName) =>
                      partner.actions.setFormPartner({
                        ...partner.formPartner,
                        firstName,
                      })
                    }
                    maxLength={15}
                  />

                  <TextInput
                    style={Classes.formInput(colors)}
                    outlineStyle={{ borderRadius: 10 }}
                    mode="outlined"
                    label={t2("form.lastName")}
                    placeholder={t2("form.lastName")}
                    value={partner.formPartner.lastName}
                    onChangeText={(lastName) =>
                      partner.actions.setFormPartner({
                        ...partner.formPartner,
                        lastName,
                      })
                    }
                    maxLength={15}
                  />

                  <TextInput
                    style={Classes.formInput(colors)}
                    outlineStyle={{ borderRadius: 10 }}
                    mode="outlined"
                    label={t2("form.phoneNumber")}
                    placeholder={t2("form.phoneNumberPlaceholder")}
                    value={partner.formPartner.phoneNumber}
                    onChangeText={(phoneNumber) =>
                      partner.actions.setFormPartner({
                        ...partner.formPartner,
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
                    placeholder={t2("form.pinPlaceholder")}
                    value={partner.formPartner.pin}
                    onChangeText={(pin) =>
                      partner.actions.setFormPartner({
                        ...partner.formPartner,
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
                <View style={Classes.centeredLargeText(colors)}>
                  <Text
                    style={{
                      fontWeight: "bold",
                      textAlign: "left",
                      color: colors.primary,
                    }}
                    variant="titleMedium"
                  >
                    {t2("form.cabInfo")}
                  </Text>
                </View>
                <View>
                  <View
                    style={{
                      marginTop: 20,
                      marginBottom: 20,
                    }}
                  >
                    <View style={{ marginBottom: 10 }}>
                      <Text style={{ fontSize: 20 }}>{t2("form.cabType")}</Text>
                    </View>
                    <Picker
                      selectedValue={partner.formPartner?.cab?.cabTypeId}
                      onValueChange={(itemValue, itemIndex) =>
                        partner.actions.setFormPartner({
                          ...partner.formPartner,
                          cab: {
                            ...partner.formPartner.cab,
                            cabTypeId: itemValue,
                          },
                        })
                      }
                      // mode="dropdown"
                      style={{ backgroundColor: "lightgrey" }}
                    >
                      {app.cabTypes.map(({ description, _id }) => (
                        <Picker.Item
                          key={_id}
                          label={description[lang || "fr"]}
                          value={_id}
                        />
                      ))}
                    </Picker>
                  </View>
                  <TextInput
                    style={Classes.formInput(colors)}
                    outlineStyle={{ borderRadius: 10 }}
                    mode="outlined"
                    label={t2("form.cabModel")}
                    placeholder={t2("form.cabModelPlaceholder")}
                    value={partner.formPartner.cab.model}
                    onChangeText={(model) =>
                      partner.actions.setFormPartner({
                        ...partner.formPartner,
                        cab: {
                          ...partner.formPartner.cab,
                          model: model,
                        },
                      })
                    }
                    maxLength={20}
                  />

                  <TextInput
                    style={Classes.formInput(colors)}
                    outlineStyle={{ borderRadius: 10 }}
                    mode="outlined"
                    label={t2("form.licensePlate")}
                    placeholder={t2("form.licensePlatePlaceholder")}
                    value={partner.formPartner.cab.licensePlate}
                    onChangeText={(licensePlate) =>
                      partner.actions.setFormPartner({
                        ...partner.formPartner,
                        cab: {
                          ...partner.formPartner.cab,
                          licensePlate: licensePlate,
                        },
                      })
                    }
                    maxLength={8}
                  />

                  <View
                    style={{
                      ...Classes.centeredLargeText(colors),
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text style={{ fontSize: 18 }}>
                      {t2("form.vehicleOwner")}
                    </Text>
                    <Switch
                      value={partner.formPartner?.cab?.owner}
                      onValueChange={() => {
                        partner.actions.setFormPartner({
                          ...partner.formPartner,
                          cab: {
                            ...partner.formPartner.cab,
                            owner: !partner.formPartner.cab.owner,
                          },
                        });
                      }}
                    />
                  </View>
                </View>
              </>
            ) : (
              <View>
                <View
                  style={{
                    alignItems: "flex-start",
                    marginBottom: 10,
                  }}
                >
                  <Button
                    mode="contained"
                    onPress={() => setStep((step) => step - 1)}
                    labelStyle={Classes.backButtonLabel(colors)}
                  >
                    <Text
                      style={{
                        fontSize: 20,
                        textAlign: "center",
                        paddingRight: 50,
                        color: "#ffffff",
                      }}
                    >
                      {t2("form.back")}
                    </Text>
                  </Button>
                </View>
                <View>
                  <View
                    style={{
                      marginTop: 20,
                    }}
                  >
                    <View style={{ marginBottom: 10 }}>
                      <Text style={{ fontSize: 20, fontWeight: "bold" }}>
                        {t2("form.selectMunicipality")}
                      </Text>
                    </View>
                    <Picker
                      selectedValue={partner.formPartner?.municipality}
                      onValueChange={(itemValue, itemIndex) =>
                        partner.actions.setFormPartner({
                          ...partner.formPartner,
                          municipality: itemValue,
                        })
                      }
                      // mode="dropdown"
                      style={{ backgroundColor: "lightgrey" }}
                    >
                      {[
                        { label: "Dixin", value: "Dixin" },
                        { label: "Kaloum", value: "Kaloum" },
                        { label: "Matam", value: "Matam" },
                        { label: "Matoto", value: "Matoto" },
                        { label: "Ratoma", value: "Ratoma" },
                      ].map(({ label, value }) => (
                        <Picker.Item key={value} label={label} value={value} />
                      ))}
                    </Picker>
                  </View>

                  <View
                    style={{
                      marginTop: 20,
                    }}
                  >
                    <TextInput
                      style={Classes.formInput(colors)}
                      outlineStyle={{ borderRadius: 10 }}
                      mode="outlined"
                      label={t2("form.neighborhood")}
                      placeholder={t2("form.neighborhoodPlaceHolder")}
                      value={partner.formPartner.neighborhood}
                      onChangeText={(neighborhood) =>
                        partner.actions.setFormPartner({
                          ...partner.formPartner,
                          neighborhood,
                        })
                      }
                    />
                  </View>

                  <View style={{}}>
                    <TextInput
                      style={Classes.formInput(colors)}
                      outlineStyle={{ borderRadius: 10 }}
                      mode="outlined"
                      label={t2("form.base")}
                      placeholder={t2("form.basePlaceholder")}
                      value={partner.formPartner.base}
                      onChangeText={(base) =>
                        partner.actions.setFormPartner({
                          ...partner.formPartner,
                          base,
                        })
                      }
                    />
                  </View>
                </View>
              </View>
            )}
            <View>
              {partner.formError && (
                <Text style={Classes.errorText(colors)}>
                  {partner.formError}
                </Text>
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
              {step === 1 ? (
                <View style={{ alignItems: "center" }}>
                  <Button
                    mode="contained"
                    onPress={() => setStep((step) => step + 1)}
                    // style={[
                    //     Classes.nextButton(colors),
                    //     {
                    //         alignItems: "center",
                    //         justifyContent: "center"
                    //     }
                    // ]}
                    {...Classes.buttonContainer(colors)}
                    labelStyle={Classes.nextButtonLabel(colors)}
                  >
                    {t2("form.next")}
                  </Button>
                </View>
              ) : (
                <View style={{ alignItems: "center" }}>
                  <Button
                    mode="contained"
                    onPress={partner.actions.savePartner}
                    {...Classes.buttonContainer(colors)}
                    disabled={
                      !partner.formPartner.firstName ||
                      !partner.formPartner.lastName ||
                      !partner.formPartner.phoneNumber ||
                      !partner.formPartner.cab.model ||
                      !partner.formPartner.cab.licensePlate
                    }
                  >
                    {t2("form.start")}
                  </Button>
                </View>
              )}

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  marginTop: 30,
                }}
              >
                <Text
                  adjustsFontSizeToFit
                  style={{
                    fontSize: Platform.OS === "ios" ? 20 : 18,
                  }}
                >
                  {t2("form.alreadyHaveAccount")}
                </Text>
                <TouchableOpacity
                  style={{ marginLeft: 10 }}
                  onPress={() => navigation.navigate("Login")}
                >
                  <Text
                    adjustsFontSizeToFit
                    style={{
                      color: colors.accent,
                      fontSize: Platform.OS === "ios" ? 20 : 18,
                    }}
                  >
                    {t2("form.login")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
