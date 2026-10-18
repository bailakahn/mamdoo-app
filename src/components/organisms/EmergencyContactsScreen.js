import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Text, useTheme, TextInput } from "react-native-paper";
import Icon from "@expo/vector-icons/MaterialIcons";
import { useApi } from "_api";
import { Button } from "_atoms";
import { t2 } from "_utils/lang";

const MAX_CONTACTS = 3;
const blank = () => ({ name: "", phoneNumber: "", relationship: "" });

// Built once for both products, exactly like SosButton — the screen SosButton's
// own "no contacts saved" state points back to. Same reason it lives in
// _organisms rather than under either role's scenes tree: it is registered as a
// screen in both the client and the carpool driver navigators, not owned by
// either. app/auth resolves "rider" vs "driver" from the same header either
// surface already sends, so no role prop is needed here.
export default function EmergencyContactsScreen({ navigation }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const getRequest = useApi();

  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getRequest({ method: "GET", endpoint: "carpool/getEmergencyContacts" })
      .then((result) => {
        if (result?.success && result.contacts.length) {
          setContacts(
            result.contacts.map((c) => ({
              name: c.name,
              phoneNumber: c.phoneNumber,
              relationship: c.relationship || "",
            }))
          );
        } else {
          setContacts([blank()]);
        }
      })
      .catch(() => setContacts([blank()]))
      .finally(() => setLoading(false));
  }, []);

  const update = (index, patch) =>
    setContacts((cs) => cs.map((c, i) => (i === index ? { ...c, ...patch } : c)));

  const addContact = () =>
    setContacts((cs) => (cs.length < MAX_CONTACTS ? [...cs, blank()] : cs));

  const removeContact = (index) =>
    setContacts((cs) => cs.filter((_, i) => i !== index));

  // Every row must be either fully filled in or fully empty (and empty rows are
  // dropped before saving) — a half-filled contact with no phone number is not
  // something an SOS could ever reach anyway.
  const nonEmpty = contacts.filter((c) => c.name.trim() || c.phoneNumber.trim());
  const canSave = nonEmpty.every(
    (c) => c.name.trim().length > 0 && /^\d{9}$/.test(c.phoneNumber.trim())
  );

  const onSave = async () => {
    setSaving(true);
    const result = await getRequest({
      method: "POST",
      endpoint: "carpool/saveEmergencyContacts",
      params: {
        contacts: nonEmpty.map((c) => ({
          name: c.name.trim(),
          phoneNumber: c.phoneNumber.trim(),
          relationship: c.relationship.trim() || undefined,
        })),
      },
    }).catch(() => null);
    setSaving(false);
    if (result?.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t2("emergencyContacts.title")}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[styles.body, { paddingBottom: Math.max(insets.bottom + 24, 32) }]}
        >
          <Text style={[styles.subtitle, { color: colors.placeholder }]}>
            {t2("emergencyContacts.subtitle")}
          </Text>

          {loading ? null : (
            <>
              {contacts.map((contact, index) => (
                <View
                  key={index}
                  style={[styles.card, { borderColor: colors.border }]}
                >
                  <View style={styles.cardHeader}>
                    <Text style={[styles.cardLabel, { color: colors.placeholder }]}>
                      {t2("emergencyContacts.contactNumber", { number: index + 1 })}
                    </Text>
                    {contacts.length > 1 && (
                      <TouchableOpacity
                        onPress={() => removeContact(index)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Icon name="close" size={20} color={colors.placeholder} />
                      </TouchableOpacity>
                    )}
                  </View>

                  <TextInput
                    mode="outlined"
                    label={t2("emergencyContacts.name")}
                    value={contact.name}
                    onChangeText={(v) => update(index, { name: v })}
                    style={styles.input}
                  />
                  <TextInput
                    mode="outlined"
                    label={t2("emergencyContacts.phoneNumber")}
                    value={contact.phoneNumber}
                    onChangeText={(v) => update(index, { phoneNumber: v.replace(/\D/g, "") })}
                    keyboardType="phone-pad"
                    maxLength={9}
                    style={styles.input}
                  />
                  <TextInput
                    mode="outlined"
                    label={t2("emergencyContacts.relationship")}
                    value={contact.relationship}
                    onChangeText={(v) => update(index, { relationship: v })}
                    style={styles.input}
                  />
                </View>
              ))}

              {contacts.length < MAX_CONTACTS && (
                <TouchableOpacity onPress={addContact} style={styles.addRow}>
                  <Icon name="add-circle-outline" size={22} color={colors.primary} />
                  <Text style={[styles.addText, { color: colors.primary }]}>
                    {t2("emergencyContacts.addAnother")}
                  </Text>
                </TouchableOpacity>
              )}

              {!!saved && (
                <Text style={[styles.savedText, { color: colors.primary }]}>
                  {t2("emergencyContacts.saved")}
                </Text>
              )}

              <Button
                mode="contained"
                onPress={onSave}
                disabled={!canSave || saving}
                loading={saving}
                style={styles.saveButton}
                contentStyle={styles.saveContent}
              >
                {t2("emergencyContacts.save")}
              </Button>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerTitle: { fontSize: 16, fontWeight: "700" },
  body: { paddingHorizontal: 20 },
  subtitle: { fontSize: 14, lineHeight: 20, marginBottom: 20 },
  card: { borderWidth: 1, borderRadius: 14, padding: 16, marginBottom: 16 },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  input: { marginBottom: 10 },
  addRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 20 },
  addText: { fontSize: 15, fontWeight: "600" },
  savedText: { fontSize: 14, fontWeight: "600", textAlign: "center", marginBottom: 12 },
  saveButton: { borderRadius: 14 },
  saveContent: { height: 54 },
});
