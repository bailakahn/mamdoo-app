import React, { useEffect, useState, useRef, useCallback } from "react";
import { useKeepAwake } from "expo-keep-awake";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Pressable,
  Platform,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import MapView, { PROVIDER_GOOGLE, Marker } from "react-native-maps";
import {
  useTheme,
  Portal,
  Text,
  Modal,
  Dialog,
  Divider,
  Switch,
} from "react-native-paper";
import Icon from "@expo/vector-icons/MaterialIcons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { t2 } from "_utils/lang";
import { darkMapStyle } from "_styles/mapStyles";
import {
  usePartner,
  usePartnerProxy,
  useNotifications,
  useLanguage,
  useApp,
  useTheme as useMamdooTheme,
} from "_hooks";
import { useRide, useLocation } from "_hooks/partner";
import { Button, LoadingV2, Image } from "_atoms";
import { Info } from "_molecules";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;
const DRAWER_WIDTH = SCREEN_WIDTH * 0.78;
const COUNTDOWN_SECONDS = 30;
const LATITUDE_DELTA = 0.005;

// ── Stat card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon, value, label, colors, iconColor, isDarkMode }) => {
  const ic = iconColor || colors.primary;
  const bg = isDarkMode ? ic + "26" : ic + "18";
  return (
    <View style={{ flex: 1, backgroundColor: bg, borderRadius: 14, padding: 12, alignItems: "center" }}>
      <Icon name={icon} size={22} color={ic} />
      <Text style={{ fontSize: 15, fontWeight: "bold", color: colors.text, marginTop: 6 }} numberOfLines={1}>
        {value}
      </Text>
      <Text style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
};

// ── Drawer menu item ─────────────────────────────────────────────────────────
const DrawerItem = ({ icon, label, onPress, destructive, colors, right }) => (
  <TouchableOpacity
    onPress={onPress}
    style={{
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 14,
      paddingHorizontal: 24,
    }}
  >
    <MaterialCommunityIcons
      name={icon}
      size={22}
      color={destructive ? colors.error : colors.primary}
      style={{ marginRight: 16 }}
    />
    <Text
      style={{
        flex: 1,
        fontSize: 15,
        color: destructive ? colors.error : colors.text,
        fontWeight: "500",
      }}
    >
      {label}
    </Text>
    {right}
  </TouchableOpacity>
);

// ── No-rides dialog ──────────────────────────────────────────────────────────
const SearchDialog = ({ visible, setVisible }) => (
  <Portal>
    <Dialog visible={visible} onDismiss={() => setVisible(false)}>
      <Dialog.Title>{t2("home.noRidesTitle")}</Dialog.Title>
      <Dialog.Content>
        <Text variant="bodyMedium">{t2("home.noRidesContent")}</Text>
      </Dialog.Content>
      <Dialog.Actions>
        <Button onPress={() => setVisible(false)}>Ok</Button>
      </Dialog.Actions>
    </Dialog>
  </Portal>
);

// ── Main scene ───────────────────────────────────────────────────────────────
export default function HomeScene() {
  const { colors } = useTheme();
  const mamdooTheme = useMamdooTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  usePartnerProxy();
  useNotifications();
  useLanguage();
  useKeepAwake();

  const ride = useRide();
  const partner = usePartner();
  const location = useLocation();
  const app = useApp();

  const [showSearchDialog, setShowSearchDialog] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [panelHeight, setPanelHeight] = useState(0);
  const [isAccepting, setIsAccepting] = useState(false);
  const drawerAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const mapRef = useRef(null);
  const locationRef = useRef(location.location);
  const latPanelOffsetRef = useRef(0);

  // Centre the driver marker in the visible area above the bottom panel
  const latPanelOffset =
    panelHeight > 0 ? (panelHeight / (2 * SCREEN_HEIGHT)) * LATITUDE_DELTA : 0;

  useEffect(() => { locationRef.current = location.location; }, [location.location]);
  useEffect(() => { latPanelOffsetRef.current = latPanelOffset; }, [latPanelOffset]);

  // ── bootstrap ──
  useEffect(() => {
    ride.actions.bootstrapAsync();
  }, []);

  // ── Animate map to driver location once both GPS and panel height are known ──
  // Using initialRegion on MapView so Android doesn't show Africa → fallback → GPS
  // animation sequence. All movement is driven programmatically through this effect.
  useEffect(() => {
    if (!location.location || !mapRef.current) return;
    const offset =
      panelHeight > 0 ? (panelHeight / (2 * SCREEN_HEIGHT)) * LATITUDE_DELTA : 0;
    mapRef.current.animateToRegion(
      {
        latitude: location.location.latitude - offset,
        longitude: location.location.longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LATITUDE_DELTA,
      },
      800
    );
  }, [location.location, panelHeight]);

  // ── reset drawer + accepting state, refresh stats whenever screen gains focus ──
  // Also re-animate map on Android which can reset camera when screen regains focus
  useFocusEffect(
    useCallback(() => {
      setDrawerOpen(false);
      drawerAnim.setValue(-DRAWER_WIDTH);
      setIsAccepting(false);
      ride.actions.getCommission();
      if (mapRef.current && locationRef.current) {
        mapRef.current.animateToRegion(
          {
            latitude: locationRef.current.latitude - latPanelOffsetRef.current,
            longitude: locationRef.current.longitude,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LATITUDE_DELTA,
          },
          300
        );
      }
    }, [])
  );

  // ── countdown timer for ride request ──
  useEffect(() => {
    if (!ride.requestId) {
      setCountdown(COUNTDOWN_SECONDS);
      return;
    }
    setCountdown(COUNTDOWN_SECONDS);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [ride.requestId]);

  // ── drawer helpers ──
  const openDrawer = () => {
    setDrawerOpen(true);
    Animated.spring(drawerAnim, {
      toValue: 0,
      useNativeDriver: true,
      friction: 9,
      tension: 60,
    }).start();
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    Animated.spring(drawerAnim, {
      toValue: -DRAWER_WIDTH,
      useNativeDriver: true,
      friction: 9,
      tension: 60,
    }).start();
  };

  const navigate = (screen) => {
    setDrawerOpen(false);
    drawerAnim.setValue(-DRAWER_WIDTH);
    navigation.navigate(screen);
  };

  // ── accept ride — guarded against double-tap ──
  const acceptRequest = async () => {
    if (isAccepting) return;
    setIsAccepting(true);
    try {
      const { latitude, longitude } = await location.actions.getCurrentPosition();
      ride.actions.acceptRequest([longitude, latitude]);
    } catch {
      setIsAccepting(false);
    }
  };

  // ── re-center map on driver ──
  const goToMyLocation = () => {
    if (mapRef.current && location.location) {
      mapRef.current.animateToRegion(
        {
          latitude: location.location.latitude - latPanelOffset,
          longitude: location.location.longitude,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LATITUDE_DELTA,
        },
        500
      );
    }
  };

  // ── derived values ──
  const isOnline = partner.partner?.isOnline;
  const firstName = partner.partner?.firstName || "";
  const lastName = partner.partner?.lastName || "";
  const initials =
    `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "?";

  const { tripsToday, rating, acceptanceRate, totalRides } = ride;
  const hasAcceptanceData = tripsToday > 0 && acceptanceRate !== null;
  const acceptanceColor = !hasAcceptanceData
    ? "#9CA3AF"
    : acceptanceRate >= 80 ? colors.primary
    : acceptanceRate >= 60 ? "#F59E0B"
    : colors.error;

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h >= 5 && h < 12) return t2("home.goodMorning");
    if (h >= 12 && h < 18) return t2("home.goodAfternoon");
    return t2("home.goodEvening");
  };

  const preview = ride.requestPreview;
  const countdownColor =
    countdown <= 10 ? colors.error : countdown <= 20 ? "#F59E0B" : colors.primary;

  const distanceText =
    preview?.distance?.text ||
    (typeof preview?.distance === "string" ? preview.distance : null) ||
    (typeof preview?.distance === "number"
      ? preview.distance >= 1000
        ? `${(preview.distance / 1000).toFixed(1)} km`
        : `${preview.distance} m`
      : null);

  const priceText = preview?.price
    ? `${ride.actions.formatPrice(preview.price)} GNF`
    : null;

  const mapRegion = location.location
    ? {
        latitude: location.location.latitude - latPanelOffset,
        longitude: location.location.longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LATITUDE_DELTA,
      }
    : { latitude: 9.5375, longitude: -13.6773, latitudeDelta: 0.01, longitudeDelta: 0.01 };

  if (ride.isLoading) return <LoadingV2 />;

  return (
    <>
      {/* ── Ride request modal ───────────────────────────────────────────── */}
      <Portal>
        <Modal
          visible={!!ride.requestId}
          onDismiss={ride.actions.denyRequest}
          style={{ justifyContent: "flex-end" }}
          contentContainerStyle={{
            backgroundColor: colors.background,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingBottom: 34,
          }}
        >
          <View style={styles.handle} />

          <View style={styles.modalHeader}>
            <Text variant="titleLarge" style={{ fontWeight: "bold", color: colors.text, flex: 1 }}>
              {t2("ride.newRide")}
            </Text>
            <View
              style={[
                styles.countdownChip,
                { backgroundColor: countdown <= 10 ? "#FEE2E2" : colors.primary + "18" },
              ]}
            >
              <Icon name="timer" size={14} color={countdownColor} />
              <Text style={{ marginLeft: 4, color: countdownColor, fontWeight: "bold", fontSize: 14 }}>
                {countdown}s
              </Text>
            </View>
          </View>

          <Divider />

          <View style={styles.destinationRow}>
            <View style={styles.destinationIcon}>
              <Icon name="location-on" size={22} color={colors.error} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.destinationLabel}>{t2("ride.destination")}</Text>
              <Text variant="bodyLarge" style={{ fontWeight: "600", color: colors.text }} numberOfLines={2}>
                {preview?.dropOffText || "—"}
              </Text>
            </View>
          </View>

          <Divider />

          <View style={styles.statsRow}>
            <View style={{ flex: 1, alignItems: "center" }}>
              <Icon name="payments" size={22} color={colors.primary} />
              <Text style={styles.statLabel}>{t2("ride.fare")}</Text>
              <Text style={{ fontSize: 20, fontWeight: "bold", color: colors.text, marginTop: 3 }}>
                {priceText || "—"}
              </Text>
            </View>
            <View style={{ width: 1, backgroundColor: "#E5E7EB", marginVertical: 4 }} />
            <View style={{ flex: 1, alignItems: "center" }}>
              <Icon name="route" size={22} color={colors.primary} />
              <Text style={styles.statLabel}>{t2("ride.distance")}</Text>
              <Text style={{ fontSize: 20, fontWeight: "bold", color: colors.text, marginTop: 3 }}>
                {distanceText || "—"}
              </Text>
            </View>
          </View>

          {/* Client info row — name + rating + rides */}
          {(preview?.clientName || preview?.clientAvgRating != null || preview?.clientRideCount != null) && (
            <>
              <Divider />
              <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 24, paddingVertical: 14 }}>
                {/* Initials avatar */}
                {preview?.clientName ? (
                  <View style={{
                    width: 36, height: 36, borderRadius: 18,
                    backgroundColor: colors.primary,
                    justifyContent: "center", alignItems: "center",
                    marginRight: 12, flexShrink: 0,
                  }}>
                    <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 13 }}>
                      {preview.clientName.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)}
                    </Text>
                  </View>
                ) : null}

                {/* Name — truncates before stats */}
                <Text
                  style={{ flex: 1, fontWeight: "600", color: colors.text, fontSize: 14 }}
                  numberOfLines={1}
                >
                  {preview?.clientName || ""}
                </Text>

                {/* Rating */}
                {preview?.clientAvgRating != null && (
                  <View style={{ flexDirection: "row", alignItems: "center", marginLeft: 10 }}>
                    <Icon name="star" size={14} color="#F59E0B" />
                    <Text style={{ marginLeft: 3, fontSize: 13, fontWeight: "600", color: colors.text }}>
                      {preview.clientAvgRating}
                    </Text>
                  </View>
                )}

                {/* Rides */}
                {preview?.clientRideCount != null && (
                  <View style={{ flexDirection: "row", alignItems: "center", marginLeft: 10 }}>
                    <Icon name="directions-car" size={14} color="#9CA3AF" />
                    <Text style={{ marginLeft: 3, fontSize: 13, color: preview.clientRideCount === 0 ? colors.primary : "#9CA3AF", fontWeight: preview.clientRideCount === 0 ? "600" : "400" }}>
                      {preview.clientRideCount === 0
                        ? t2("ride.newClient")
                        : String(preview.clientRideCount)}
                    </Text>
                  </View>
                )}
              </View>
            </>
          )}

          <Divider />

          <View style={{ paddingHorizontal: 24, paddingTop: 16, gap: 10 }}>
            <Button
              mode="contained"
              onPress={acceptRequest}
              icon="check"
              loading={isAccepting}
              disabled={isAccepting}
              style={{ borderRadius: 12 }}
              contentStyle={{ height: 52 }}
            >
              {t2("ride.acceptRide")}
            </Button>
            <Button mode="outlined" onPress={ride.actions.denyRequest} icon="close"
              style={{ borderRadius: 12, borderColor: colors.error }}
              contentStyle={{ height: 52 }} textColor={colors.error}>
              {t2("ride.denyRide")}
            </Button>
          </View>
        </Modal>

        {ride.error && (
          <Info visible={ride.error} text={t2(ride.error)}
            onDismiss={() => ride.actions.setError(false)}
            onClose={() => ride.actions.setError(false)} />
        )}
        {ride.canceled && (
          <Modal
            visible={ride.canceled}
            onDismiss={() => ride.actions.setRideCanceled(false)}
            style={{ justifyContent: "flex-end" }}
            contentContainerStyle={[
              styles.cancelNotifSheet,
              { backgroundColor: colors.background, paddingBottom: Math.max(insets.bottom + 16, 24) },
            ]}
          >
            <View style={styles.cancelNotifHandle} />
            <View style={styles.cancelNotifBody}>
              <View style={[styles.cancelNotifIcon, { backgroundColor: "#FEE2E2" }]}>
                <Icon name="cancel" size={36} color={colors.error} />
              </View>
              <Text variant="titleLarge" style={[styles.cancelNotifTitle, { color: colors.text }]}>
                {t2("ride.rideCanceledTitle")}
              </Text>
              <Text style={styles.cancelNotifSubtitle}>
                {t2("ride.rideCanceled")}
              </Text>
              <Button
                mode="contained"
                onPress={() => ride.actions.setRideCanceled(false)}
                style={styles.cancelNotifBtn}
                contentStyle={{ height: 52 }}
                icon="check"
              >
                {t2("main.close")}
              </Button>
            </View>
          </Modal>
        )}
      </Portal>

      <SearchDialog visible={showSearchDialog} setVisible={setShowSearchDialog} />

      {/* ── Main screen ─────────────────────────────────────────────────── */}
      <View style={{ flex: 1 }}>

        {/* Map — initialRegion so Android doesn't animate on every state change */}
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          provider={PROVIDER_GOOGLE}
          initialRegion={mapRegion}
          customMapStyle={mamdooTheme.isDarkMode ? darkMapStyle : []}
          onMapReady={() => {
            if (mapRef.current && locationRef.current) {
              mapRef.current.animateToRegion(
                {
                  latitude: locationRef.current.latitude - latPanelOffsetRef.current,
                  longitude: locationRef.current.longitude,
                  latitudeDelta: LATITUDE_DELTA,
                  longitudeDelta: LATITUDE_DELTA,
                },
                800
              );
            }
          }}
        >
          {location.location && (
            <Marker coordinate={location.location}>
              <Image
                source={require("_assets/client2.png")}
                cacheKey={"client2"}
                style={
                  Platform.OS === "android"
                    ? { width: 40, height: 40 }
                    : { width: 80, height: 80 }
                }
                resizeMode="contain"
              />
            </Marker>
          )}
        </MapView>

        {/* Top bar: avatar button (left) + status chip (center) */}
        <SafeAreaView pointerEvents="box-none">
          <View style={styles.topBar}>
            {/* Hamburger / drawer trigger */}
            <TouchableOpacity
              onPress={openDrawer}
              style={[styles.hamburgerButton, { backgroundColor: colors.primary }]}
            >
              <MaterialCommunityIcons name="menu" size={26} color="#fff" />
            </TouchableOpacity>

            {/* Status chip — centred, content-sized */}
            <View style={styles.statusChipWrapper}>
              <View style={[styles.statusChip, { backgroundColor: isOnline ? colors.primary : "#F1853F" }]}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>
                  {isOnline ? t2("home.youAreOnline") : t2("home.youAreOffline")}
                </Text>
              </View>
            </View>

            {/* Spacer to balance the avatar button */}
            <View style={{ width: 40 }} />
          </View>
        </SafeAreaView>

        {/* Locate-me button — floats bottom-right above the panel */}
        {panelHeight > 0 && (
          <TouchableOpacity
            onPress={goToMyLocation}
            style={[
              styles.locateMeButton,
              {
                bottom: panelHeight + 12,
                right: 16,
                backgroundColor: mamdooTheme.isDarkMode ? "#374151" : "#fff",
              },
            ]}
          >
            <Icon name="my-location" size={20} color={colors.primary} />
          </TouchableOpacity>
        )}

        {/* Bottom panel */}
        <View
          style={[styles.panel, { backgroundColor: colors.background }]}
          onLayout={(e) => setPanelHeight(e.nativeEvent.layout.height)}
        >
          <View style={styles.handle} />

          <View style={{ paddingHorizontal: 24, paddingTop: 14, paddingBottom: 16 }}>
            <Text style={{ fontSize: 22, fontWeight: "bold", color: colors.text }}>
              {getGreeting()}, {firstName}!
            </Text>
          </View>

          <View style={{ flexDirection: "row", paddingHorizontal: 16, gap: 8 }}>
            <StatCard icon="payments" value={`${ride.commission} GNF`}
              label={t2("home.todayEarnings")} colors={colors} isDarkMode={mamdooTheme.isDarkMode} />
            <StatCard icon="directions-car" value={String(tripsToday)}
              label={t2("home.tripsToday")} colors={colors} isDarkMode={mamdooTheme.isDarkMode} />
            <StatCard icon="star" value={rating > 0 ? String(rating) : "—"}
              label={t2("home.rating")} colors={colors} iconColor="#F59E0B" isDarkMode={mamdooTheme.isDarkMode} />
          </View>

          <View style={{ paddingHorizontal: 24, marginTop: 16 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
              <Text style={{ fontSize: 13, color: "#9CA3AF" }}>{t2("home.acceptanceRate")}</Text>
              <Text style={{ fontSize: 13, fontWeight: "bold", color: acceptanceColor }}>
                {hasAcceptanceData ? `${acceptanceRate}%` : "—"}
              </Text>
            </View>
            <View style={{ height: 6, backgroundColor: colors.surfaceVariant ?? "#E5E7EB", borderRadius: 3 }}>
              <View
                style={{
                  height: 6,
                  width: hasAcceptanceData ? `${acceptanceRate}%` : "0%",
                  backgroundColor: acceptanceColor,
                  borderRadius: 3,
                }}
              />
            </View>
          </View>

          {partner.partner?.isBlocked && (
            <View style={[styles.blockedNotice, { borderColor: colors.error }]}>
              <Text style={{ color: colors.error, fontWeight: "600", textAlign: "center" }}>
                {t2("home.accountBlocked")}
              </Text>
              <Button mode="outlined" onPress={app.actions.call}
                style={{ marginTop: 12, borderColor: colors.error }} textColor={colors.error}>
                {t2("main.callUs")}
              </Button>
            </View>
          )}

          <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: Math.max(insets.bottom + 12, 24) }}>
            {isOnline ? (
              <TouchableOpacity
                onPress={() => ride.actions.searchRides(setShowSearchDialog)}
                style={[styles.searchButton, { backgroundColor: colors.primary }]}
              >
                <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
                  {t2("home.searchRides")}
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={[styles.offlinePlaceholder, { backgroundColor: colors.primary + "18" }]}>
                <Text style={{ color: "#9CA3AF", fontSize: 15, fontWeight: "500" }}>
                  {t2("home.youAreOffline")}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* ── Drawer overlay ────────────────────────────────────────────── */}
        {drawerOpen && (
          <Pressable style={styles.drawerBackdrop} onPress={closeDrawer} />
        )}

        <Animated.View
          style={[
            styles.drawer,
            { backgroundColor: colors.background, width: DRAWER_WIDTH },
            { transform: [{ translateX: drawerAnim }] },
          ]}
        >
          {/* Drawer header — horizontal: avatar left, name+stats right */}
          <SafeAreaView edges={["top"]}>
            <TouchableOpacity
              onPress={() => navigate("Profile")}
              style={[styles.drawerHeader, { borderBottomColor: colors.surfaceVariant ?? "#E5E7EB" }]}
            >
              <View style={[styles.drawerAvatar, { backgroundColor: colors.primary }]}>
                <Text style={styles.drawerAvatarText}>{initials}</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={[styles.drawerName, { color: colors.text }]} numberOfLines={1}>
                  {`${firstName} ${lastName}`}
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
                  {rating > 0 && (
                    <>
                      <Icon name="star" size={13} color="#F59E0B" />
                      <Text style={[styles.drawerStatText, { color: "#F59E0B", fontWeight: "700" }]}>
                        {rating}
                      </Text>
                    </>
                  )}
                  {totalRides > 0 && (
                    <Text style={[styles.drawerStatText, { color: "#9CA3AF", marginLeft: rating > 0 ? 8 : 0 }]}>
                      {totalRides} {t2("home.tripsToday").toLowerCase()}
                    </Text>
                  )}
                </View>
              </View>
              <Icon name="chevron-right" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </SafeAreaView>

          <View style={{ flex: 1 }}>
            <DrawerItem
              icon="format-list-text"
              label={t2("account.ridesHistory")}
              onPress={() => navigate("RidesHistory")}
              colors={colors}
            />

            <Divider style={{ marginVertical: 4 }} />

            {/* Dark mode toggle */}
            <View style={styles.drawerToggleRow}>
              <MaterialCommunityIcons
                name="weather-night"
                size={22}
                color={colors.primary}
                style={{ marginRight: 16 }}
              />
              <Text style={{ flex: 1, fontSize: 15, color: colors.text, fontWeight: "500" }}>
                {t2("main.darkMode")}
              </Text>
              <Switch
                color={colors.primary}
                value={mamdooTheme.isDarkMode}
                onValueChange={() => mamdooTheme.actions.setDarkMode(!mamdooTheme.isDarkMode)}
              />
            </View>

            <Divider style={{ marginVertical: 4 }} />

            <DrawerItem
              icon="account-switch"
              label={t2("account.switchToClient")}
              onPress={() => { closeDrawer(); app.actions.setApp("client"); }}
              colors={colors}
            />

            <Divider style={{ marginVertical: 4 }} />

            <DrawerItem
              icon="exit-to-app"
              label={t2("account.logout")}
              onPress={() => { closeDrawer(); partner.actions.logout(); }}
              colors={colors}
              destructive
            />
          </View>
        </Animated.View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#e0e0e0",
    marginTop: 12,
    marginBottom: 4,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  hamburgerButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  locateMeButton: {
    position: "absolute",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  statusChipWrapper: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 8,
  },
  statusChip: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#fff",
    marginRight: 8,
    opacity: 0.9,
  },
  statusText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
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
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  countdownChip: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  destinationRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  destinationIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  destinationLabel: {
    fontSize: 12,
    color: "#9CA3AF",
    marginBottom: 3,
  },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  statLabel: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 5,
  },
  blockedNotice: {
    marginHorizontal: 24,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  searchButton: {
    borderRadius: 14,
    height: 54,
    justifyContent: "center",
    alignItems: "center",
  },
  offlinePlaceholder: {
    borderRadius: 14,
    height: 54,
    justifyContent: "center",
    alignItems: "center",
  },
  drawerBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  drawer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 16,
  },
  drawerHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
  },
  drawerAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  drawerAvatarText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  drawerName: {
    fontSize: 16,
    fontWeight: "700",
  },
  drawerStatText: {
    fontSize: 13,
    marginLeft: 3,
  },
  drawerToggleRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  cancelNotifSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  cancelNotifHandle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#E5E7EB",
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 4,
  },
  cancelNotifBody: {
    paddingHorizontal: 24,
    paddingTop: 16,
    alignItems: "center",
  },
  cancelNotifIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  cancelNotifTitle: {
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  cancelNotifSubtitle: {
    color: "#9CA3AF",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
  },
  cancelNotifBtn: {
    borderRadius: 12,
    width: "100%",
  },
});
