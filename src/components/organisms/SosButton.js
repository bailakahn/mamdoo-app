import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Text, useTheme, Portal, Modal } from "react-native-paper";
import Icon from "@expo/vector-icons/MaterialIcons";
import { useApi } from "_api";
import { t2 } from "_utils/lang";

// SOS, built once for both products.
//
// The design follows from the situation it is used in: somebody frightened, in a
// moving car, possibly being watched. So —
//
//   * The trigger is a small persistent button, not a big red panic slab. It must
//     be reachable without announcing to the car that it is being pressed.
//   * Pressing it opens a sheet rather than firing immediately: an accidental
//     brush must not call the police, and a real emergency is two taps, not one.
//   * The alert is filed with the server FIRST, then the sheet offers calling and
//     messaging. Even if the person never gets to tap anything else, ops has the
//     alert, the location and the trip details.
//   * Contacts are messaged from the user's OWN phone via an sms: link. It works
//     with no data connection, and it arrives from a number the recipient
//     recognises and will actually answer.
export default function SosButton({ context = "carpool", tripId = null, bookingId = null, location = null, compact = false }) {
  const { colors } = useTheme();
  const getRequest = useApi();

  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [alert, setAlert] = useState(null);

  const raise = async () => {
    setOpen(true);
    setBusy(true);

    const result = await getRequest({
      method: "POST",
      endpoint: "carpool/raiseSos",
      params: {
        tripId,
        bookingId,
        coordinates: location ? [location.longitude, location.latitude] : null,
        accuracy: location?.accuracy ?? null,
      },
    }).catch(() => null);

    setBusy(false);
    // Even if filing failed, the sheet still opens: the call buttons are the part
    // that matters most and they need no server at all.
    setAlert(result || { failed: true });
  };

  const dial = (number) => {
    if (!number) return;
    Linking.openURL(`tel://${number}`).catch(() => {});
  };

  // One SMS addressed to every contact at once, pre-filled with what a person
  // receiving it actually needs: who, which car, and where.
  const messageContacts = () => {
    const contacts = alert?.contacts || [];
    if (!contacts.length) return;

    const snapshot = alert?.snapshot || {};
    const parts = [
      t2("sos.smsIntro", { name: snapshot.raisedByName || "" }),
      snapshot.carDescription && `${snapshot.carDescription} (${snapshot.plate || "?"})`,
      snapshot.driverName && t2("sos.smsDriver", { name: snapshot.driverName }),
      snapshot.routeSummary,
      location &&
        `https://maps.google.com/?q=${location.latitude},${location.longitude}`,
    ].filter(Boolean);

    const numbers = contacts.map((c) => c.phoneNumber).join(",");
    const separator = Platform.OS === "ios" ? "&" : "?";
    Linking.openURL(
      `sms:${numbers}${separator}body=${encodeURIComponent(parts.join("\n"))}`
    ).catch(() => {});
  };

  return (
    <>
      <TouchableOpacity
        onPress={raise}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={t2("sos.buttonLabel")}
        style={[styles.trigger, compact && styles.triggerCompact]}
      >
        <Icon name="shield" size={compact ? 18 : 20} color="#fff" />
        {!compact && <Text style={styles.triggerText}>{t2("sos.button")}</Text>}
      </TouchableOpacity>

      <Portal>
        <Modal
          visible={open}
          onDismiss={() => setOpen(false)}
          contentContainerStyle={[styles.sheet, { backgroundColor: colors.background }]}
        >
          <View style={styles.sheetHeader}>
            <Icon name="shield" size={26} color="#B3261E" />
            <Text style={[styles.sheetTitle, { color: colors.text }]}>
              {t2("sos.title")}
            </Text>
          </View>

          {busy ? (
            <View style={styles.busy}>
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.busyText}>{t2("sos.sending")}</Text>
            </View>
          ) : (
            <Text style={styles.status}>
              {alert?.failed ? t2("sos.filedOffline") : t2("sos.filed")}
            </Text>
          )}

          <TouchableOpacity
            style={[styles.action, styles.police]}
            onPress={() => dial(alert?.police || "117")}
            accessibilityRole="button"
          >
            <Icon name="local-police" size={24} color="#fff" />
            <Text style={styles.actionText}>
              {t2("sos.callPolice", { number: alert?.police || "117" })}
            </Text>
          </TouchableOpacity>

          {/* Hidden rather than shown dialling nothing when no hotline is set. */}
          {!!alert?.hotline && (
            <TouchableOpacity
              style={[styles.action, { backgroundColor: colors.primary }]}
              onPress={() => dial(alert.hotline)}
              accessibilityRole="button"
            >
              <Icon name="support-agent" size={24} color="#fff" />
              <Text style={styles.actionText}>{t2("sos.callMamdoo")}</Text>
            </TouchableOpacity>
          )}

          {alert?.contacts?.length ? (
            <TouchableOpacity
              style={[styles.action, styles.contacts]}
              onPress={messageContacts}
              accessibilityRole="button"
            >
              <Icon name="message" size={24} color="#fff" />
              <Text style={styles.actionText}>
                {t2("sos.messageContacts", { count: alert.contacts.length })}
              </Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.noContacts}>{t2("sos.noContacts")}</Text>
          )}

          <TouchableOpacity
            onPress={() => setOpen(false)}
            style={styles.close}
            accessibilityRole="button"
          >
            <Text style={[styles.closeText, { color: colors.text }]}>
              {t2("sos.close")}
            </Text>
          </TouchableOpacity>
        </Modal>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#B3261E",
    borderRadius: 22,
    paddingHorizontal: 16,
    height: 44,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  triggerCompact: { width: 44, paddingHorizontal: 0, borderRadius: 22 },
  triggerText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  sheet: { margin: 20, borderRadius: 16, padding: 22 },
  sheetHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  sheetTitle: { fontSize: 20, fontWeight: "700" },
  busy: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 18 },
  busyText: { fontSize: 15, color: "#6B7280" },
  status: { fontSize: 15, color: "#374151", marginBottom: 18, lineHeight: 21 },
  action: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 12,
    height: 58,
    marginBottom: 12,
  },
  police: { backgroundColor: "#B3261E" },
  contacts: { backgroundColor: "#374151" },
  actionText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  noContacts: { fontSize: 14, color: "#6B7280", textAlign: "center", marginBottom: 12, lineHeight: 20 },
  close: { alignItems: "center", paddingVertical: 12 },
  closeText: { fontSize: 16, fontWeight: "600" },
});
