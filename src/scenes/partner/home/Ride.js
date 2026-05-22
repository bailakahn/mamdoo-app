import React, { useState } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme, Text, Modal, Portal, Divider } from "react-native-paper";
import Icon from "@expo/vector-icons/MaterialIcons";
import { t2 } from "_utils/lang";
import { useRide } from "_hooks/partner";
import { Button, LoadingV2 } from "_atoms";

// Strings the client app uses when pickup = current GPS position
const GENERIC_PICKUP_LABELS = ["votre position", "your location"];

export default function DriverOnTheWayScene() {
  const { colors } = useTheme();
  const ride = useRide();
  const insets = useSafeAreaInsets();

  const [cancelVisible, setCancelVisible] = useState(false);
  const [endRideVisible, setEndRideVisible] = useState(false);

  if (!ride.request) return null;
  if (ride.isLoading) return <LoadingV2 />;

  const { client, dropOff, pickUp } = ride.request;
  const isArrived = ride.driverArrived;
  const clientInitials =
    `${client.firstName.charAt(0)}${client.lastName.charAt(0)}`.toUpperCase();

  // Hide pickup address when it's just a GPS label with no useful place name
  const isGenericPickup = GENERIC_PICKUP_LABELS.some(
    (label) => pickUp?.text?.toLowerCase().trim() === label
  );
  const destinationText = isArrived
    ? dropOff?.text || null
    : isGenericPickup ? null : pickUp?.text || null;

  // Client stats from acceptRequest response (merged into client object)
  const clientRideCount = client.rideCount ?? null;
  const clientAvgRating = client.avgRating ?? null;
  const isNewClient = clientRideCount === 0;

  const bottomPadding = Math.max(insets.bottom + 12, 24);
  const modalContentStyle = {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: bottomPadding,
  };

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      {/* ── Modals ─────────────────────────────────────────────────────────── */}
      <Portal>
        {/* Cancel confirmation */}
        <Modal
          visible={cancelVisible}
          onDismiss={() => setCancelVisible(false)}
          style={{ justifyContent: "flex-end" }}
          contentContainerStyle={modalContentStyle}
        >
          <View style={styles.handle} />
          <View style={styles.modalBody}>
            <View style={[styles.modalIcon, { backgroundColor: "#FEE2E2" }]}>
              <Icon name="warning" size={32} color={colors.error} />
            </View>
            <Text variant="titleLarge" style={[styles.modalTitle, { color: colors.text }]}>
              {t2("ride.cancelConfirmTitle")}
            </Text>
            <Text style={styles.modalSubtitle}>{t2("ride.canceConfirmContent")}</Text>
            <View style={styles.modalButtons}>
              <Button
                mode="contained"
                buttonColor={colors.error}
                onPress={() => { setCancelVisible(false); ride.actions.cancelRide(); }}
                style={styles.modalBtn}
                contentStyle={styles.modalBtnContent}
                icon="close"
              >
                {t2("ride.cancelConfirmOk")}
              </Button>
              <Button
                mode="outlined"
                onPress={() => setCancelVisible(false)}
                style={[styles.modalBtn, { borderColor: colors.primary }]}
                contentStyle={styles.modalBtnContent}
              >
                {t2("ride.cancelConfirmCancel")}
              </Button>
            </View>
          </View>
        </Modal>

        {/* End ride confirmation */}
        <Modal
          visible={endRideVisible}
          onDismiss={() => setEndRideVisible(false)}
          style={{ justifyContent: "flex-end" }}
          contentContainerStyle={modalContentStyle}
        >
          <View style={styles.handle} />
          <View style={styles.modalBody}>
            <View style={[styles.modalIcon, { backgroundColor: colors.primary + "22" }]}>
              <Icon name="flag" size={32} color={colors.primary} />
            </View>
            <Text variant="titleLarge" style={[styles.modalTitle, { color: colors.text }]}>
              {t2("ride.endConfirmTitle")}
            </Text>
            <Text style={styles.modalSubtitle}>{t2("ride.endConfirmContent")}</Text>
            <View style={styles.modalButtons}>
              <Button
                mode="contained"
                onPress={() => { setEndRideVisible(false); ride.actions.onEndRide(); }}
                style={styles.modalBtn}
                contentStyle={styles.modalBtnContent}
                icon="check"
              >
                {t2("ride.endConfirmOk")}
              </Button>
              <Button
                mode="outlined"
                onPress={() => setEndRideVisible(false)}
                style={[styles.modalBtn, { borderColor: colors.error }]}
                contentStyle={styles.modalBtnContent}
                textColor={colors.error}
                icon="close"
              >
                {t2("ride.endConfirmCancel")}
              </Button>
            </View>
          </View>
        </Modal>
      </Portal>

      {/* ── Screen body — content only, footer is separate ───────────────── */}
      <View style={styles.body}>

        {/* Phase strip */}
        <View style={styles.phaseStrip}>
          <Text style={styles.phaseLabel}>
            {isArrived ? t2("ride.ongoingRide") : t2("ride.enRoute")}
          </Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressDot, { backgroundColor: colors.primary }]} />
            <View style={[
              styles.progressLine,
              { backgroundColor: isArrived ? colors.primary : colors.surfaceVariant ?? "#E5E7EB" },
            ]} />
            <View style={[
              styles.progressDot,
              isArrived
                ? { backgroundColor: colors.primary }
                : { backgroundColor: "transparent", borderWidth: 2, borderColor: colors.primary },
            ]} />
          </View>
        </View>

        {/* Client card */}
        <View style={[styles.clientCard, { backgroundColor: colors.primary + "18" }]}>

          {/* Top row: avatar | all client info stacked */}
          <View style={styles.clientRow}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>{clientInitials}</Text>
            </View>

            <View style={styles.clientMeta}>
              {/* Name + arrived badge on same line — name truncates before badge */}
              <View style={styles.nameRow}>
                <Text
                  variant="titleMedium"
                  style={{ fontWeight: "bold", color: colors.text, flex: 1 }}
                  numberOfLines={1}
                >
                  {`${client.firstName} ${client.lastName}`}
                </Text>
                {isArrived && (
                  <View style={[styles.arrivedBadge, { backgroundColor: colors.primary }]}>
                    <Icon name="check" size={13} color="#fff" />
                  </View>
                )}
              </View>

              {/* Phone (left) + Stats (right) on the same row */}
              <View style={styles.phoneStatsRow}>
                <View style={styles.infoRow}>
                  <Icon name="phone" size={13} color="#9CA3AF" />
                  <Text style={styles.metaText}>{client.phoneNumber}</Text>
                </View>

                {(clientAvgRating != null || clientRideCount != null) && (
                  <View style={styles.infoRow}>
                    {clientAvgRating != null && (
                      <>
                        <Icon name="star" size={13} color="#F59E0B" />
                        <Text style={[styles.metaText, { color: "#F59E0B", fontWeight: "700", marginRight: 6 }]}>
                          {clientAvgRating}
                        </Text>
                      </>
                    )}
                    {clientRideCount != null && (
                      <>
                        <Icon name="directions-car" size={13} color={isNewClient ? colors.primary : "#9CA3AF"} />
                        <Text style={[styles.metaText, isNewClient && { color: colors.primary, fontWeight: "600" }]}>
                          {isNewClient ? t2("ride.newClient") : String(clientRideCount)}
                        </Text>
                      </>
                    )}
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Destination row — only when address is meaningful */}
          {destinationText ? (
            <View style={[
              styles.destinationRow,
              { borderTopColor: colors.surfaceVariant ?? "#E5E7EB" },
            ]}>
              <View style={[
                styles.destinationDot,
                { backgroundColor: isArrived ? colors.error : colors.primary },
              ]} />
              <Text
                style={[styles.destinationText, { color: colors.text }]}
                numberOfLines={2}
              >
                {destinationText}
              </Text>
            </View>
          ) : null}

          {/* "Client on his way" inline banner */}
          {ride.info && (
            <View style={[styles.infoBanner, { backgroundColor: colors.primary + "18" }]}>
              <Icon name="directions-walk" size={15} color={colors.primary} />
              <Text style={[styles.infoBannerText, { color: colors.primary }]}>
                {t2("ride.clientOnHisWay")}
              </Text>
              <TouchableOpacity onPress={() => ride.actions.setInfo(false)}>
                <Icon name="close" size={15} color={colors.primary} />
              </TouchableOpacity>
            </View>
          )}
        </View>

      </View>

      {/* ── Actions footer — pinned to bottom ──────────────────────────────── */}
      <View style={[styles.actions, { paddingBottom: insets.bottom + 8 }]}>
        <Divider style={{ marginBottom: 20 }} />

        {/* Call + Navigate */}
        <View style={styles.secondaryRow}>
          <View style={styles.secondaryBtnWrap}>
            <Button
              mode="outlined"
              icon="phone"
              onPress={ride.actions.callDriver}
              style={[styles.secondaryBtn, { borderColor: colors.primary }]}
              contentStyle={styles.secondaryBtnContent}
            >
              {t2("ride.callDriver")}
            </Button>
          </View>
          <View style={styles.secondaryBtnWrap}>
            <Button
              mode="outlined"
              icon="map"
              onPress={() => ride.actions.openMap(isArrived ? "dropOff" : "pickUp")}
              style={[styles.secondaryBtn, { borderColor: colors.primary }]}
              contentStyle={styles.secondaryBtnContent}
            >
              {t2("ride.openMap")}
            </Button>
          </View>
        </View>

        {/* Primary CTA */}
        <Button
          mode="contained"
          icon={isArrived ? "flag-checkered" : "map-marker-check"}
          onPress={isArrived ? () => setEndRideVisible(true) : ride.actions.onDriverArrived}
          style={styles.primaryBtn}
          contentStyle={styles.primaryBtnContent}
        >
          {isArrived ? t2("ride.endRide") : t2("ride.arrived")}
        </Button>

        {/* Cancel link */}
        <TouchableOpacity onPress={() => setCancelVisible(true)} style={styles.cancelLink}>
          <Text style={[styles.cancelText, { color: colors.error }]}>
            {t2("ride.cancelRideLink")}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  body: {
    flex: 1,
    paddingHorizontal: 24,
  },

  // ── Phase strip ────────────────────────────────────────────────────────────
  phaseStrip: { marginTop: 20, marginBottom: 20 },
  phaseLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: "#9CA3AF",
    marginBottom: 10,
  },
  progressBar: { flexDirection: "row", alignItems: "center" },
  progressDot: { width: 12, height: 12, borderRadius: 6 },
  progressLine: { flex: 1, height: 3, borderRadius: 2, marginHorizontal: 6 },

  // ── Client card ────────────────────────────────────────────────────────────
  clientCard: { borderRadius: 16, overflow: "hidden" },
  clientRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  clientMeta: { flex: 1 },
  nameRow: { flexDirection: "row", alignItems: "center", marginBottom: 2 },
  arrivedBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 6,
    flexShrink: 0,
  },
  infoRow: { flexDirection: "row", alignItems: "center" },
  metaText: { color: "#9CA3AF", fontSize: 13, marginLeft: 4 },
  phoneStatsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },

  // Destination row
  destinationRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  destinationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  destinationText: { fontSize: 14, fontWeight: "500", flex: 1 },

  // Info banner
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  infoBannerText: { flex: 1, fontSize: 13, fontWeight: "500" },

  // ── Actions ────────────────────────────────────────────────────────────────
  actions: { paddingTop: 4, paddingHorizontal: 24 },
  secondaryRow: { flexDirection: "row", marginBottom: 12 },
  secondaryBtnWrap: { flex: 1, marginHorizontal: 4 },
  secondaryBtn: { borderRadius: 12 },
  secondaryBtnContent: { height: 50 },
  primaryBtn: { borderRadius: 14 },
  primaryBtnContent: { height: 56 },
  cancelLink: { alignItems: "center", paddingVertical: 14 },
  cancelText: { fontSize: 14, fontWeight: "500" },

  // ── Modals ─────────────────────────────────────────────────────────────────
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#e0e0e0",
    marginTop: 12,
    marginBottom: 4,
  },
  modalBody: { paddingHorizontal: 24, paddingTop: 16, alignItems: "center" },
  modalIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: { fontWeight: "bold", textAlign: "center" },
  modalSubtitle: {
    color: "#9CA3AF",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 24,
    lineHeight: 20,
  },
  modalButtons: { width: "100%", gap: 12 },
  modalBtn: { borderRadius: 12, width: "100%" },
  modalBtnContent: { height: 52 },
});
