import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import { useTheme, Text } from "react-native-paper";
import Icon from "@expo/vector-icons/MaterialIcons";
import { t } from "_utils/lang";
import { useApp, useTheme as useMamdooTheme } from "_hooks";
import { darkMapStyle } from "_styles/mapStyles";

const CONAKRY = {
  latitude: 9.5375,
  longitude: -13.6773,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

export default function Main() {
  const { colors } = useTheme();
  const mamdooTheme = useMamdooTheme();
  const app = useApp();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1 }}>
      {/* Map background — Conakry, static */}
      <MapView
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_GOOGLE}
        initialRegion={CONAKRY}
        scrollEnabled={false}
        zoomEnabled={false}
        pitchEnabled={false}
        rotateEnabled={false}
        customMapStyle={mamdooTheme.isDarkMode ? darkMapStyle : []}
      />

      {/* Overlay gradient */}
      <View style={[StyleSheet.absoluteFill, styles.overlay]} />

      {/* Top area — empty, map shows through, safe area respected */}
      <View style={{ flex: 1 }} />

      {/* Bottom card */}
      <View style={[styles.card, { backgroundColor: colors.background, paddingBottom: Math.max(insets.bottom + 16, 32) }]}>
        <View style={styles.handle} />

        <Text style={[styles.cardTitle, { color: colors.text }]}>
          {t("main.howDoYouWantToTravel")}
        </Text>

        {/* Passenger */}
        <TouchableOpacity
          onPress={() => app.actions.setApp("client")}
          style={[styles.roleCard, { borderColor: colors.primary }]}
          activeOpacity={0.75}
        >
          <View style={[styles.roleIcon, { backgroundColor: colors.primary + "18" }]}>
            <Icon name="person" size={26} color={colors.primary} />
          </View>
          <View style={styles.roleText}>
            <Text style={[styles.roleTitle, { color: colors.text }]}>
              {t("main.iAmAClient")}
            </Text>
            <Text style={[styles.roleSubtitle, { color: colors.placeholder }]}>
              {t("main.clientSubtitle")}
            </Text>
          </View>
          <Icon name="chevron-right" size={22} color={colors.placeholder} />
        </TouchableOpacity>

        {/* Driver */}
        <TouchableOpacity
          onPress={() => app.actions.setApp("partner")}
          style={[styles.roleCard, { borderColor: colors.surfaceVariant ?? colors.border, marginTop: 12 }]}
          activeOpacity={0.75}
        >
          <View style={[styles.roleIcon, { backgroundColor: colors.surfaceVariant ?? colors.overlap }]}>
            <Icon name="directions-car" size={26} color={colors.placeholder} />
          </View>
          <View style={styles.roleText}>
            <Text style={[styles.roleTitle, { color: colors.text }]}>
              {t("main.iAmAPartner")}
            </Text>
            <Text style={[styles.roleSubtitle, { color: colors.placeholder }]}>
              {t("main.partnerSubtitle")}
            </Text>
          </View>
          <Icon name="chevron-right" size={22} color={colors.placeholder} />
        </TouchableOpacity>

        {/* Covoiturage driver — a third, independent surface, not a mode inside
            the ride driver app. Absent entirely while the feature is off, same
            as the drawer entry point it replaces. */}
        {!!app.settings?.carpoolEnabled && (
          <TouchableOpacity
            onPress={() => app.actions.setApp("carpool")}
            style={[styles.roleCard, { borderColor: colors.surfaceVariant ?? colors.border, marginTop: 12 }]}
            activeOpacity={0.75}
          >
            <View style={[styles.roleIcon, { backgroundColor: colors.surfaceVariant ?? colors.overlap }]}>
              <Icon name="people" size={26} color={colors.placeholder} />
            </View>
            <View style={styles.roleText}>
              <Text style={[styles.roleTitle, { color: colors.text }]}>
                {t("main.iAmACarpoolDriver")}
              </Text>
              <Text style={[styles.roleSubtitle, { color: colors.placeholder }]}>
                {t("main.carpoolDriverSubtitle")}
              </Text>
            </View>
            <Icon name="chevron-right" size={22} color={colors.placeholder} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: "rgba(0,0,0,0.32)",
  },
  card: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 14,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#e0e0e0",
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: "700",
    marginBottom: 18,
    textAlign: "center",
  },
  roleCard: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 16,
  },
  roleIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  roleText: { flex: 1 },
  roleTitle: { fontSize: 15, fontWeight: "600" },
  roleSubtitle: { fontSize: 13, marginTop: 3 },
});
