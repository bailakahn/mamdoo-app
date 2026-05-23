import React, { useState, useRef, useEffect } from "react";
import {
  View,
  TextInput as RNTextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Keyboard,
  Linking,
  Switch,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme, Text } from "react-native-paper";
import { Picker } from "@react-native-picker/picker";
import Icon from "@expo/vector-icons/MaterialIcons";
import { t2, t, lang } from "_utils/lang";
import { usePartner, useApp } from "_hooks";
import { Button, LoadingV2 } from "_atoms";

export default function Register({ navigation }) {
  const { colors } = useTheme();
  const app = useApp();
  const partner = usePartner();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(1);
  const [hidePin, setHidePin] = useState(true);
  const [firstNameFocused, setFirstNameFocused] = useState(false);
  const [lastNameFocused, setLastNameFocused] = useState(false);
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [pinFocused, setPinFocused] = useState(false);
  const [modelFocused, setModelFocused] = useState(false);
  const [plateFocused, setPlateFocused] = useState(false);
  const [neighborhoodFocused, setNeighborhoodFocused] = useState(false);
  const [baseFocused, setBaseFocused] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const lastNameRef = useRef(null);
  const phoneRef = useRef(null);
  const pinRef = useRef(null);
  const modelRef = useRef(null);
  const plateRef = useRef(null);
  const neighborhoodRef = useRef(null);
  const baseRef = useRef(null);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const show = Keyboard.addListener(showEvent, () => setKeyboardVisible(true));
    const hide = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false));
    return () => { show.remove(); hide.remove(); };
  }, []);

  if (partner.isLoading) return <LoadingV2 />;

  const canProceed =
    partner.formPartner.firstName &&
    partner.formPartner.lastName &&
    partner.formPartner.phoneNumber &&
    partner.formPartner.pin &&
    partner.formPartner.cab.model &&
    partner.formPartner.cab.licensePlate;

  const canSubmit = canProceed && partner.formPartner.municipality;

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={["top"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {step === 1 ? (
            <>
              <Text style={[styles.title, { color: colors.text }]}>{t2("form.registerHeader")}</Text>
              <Text style={styles.subtitle}>{t2("form.registerSubtitle")}</Text>

              <Text style={[styles.sectionLabel, { color: colors.primary }]}>
                {t2("form.personalInfo")}
              </Text>

              {/* First name */}
              <View style={[styles.inputWrap, { borderColor: firstNameFocused ? colors.primary : "#D1D5DB", borderWidth: firstNameFocused ? 2 : 1 }]}>
                <RNTextInput
                  style={[styles.inputField, { color: colors.text }]}
                  placeholder={t2("form.firstName")}
                  placeholderTextColor="#9CA3AF"
                  value={partner.formPartner.firstName}
                  onChangeText={(firstName) => partner.actions.setFormPartner({ ...partner.formPartner, firstName })}
                  onFocus={() => setFirstNameFocused(true)}
                  onBlur={() => setFirstNameFocused(false)}
                  maxLength={15}
                  returnKeyType="next"
                  onSubmitEditing={() => lastNameRef.current?.focus()}
                />
              </View>

              {/* Last name */}
              <View style={[styles.inputWrap, { borderColor: lastNameFocused ? colors.primary : "#D1D5DB", borderWidth: lastNameFocused ? 2 : 1 }]}>
                <RNTextInput
                  ref={lastNameRef}
                  style={[styles.inputField, { color: colors.text }]}
                  placeholder={t2("form.lastName")}
                  placeholderTextColor="#9CA3AF"
                  value={partner.formPartner.lastName}
                  onChangeText={(lastName) => partner.actions.setFormPartner({ ...partner.formPartner, lastName })}
                  onFocus={() => setLastNameFocused(true)}
                  onBlur={() => setLastNameFocused(false)}
                  maxLength={15}
                  returnKeyType="next"
                  onSubmitEditing={() => phoneRef.current?.focus()}
                />
              </View>

              {/* Phone */}
              <View style={[styles.inputWrap, { borderColor: phoneFocused ? colors.primary : "#D1D5DB", borderWidth: phoneFocused ? 2 : 1 }]}>
                <Text style={[styles.phonePrefix, { color: colors.text }]}>+224</Text>
                <View style={styles.phoneDivider} />
                <RNTextInput
                  ref={phoneRef}
                  style={[styles.inputField, { color: colors.text }]}
                  placeholder={t2("form.phoneNumberPlaceholder")}
                  placeholderTextColor="#9CA3AF"
                  value={partner.formPartner.phoneNumber}
                  onChangeText={(phoneNumber) => {
                    partner.actions.setFormPartner({ ...partner.formPartner, phoneNumber });
                    if (phoneNumber.length === 9) pinRef.current?.focus();
                  }}
                  onFocus={() => setPhoneFocused(true)}
                  onBlur={() => setPhoneFocused(false)}
                  maxLength={9}
                  keyboardType="number-pad"
                  returnKeyType="next"
                  onSubmitEditing={() => pinRef.current?.focus()}
                />
              </View>

              {/* PIN */}
              <View style={[styles.inputWrap, { borderColor: pinFocused ? colors.primary : "#D1D5DB", borderWidth: pinFocused ? 2 : 1 }]}>
                <RNTextInput
                  ref={pinRef}
                  style={[styles.inputField, { color: colors.text, paddingLeft: 16 }]}
                  placeholder={t2("form.pin")}
                  placeholderTextColor="#9CA3AF"
                  value={partner.formPartner.pin}
                  onChangeText={(pin) => {
                    partner.actions.setFormPartner({ ...partner.formPartner, pin });
                    if (pin.length === 4) Keyboard.dismiss();
                  }}
                  onFocus={() => setPinFocused(true)}
                  onBlur={() => setPinFocused(false)}
                  maxLength={4}
                  keyboardType="number-pad"
                  returnKeyType="done"
                  secureTextEntry={hidePin}
                />
                <TouchableOpacity
                  onPress={() => setHidePin(!hidePin)}
                  style={styles.eyeBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Icon name={hidePin ? "visibility-off" : "visibility"} size={22} color={colors.primary} />
                </TouchableOpacity>
              </View>

              <Text style={[styles.sectionLabel, { color: colors.primary, marginTop: 8 }]}>
                {t2("form.cabInfo")}
              </Text>

              {/* Cab type */}
              <View style={[styles.pickerWrap, { borderColor: "#D1D5DB" }]}>
                <Text style={[styles.pickerLabel, { color: "#9CA3AF" }]}>{t2("form.cabType")}</Text>
                <Picker
                  selectedValue={partner.formPartner?.cab?.cabTypeId}
                  onValueChange={(itemValue) =>
                    partner.actions.setFormPartner({
                      ...partner.formPartner,
                      cab: { ...partner.formPartner.cab, cabTypeId: itemValue },
                    })
                  }
                  style={{ color: colors.text }}
                  dropdownIconColor={colors.primary}
                >
                  {app.cabTypes.map(({ description, _id }) => (
                    <Picker.Item key={_id} label={description[lang || "fr"]} value={_id} />
                  ))}
                </Picker>
              </View>

              {/* Cab model */}
              <View style={[styles.inputWrap, { borderColor: modelFocused ? colors.primary : "#D1D5DB", borderWidth: modelFocused ? 2 : 1 }]}>
                <RNTextInput
                  ref={modelRef}
                  style={[styles.inputField, { color: colors.text }]}
                  placeholder={t2("form.cabModelPlaceholder")}
                  placeholderTextColor="#9CA3AF"
                  value={partner.formPartner.cab.model}
                  onChangeText={(model) =>
                    partner.actions.setFormPartner({
                      ...partner.formPartner,
                      cab: { ...partner.formPartner.cab, model },
                    })
                  }
                  onFocus={() => setModelFocused(true)}
                  onBlur={() => setModelFocused(false)}
                  maxLength={20}
                  returnKeyType="next"
                  onSubmitEditing={() => plateRef.current?.focus()}
                />
              </View>

              {/* License plate */}
              <View style={[styles.inputWrap, { borderColor: plateFocused ? colors.primary : "#D1D5DB", borderWidth: plateFocused ? 2 : 1 }]}>
                <RNTextInput
                  ref={plateRef}
                  style={[styles.inputField, { color: colors.text }]}
                  placeholder={t2("form.licensePlatePlaceholder")}
                  placeholderTextColor="#9CA3AF"
                  value={partner.formPartner.cab.licensePlate}
                  onChangeText={(licensePlate) =>
                    partner.actions.setFormPartner({
                      ...partner.formPartner,
                      cab: { ...partner.formPartner.cab, licensePlate },
                    })
                  }
                  onFocus={() => setPlateFocused(true)}
                  onBlur={() => setPlateFocused(false)}
                  maxLength={8}
                  returnKeyType="done"
                />
              </View>

              {/* Vehicle owner toggle */}
              <View style={[styles.ownerRow, { borderColor: "#D1D5DB" }]}>
                <Text style={[styles.ownerLabel, { color: colors.text }]}>{t2("form.vehicleOwner")}</Text>
                <Switch
                  value={partner.formPartner?.cab?.owner}
                  onValueChange={() =>
                    partner.actions.setFormPartner({
                      ...partner.formPartner,
                      cab: { ...partner.formPartner.cab, owner: !partner.formPartner.cab.owner },
                    })
                  }
                  trackColor={{ false: "#E5E7EB", true: colors.primary }}
                  thumbColor="#fff"
                />
              </View>

              {partner.formError ? (
                <Text style={[styles.errorText, { color: colors.error }]}>{partner.formError}</Text>
              ) : null}
            </>
          ) : (
            <>
              <TouchableOpacity
                onPress={() => setStep(1)}
                style={styles.backBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Icon name="arrow-back" size={24} color={colors.text} />
              </TouchableOpacity>

              <Text style={[styles.title, { color: colors.text }]}>{t2("form.selectMunicipality")}</Text>
              <Text style={styles.subtitle}>{t2("form.registerSubtitle")}</Text>

              {/* Municipality */}
              <View style={[styles.pickerWrap, { borderColor: "#D1D5DB" }]}>
                <Text style={[styles.pickerLabel, { color: "#9CA3AF" }]}>{t2("form.selectMunicipality")}</Text>
                <Picker
                  selectedValue={partner.formPartner?.municipality}
                  onValueChange={(itemValue) =>
                    partner.actions.setFormPartner({ ...partner.formPartner, municipality: itemValue })
                  }
                  style={{ color: colors.text }}
                  dropdownIconColor={colors.primary}
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

              {/* Neighborhood */}
              <View style={[styles.inputWrap, { borderColor: neighborhoodFocused ? colors.primary : "#D1D5DB", borderWidth: neighborhoodFocused ? 2 : 1 }]}>
                <RNTextInput
                  ref={neighborhoodRef}
                  style={[styles.inputField, { color: colors.text }]}
                  placeholder={t2("form.neighborhoodPlaceHolder")}
                  placeholderTextColor="#9CA3AF"
                  value={partner.formPartner.neighborhood}
                  onChangeText={(neighborhood) =>
                    partner.actions.setFormPartner({ ...partner.formPartner, neighborhood })
                  }
                  onFocus={() => setNeighborhoodFocused(true)}
                  onBlur={() => setNeighborhoodFocused(false)}
                  returnKeyType="next"
                  onSubmitEditing={() => baseRef.current?.focus()}
                />
              </View>

              {/* Base */}
              <View style={[styles.inputWrap, { borderColor: baseFocused ? colors.primary : "#D1D5DB", borderWidth: baseFocused ? 2 : 1 }]}>
                <RNTextInput
                  ref={baseRef}
                  style={[styles.inputField, { color: colors.text }]}
                  placeholder={t2("form.basePlaceholder")}
                  placeholderTextColor="#9CA3AF"
                  value={partner.formPartner.base}
                  onChangeText={(base) =>
                    partner.actions.setFormPartner({ ...partner.formPartner, base })
                  }
                  onFocus={() => setBaseFocused(true)}
                  onBlur={() => setBaseFocused(false)}
                  returnKeyType="done"
                />
              </View>

              {partner.formError ? (
                <Text style={[styles.errorText, { color: colors.error }]}>{partner.formError}</Text>
              ) : null}
            </>
          )}
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: keyboardVisible ? 20 : Math.max(insets.bottom + 16, 24) }]}>
          <Text style={styles.privacy}>
            <Text style={{ color: "#9CA3AF" }}>{t("main.privacyPolicyText")} </Text>
            <Text
              style={[styles.privacyLink, { color: colors.primary }]}
              onPress={() => Linking.openURL("https://www.mamdoo.app/fr/policy")}
            >
              {t("main.privacyPolicyLink")}
            </Text>
          </Text>

          {step === 1 ? (
            <Button
              mode="contained"
              onPress={() => setStep(2)}
              disabled={!canProceed}
              style={styles.btn}
              contentStyle={styles.btnContent}
            >
              {t2("form.next")}
            </Button>
          ) : (
            <Button
              mode="contained"
              onPress={partner.actions.savePartner}
              disabled={!canSubmit}
              style={styles.btn}
              contentStyle={styles.btnContent}
            >
              {t2("form.start")}
            </Button>
          )}

          <View style={styles.switchRow}>
            <Text style={[styles.switchText, { color: colors.text }]}>
              {t2("form.alreadyHaveAccount")}
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("Login")}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={[styles.switchLink, { color: colors.primary }]}>
                {t2("form.login")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { paddingHorizontal: 24, paddingTop: 40, paddingBottom: 24 },

  title: { fontSize: 28, fontWeight: "700", marginBottom: 4 },
  subtitle: { fontSize: 15, color: "#9CA3AF", marginBottom: 20 },

  sectionLabel: { fontSize: 13, fontWeight: "700", marginBottom: 14 },

  backBtn: { width: 40, height: 40, justifyContent: "center", marginBottom: 16 },

  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    height: 56,
    marginBottom: 16,
  },
  phonePrefix: { paddingHorizontal: 16, fontSize: 15, fontWeight: "600" },
  phoneDivider: { width: 1, height: 32, backgroundColor: "#E5E7EB" },
  inputField: { flex: 1, paddingHorizontal: 16, fontSize: 16 },
  eyeBtn: { paddingHorizontal: 14 },

  pickerWrap: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  pickerLabel: { fontSize: 12, marginTop: 8 },

  ownerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 16,
  },
  ownerLabel: { fontSize: 15 },

  errorText: { fontSize: 14, marginTop: 4 },

  footer: { paddingHorizontal: 24, paddingTop: 12 },
  btn: { borderRadius: 14, marginTop: 4 },
  btnContent: { height: 56 },

  privacy: { textAlign: "center", fontSize: 12, marginBottom: 12, lineHeight: 18 },
  privacyLink: { fontWeight: "600" },

  switchRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
    marginTop: 12,
  },
  switchText: { fontSize: 14 },
  switchLink: { fontSize: 14, fontWeight: "700" },
});
