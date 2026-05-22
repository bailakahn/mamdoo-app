import React from "react";
import { View, TouchableOpacity, StyleSheet, ScrollView, Image } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme, Text } from "react-native-paper";
import MapView, { PROVIDER_GOOGLE, Marker } from "react-native-maps";
import Icon from "@expo/vector-icons/MaterialIcons";
import { useRide, useTheme as useMamdooTheme } from "_hooks";
import { t } from "_utils/lang";
import date from "../../../utils/helpers/date";
import { darkMapStyle } from "_styles/mapStyles";

const CAB_IMAGES = {
  bike: require("_assets/bike2.png"),
  car: require("_assets/car2.png"),
  tuk: require("_assets/tuk.png"),
};

const STATUS_LABEL = {
  completed: { label: "Complétée", bg: "#22C55E22", text: "#22C55E" },
  canceled: { label: "Annulée", bg: "#EF444422", text: "#EF4444" },
  ongoing: { label: "En cours", bg: "#F59E0B22", text: "#F59E0B" },
};

export default function RideDetailScene({ navigation, route }) {
  const { ride } = route.params;
  const { colors } = useTheme();
  const mamdooTheme = useMamdooTheme();
  const insets = useSafeAreaInsets();
  const rideHook = useRide();

  const cardBg = mamdooTheme.isDarkMode ? colors.overlap : colors.surface;

  const driverInitials = ride.driver
    ? `${ride.driver.firstName?.charAt(0) ?? ""}${ride.driver.lastName?.charAt(0) ?? ""}`.toUpperCase()
    : "?";

  const driverName = ride.driver
    ? `${ride.driver.firstName} ${ride.driver.lastName}`
    : "—";

  const price = ride.finalPrice ?? ride.maxPrice ?? ride.price;
  const priceFormatted = price ? `${rideHook.actions.formatPrice(price)} GNF` : "—";

  const status = STATUS_LABEL[ride.status] ?? STATUS_LABEL.completed;
  const rideDate = date(ride.createdAt).format("ddd DD MMM YYYY · HH:mm");

  const canceledByLabel = ride.status === "canceled" && ride.cancelation
    ? (ride.cancelation.clientId
        ? t("ridesHistory.canceledByYou")
        : t("ridesHistory.canceledByDriver"))
    : null;

  const pickupCoords = ride.pickUp?.coordinates;
  const dropoffCoords = ride.dropOff?.coordinates;
  const hasMap = pickupCoords?.length === 2 && dropoffCoords?.length === 2;

  const mapRegion = hasMap ? {
    latitude: (parseFloat(pickupCoords[1]) + parseFloat(dropoffCoords[1])) / 2,
    longitude: (parseFloat(pickupCoords[0]) + parseFloat(dropoffCoords[0])) / 2,
    latitudeDelta: Math.abs(parseFloat(pickupCoords[1]) - parseFloat(dropoffCoords[1])) * 2.5 + 0.005,
    longitudeDelta: Math.abs(parseFloat(pickupCoords[0]) - parseFloat(dropoffCoords[0])) * 2.5 + 0.005,
  } : null;

  const durationMin = ride.duration
    ? typeof ride.duration === "object" ? ride.duration.text : `${Math.round(ride.duration / 60)} min`
    : null;

  const distanceKm = ride.distance
    ? typeof ride.distance === "object"
      ? ride.distance.text
      : ride.distance >= 1000 ? `${(ride.distance / 1000).toFixed(1)} km` : `${ride.distance} m`
    : null;

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: colors.background }]}
      edges={["top", "bottom"]}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 16, 24) }}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerDate, { color: colors.text }]}>{rideDate}</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Map */}
        {hasMap && mapRegion && (
          <View style={styles.mapContainer}>
            <MapView
              style={StyleSheet.absoluteFill}
              provider={PROVIDER_GOOGLE}
              initialRegion={mapRegion}
              scrollEnabled={false}
              zoomEnabled={false}
              pitchEnabled={false}
              rotateEnabled={false}
              customMapStyle={mamdooTheme.isDarkMode ? darkMapStyle : []}
            >
              <Marker
                coordinate={{ latitude: parseFloat(pickupCoords[1]), longitude: parseFloat(pickupCoords[0]) }}
                tracksViewChanges={false}
              >
                <View style={[styles.mapPin, { backgroundColor: colors.primary }]}>
                  <Icon name="person" size={14} color="#fff" />
                </View>
              </Marker>
              <Marker
                coordinate={{ latitude: parseFloat(dropoffCoords[1]), longitude: parseFloat(dropoffCoords[0]) }}
                tracksViewChanges={false}
              >
                <View style={[styles.mapPin, { backgroundColor: colors.error }]}>
                  <Icon name="flag" size={14} color="#fff" />
                </View>
              </Marker>
            </MapView>
          </View>
        )}

        <View style={styles.body}>
          {/* Status badge + canceled-by note */}
          <View style={styles.statusRow}>
            <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
              <Text style={[styles.statusText, { color: status.text }]}>{status.label}</Text>
            </View>
            {canceledByLabel && (
              <Text style={[styles.canceledByText, { color: colors.error }]}>{canceledByLabel}</Text>
            )}
          </View>

          {/* Price */}
          <View style={[styles.priceCard, { backgroundColor: cardBg }]}>
            <View style={styles.priceRow}>
              <Icon name="payments" size={22} color={colors.primary} />
              <Text style={[styles.priceLabel, { color: "#9CA3AF" }]}>{t("ride.price")}</Text>
            </View>
            <Text style={[styles.priceAmount, { color: colors.text }]}>{priceFormatted}</Text>
          </View>

          {/* Driver */}
          <View style={[styles.personCard, { backgroundColor: cardBg }]}>
            <View style={[styles.personAvatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.personAvatarText}>{driverInitials}</Text>
            </View>
            <View>
              <Text style={[styles.personName, { color: colors.text }]}>{driverName}</Text>
              <Text style={styles.personLabel}>Conducteur</Text>
            </View>
          </View>

          {/* Route */}
          {(ride.pickUp?.text || ride.dropOff?.text) && (
            <View style={[styles.routeCard, { backgroundColor: cardBg }]}>
              {ride.pickUp?.text && (
                <View style={styles.routeRow}>
                  <View style={[styles.routeDot, { backgroundColor: colors.primary }]} />
                  <Text style={[styles.routeAddress, { color: colors.text }]} numberOfLines={2}>
                    {ride.pickUp.text}
                  </Text>
                </View>
              )}
              {ride.pickUp?.text && ride.dropOff?.text && (
                <View style={[styles.routeConnector, { backgroundColor: mamdooTheme.isDarkMode ? colors.border : "#E5E7EB" }]} />
              )}
              {ride.dropOff?.text && (
                <View style={styles.routeRow}>
                  <View style={[styles.routeDot, { backgroundColor: colors.error }]} />
                  <Text style={[styles.routeAddress, { color: colors.text }]} numberOfLines={2}>
                    {ride.dropOff.text}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Duration + Distance */}
          {(durationMin || distanceKm) && (
            <View style={styles.statsRow}>
              {durationMin && (
                <View style={[styles.statChip, { backgroundColor: cardBg }]}>
                  <Icon name="schedule" size={18} color={colors.primary} />
                  <Text style={[styles.statValue, { color: colors.text }]}>{durationMin}</Text>
                </View>
              )}
              {distanceKm && (
                <View style={[styles.statChip, { backgroundColor: cardBg }]}>
                  <Icon name="route" size={18} color={colors.primary} />
                  <Text style={[styles.statValue, { color: colors.text }]}>{distanceKm}</Text>
                </View>
              )}
            </View>
          )}

          {/* Cab type */}
          {ride.cabType?.name && (
            <View style={[styles.cabTypeCard, { backgroundColor: cardBg }]}>
              <View style={[styles.cabTypeImageBox, { backgroundColor: colors.background }]}>
                <Image
                  source={CAB_IMAGES[ride.cabType.name] ?? CAB_IMAGES.bike}
                  style={styles.cabTypeImage}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.cabTypeBody}>
                <Text style={[styles.cabTypeLabel, { color: "#9CA3AF" }]}>{t("ridesHistory.cabType")}</Text>
                <Text style={[styles.cabTypeName, { color: colors.text }]}>{ride.cabType.name}</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingVertical: 14,
  },
  headerDate: { fontSize: 14, fontWeight: "600" },
  mapContainer: { height: 200, marginHorizontal: 20, borderRadius: 16, overflow: "hidden" },
  mapPin: {
    width: 28, height: 28, borderRadius: 14,
    justifyContent: "center", alignItems: "center",
    borderWidth: 2, borderColor: "#fff",
  },
  body: { paddingHorizontal: 20, paddingTop: 16 },
  statusRow: { flexDirection: "row", alignItems: "center", marginBottom: 16, gap: 12 },
  statusBadge: { alignSelf: "flex-start", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 5 },
  statusText: { fontSize: 13, fontWeight: "700" },
  canceledByText: { fontSize: 13, fontWeight: "500" },
  priceCard: { borderRadius: 14, padding: 16, marginBottom: 12 },
  priceRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  priceLabel: { fontSize: 13, marginLeft: 8 },
  priceAmount: { fontSize: 28, fontWeight: "800" },
  personCard: { flexDirection: "row", alignItems: "center", borderRadius: 14, padding: 16, marginBottom: 12 },
  personAvatar: { width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center", marginRight: 14 },
  personAvatarText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  personName: { fontSize: 15, fontWeight: "600" },
  personLabel: { color: "#9CA3AF", fontSize: 12, marginTop: 2 },
  routeCard: { borderRadius: 14, padding: 16, marginBottom: 12 },
  routeRow: { flexDirection: "row", alignItems: "flex-start" },
  routeDot: { width: 10, height: 10, borderRadius: 5, marginRight: 12, marginTop: 4, flexShrink: 0 },
  routeAddress: { flex: 1, fontSize: 14, lineHeight: 20 },
  routeConnector: { width: 2, height: 18, marginLeft: 4, marginVertical: 4 },
  statsRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
  statChip: { flex: 1, flexDirection: "row", alignItems: "center", borderRadius: 14, padding: 14, gap: 10 },
  statValue: { fontSize: 15, fontWeight: "600" },
  cabTypeCard: { flexDirection: "row", alignItems: "center", borderRadius: 14, padding: 16, marginBottom: 12, gap: 14 },
  cabTypeImageBox: { width: 56, height: 56, borderRadius: 12, justifyContent: "center", alignItems: "center", flexShrink: 0 },
  cabTypeImage: { width: 44, height: 44 },
  cabTypeBody: { flex: 1 },
  cabTypeLabel: { fontSize: 12, marginBottom: 2 },
  cabTypeName: { fontSize: 15, fontWeight: "600" },
});
