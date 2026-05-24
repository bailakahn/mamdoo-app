import React, { useState, useRef, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Modal as RNModal,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme, Text } from "react-native-paper";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import Icon from "@expo/vector-icons/MaterialIcons";
import { t2 } from "_utils/lang";
import { useRide, useLocation } from "_hooks/partner";
import { useTheme as useMamdooTheme } from "_hooks";
import { Button, LoadingV2, Image } from "_atoms";
import { darkMapStyle } from "_styles/mapStyles";

const GENERIC_PICKUP_LABELS = ["votre position", "your location"];

function computeMapRegion(lat1, lng1, lat2, lng2) {
  if ([lat1, lng1, lat2, lng2].some(isNaN)) return null;
  const minLat = Math.min(lat1, lat2);
  const maxLat = Math.max(lat1, lat2);
  const minLng = Math.min(lng1, lng2);
  const maxLng = Math.max(lng1, lng2);
  const latSpan = Math.max(maxLat - minLat, 0.003);
  const lngSpan = Math.max(maxLng - minLng, 0.003);
  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: latSpan * 1.6,
    longitudeDelta: lngSpan * 1.6,
  };
}

export default function DriverOnTheWayScene() {
  const { colors } = useTheme();
  const mamdooTheme = useMamdooTheme();
  const ride = useRide();
  const location = useLocation();
  const insets = useSafeAreaInsets();
  const mapRef = useRef(null);

  const [cancelVisible, setCancelVisible] = useState(false);
  const [endRideVisible, setEndRideVisible] = useState(false);
  const [panelHeight, setPanelHeight] = useState(0);
  const [routePolyline, setRoutePolyline] = useState([]);

  const isArrived = ride.driverArrived;
  const pickupCoord = ride.request?.pickUp?.coordinates?.length === 2
    ? { latitude: ride.request.pickUp.coordinates[1], longitude: ride.request.pickUp.coordinates[0] }
    : null;
  const dropOffCoord = ride.request?.dropOff?.coordinates?.length === 2
    ? { latitude: ride.request.dropOff.coordinates[1], longitude: ride.request.dropOff.coordinates[0] }
    : null;
  const driverCoord = location.location;

  useEffect(() => {
    if (!driverCoord || !pickupCoord || !dropOffCoord) return;

    const origin = isArrived ? pickupCoord : driverCoord;
    const dest   = isArrived ? dropOffCoord : pickupCoord;
    const fallback = [origin, dest];

    const applyRoute = (coords) => {
      setRoutePolyline(coords);
      const lats = coords.map((p) => p.latitude);
      const lngs = coords.map((p) => p.longitude);
      const region = computeMapRegion(
        Math.min(...lats), Math.min(...lngs),
        Math.max(...lats), Math.max(...lngs)
      );
      if (region) setTimeout(() => mapRef.current?.animateToRegion(region, 600), 400);
    };

    ride.actions
      .getDirections(`${origin.latitude},${origin.longitude}`, `${dest.latitude},${dest.longitude}`)
      .then((coords) => applyRoute(coords?.length ? coords : fallback))
      .catch(() => applyRoute(fallback));
  }, [isArrived, pickupCoord?.latitude, dropOffCoord?.latitude, !!driverCoord]);

  if (!ride.request) return null;
  if (ride.isLoading) return <LoadingV2 />;

  const { client, dropOff, pickUp } = ride.request;
  const clientInitials =
    `${client.firstName.charAt(0)}${client.lastName.charAt(0)}`.toUpperCase();

  const isGenericPickup = GENERIC_PICKUP_LABELS.some(
    (label) => pickUp?.text?.toLowerCase().trim() === label
  );
  const destinationText = isArrived
    ? dropOff?.text || null
    : isGenericPickup ? null : pickUp?.text || null;

  const clientRideCount = client.rideCount ?? null;
  const clientAvgRating = client.avgRating ?? null;
  const isNewClient = clientRideCount === 0;

  const bottomPadding = Math.max(insets.bottom + 12, 24);
  const targetCoord = isArrived ? dropOffCoord : pickupCoord;

  const initialRegion = driverCoord && targetCoord
    ? computeMapRegion(
        driverCoord.latitude, driverCoord.longitude,
        targetCoord.latitude, targetCoord.longitude
      )
    : driverCoord
    ? { latitude: driverCoord.latitude, longitude: driverCoord.longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 }
    : { latitude: 9.5375, longitude: -13.6773, latitudeDelta: 0.01, longitudeDelta: 0.01 };

  const sheetStyle = [styles.sheet, { backgroundColor: colors.background, paddingBottom: bottomPadding }];

  return (
    <View style={styles.screen}>

      {/* ── Cancel confirmation ─────────────────────────────────────────────── */}
      <RNModal visible={cancelVisible} transparent animationType="slide" onRequestClose={() => setCancelVisible(false)}>
        <Pressable style={styles.backdrop} onPress={() => setCancelVisible(false)}>
          <View style={sheetStyle} onStartShouldSetResponder={() => true}>
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
          </View>
        </Pressable>
      </RNModal>

      {/* ── End ride confirmation ───────────────────────────────────────────── */}
      <RNModal visible={endRideVisible} transparent animationType="slide" onRequestClose={() => setEndRideVisible(false)}>
        <Pressable style={styles.backdrop} onPress={() => setEndRideVisible(false)}>
          <View style={sheetStyle} onStartShouldSetResponder={() => true}>
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
          </View>
        </Pressable>
      </RNModal>

      {/* ── Map ────────────────────────────────────────────────────────────── */}
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion}
        mapPadding={{ top: 60, bottom: panelHeight }}
        customMapStyle={mamdooTheme.isDarkMode ? darkMapStyle : []}
      >
        {driverCoord && (
          <Marker coordinate={driverCoord}>
            <Image
              source={require("_assets/client2.png")}
              cacheKey="client2"
              style={Platform.OS === "android" ? { width: 40, height: 40 } : { width: 80, height: 80 }}
              resizeMode="contain"
            />
          </Marker>
        )}

        {targetCoord && (
          <Marker coordinate={targetCoord}>
            <View style={[styles.destinationPin, { backgroundColor: isArrived ? colors.error : colors.primary }]} />
          </Marker>
        )}

        {routePolyline.length > 0 && (
          <>
            <Polyline coordinates={routePolyline} strokeWidth={8} strokeColor={colors.primary + "40"} />
            <Polyline coordinates={routePolyline} strokeWidth={4} strokeColor={colors.primary} />
          </>
        )}
      </MapView>

      {/* ── Ride info panel ─────────────────────────────────────────────────── */}
      <View
        style={[styles.panel, { backgroundColor: colors.background }]}
        onLayout={(e) => setPanelHeight(e.nativeEvent.layout.height)}
      >
        <View style={styles.handle} />

        <View style={[styles.clientCard, { backgroundColor: colors.primary + "18" }]}>
          <View style={styles.clientRow}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>{clientInitials}</Text>
            </View>
            <View style={styles.clientMeta}>
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

          {destinationText ? (
            <View style={[styles.destinationRow, { borderTopColor: colors.surfaceVariant ?? "#E5E7EB" }]}>
              <View style={[styles.destinationDot, { backgroundColor: isArrived ? colors.error : colors.primary }]} />
              <Text style={[styles.destinationText, { color: colors.text }]} numberOfLines={2}>
                {destinationText}
              </Text>
            </View>
          ) : null}

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

        <View style={[styles.actions, { paddingBottom: bottomPadding }]}>
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

          <Button
            mode="contained"
            icon={isArrived ? "flag-checkered" : "map-marker-check"}
            onPress={isArrived ? () => setEndRideVisible(true) : ride.actions.onDriverArrived}
            style={styles.primaryBtn}
            contentStyle={styles.primaryBtnContent}
          >
            {isArrived ? t2("ride.endRide") : t2("ride.arrived")}
          </Button>

          <TouchableOpacity onPress={() => setCancelVisible(true)} style={styles.cancelLink}>
            <Text style={[styles.cancelText, { color: colors.error }]}>
              {t2("ride.cancelRideLink")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },

  panel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 12,
  },

  // ── Confirmation sheets ────────────────────────────────────────────────────
  backdrop: { flex: 1, backgroundColor: "transparent", justifyContent: "flex-end" },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24 },

  // ── Map markers ────────────────────────────────────────────────────────────
  destinationPin: {
    width: 16, height: 16, borderRadius: 8,
    borderWidth: 2.5, borderColor: "#fff",
    shadowColor: "#000", shadowOpacity: 0.3, shadowRadius: 4, elevation: 4,
  },

  // ── Client card ────────────────────────────────────────────────────────────
  clientCard: { borderRadius: 16, overflow: "hidden", marginHorizontal: 16, marginTop: 4, marginBottom: 16 },
  clientRow: { flexDirection: "row", alignItems: "center", padding: 16 },
  avatar: {
    width: 46, height: 46, borderRadius: 23,
    justifyContent: "center", alignItems: "center", marginRight: 12,
  },
  avatarText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  clientMeta: { flex: 1 },
  nameRow: { flexDirection: "row", alignItems: "center", marginBottom: 2 },
  arrivedBadge: {
    width: 22, height: 22, borderRadius: 11,
    justifyContent: "center", alignItems: "center", marginLeft: 6, flexShrink: 0,
  },
  infoRow: { flexDirection: "row", alignItems: "center" },
  metaText: { color: "#9CA3AF", fontSize: 13, marginLeft: 4 },
  phoneStatsRow: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", marginTop: 4,
  },
  destinationRow: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1,
  },
  destinationDot: { width: 8, height: 8, borderRadius: 4, marginRight: 12 },
  destinationText: { fontSize: 14, fontWeight: "500", flex: 1 },
  infoBanner: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 10, gap: 8,
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

  // ── Modal sheets ───────────────────────────────────────────────────────────
  handle: {
    alignSelf: "center", width: 40, height: 4, borderRadius: 2,
    backgroundColor: "#e0e0e0", marginTop: 12, marginBottom: 4,
  },
  modalBody: { paddingHorizontal: 24, paddingTop: 16, alignItems: "center" },
  modalIcon: {
    width: 64, height: 64, borderRadius: 32,
    justifyContent: "center", alignItems: "center", marginBottom: 16,
  },
  modalTitle: { fontWeight: "bold", textAlign: "center" },
  modalSubtitle: {
    color: "#9CA3AF", fontSize: 14, textAlign: "center",
    marginTop: 8, marginBottom: 24, lineHeight: 20,
  },
  modalButtons: { width: "100%", gap: 12 },
  modalBtn: { borderRadius: 12, width: "100%" },
  modalBtnContent: { height: 52 },
});
