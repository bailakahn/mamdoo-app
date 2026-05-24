import React, { useMemo, useEffect, useRef, useState, useCallback } from "react";
import MapView, { PROVIDER_GOOGLE, Marker, Polyline } from "react-native-maps";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
  Dimensions,
  PanResponder,
  Pressable,
  Switch,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView as RNSafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useTheme,
  Text,
  Divider,
  Chip,
  Portal,
  Modal,
} from "react-native-paper";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  useLocation,
  useRide,
  useUser,
  useProxy,
  useApp,
  useTheme as useMamdooTheme,
  useNotifications,
  useLanguage,
} from "_hooks";
import { LoadingV2, Button, Image } from "_atoms";
import { Classes } from "_styles";
import { t, lang } from "_utils/lang";
import { defaultNewRide } from "_store/initialState";
import PopConfirm from "_organisms/PopConfirm";
import { Mixins } from "../../../styles";
import { removeCachedImage } from "../../../utils/helpers/removeCachedImage";
import { darkMapStyle } from "_styles/mapStyles";
import Icon from "@expo/vector-icons/MaterialIcons";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;
const DRAWER_WIDTH = SCREEN_WIDTH * 0.78;
const RECENT_PLACES_COUNT = 2;
// Height of the fixed booking footer (top padding + button + bottom padding, excluding insets)
const FOOTER_H = 68;

// Android: insets.bottom reports 0 on edge-to-edge builds so we use fixed
// pixel heights calibrated to actual content + 64dp (48 nav bar + 16 gap).
// iOS keeps the original percentage-based snaps — do not change them.
//
// Android: initial snaps are set slightly BELOW measured content height so the
// sheet starts with content just slightly clipped (no empty space at bottom),
// then onLayout springs it up to the exact fit.  Steps 4 and 5 use a shared
// handleDriverContentHeight callback; step 3 uses the same callback.
const SHEET_SNAPS = Platform.OS === "android"
  ? {
      0: [SCREEN_HEIGHT * 0.36, SCREEN_HEIGHT * 0.58],
      2: [SCREEN_HEIGHT * 0.40, SCREEN_HEIGHT * 0.70],
      3: [250],
      4: [280],
      5: [280],
      6: [260],
    }
  : {
      0: [SCREEN_HEIGHT * 0.36, SCREEN_HEIGHT * 0.58],
      2: [SCREEN_HEIGHT * 0.40, SCREEN_HEIGHT * 0.70],
      3: [SCREEN_HEIGHT * 0.28],
      4: [SCREEN_HEIGHT * 0.30, SCREEN_HEIGHT * 0.55],
      5: [SCREEN_HEIGHT * 0.30, SCREEN_HEIGHT * 0.55],
      6: [SCREEN_HEIGHT * 0.22],
    };

const getSnaps = (step) => SHEET_SNAPS[step] ?? SHEET_SNAPS[0];

function haversineMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function calcBearing(lat1, lng1, lat2, lng2) {
  const toRad = (d) => (d * Math.PI) / 180;
  const toDeg = (r) => (r * 180) / Math.PI;
  const dLng = toRad(lng2 - lng1);
  const y = Math.sin(dLng) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLng);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

// Fit a bounding box into the map region.
// mapPadding handles centering in the visible viewport — just pass the bbox + margin.
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
    latitudeDelta: latSpan * 1.3,
    longitudeDelta: lngSpan * 1.3,
  };
}

// Drawer item component
const DrawerItem = ({ icon, label, onPress, destructive, colors, right }) => (
  <TouchableOpacity
    onPress={onPress}
    style={{ flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingHorizontal: 24 }}
  >
    <MaterialCommunityIcons
      name={icon}
      size={22}
      color={destructive ? colors.error : colors.primary}
      style={{ marginRight: 16 }}
    />
    <Text style={{ flex: 1, fontSize: 15, color: destructive ? colors.error : colors.text, fontWeight: "500" }}>
      {label}
    </Text>
    {right}
  </TouchableOpacity>
);

// Image mapping
const images = {
  bike: require("_assets/bike2.png"),
  car: require("_assets/car2.png"),
  tuk: require("_assets/tuk.png"),
};

const LATITUDE_DELTA = 0.005;
const LONGITUDE_DELTA = 0.005;
const regex = /^([A-Za-z ]+)(?: \((le|la)\))?$/;

const splitCountry = (countryName = "") => {
  const match = countryName.match(regex);
  if (match) {
    const countryName = match[1].trim(); // "Canada"
    const definiteArticle = match[2] ? match[2] : null; // "le" or null
    console.log(
      `Country: ${countryName}, Definite Article: ${definiteArticle}`
    );
  } else {
    console.log("String does not match expected format.");
    console.log(countryName.split(" ")[0]);
  }
};

export default function Home({ navigation, route }) {
  useProxy();
  useNotifications();
  useLanguage();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const location = useLocation();
  const theme = useMamdooTheme();
  const user = useUser();
  const ride = useRide();
  const app = useApp();
  const destinationMarkerRef = useRef();
  const mapRef = useRef();

  const [tracks, setTracks] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const sheetHeightAnim = useRef(new Animated.Value(SHEET_SNAPS[0][0])).current;
  // Extend sheet background past the safe area edge so there's no floating gap.
  // The visible content area stays SHEET_SNAPS height; insets.bottom is just filled background.
  const sheetHeightWithInsets = useRef(Animated.add(sheetHeightAnim, insets.bottom)).current;
  const [sheetSnapHeight, setSheetSnapHeight] = useState(SHEET_SNAPS[0][0]);
  const currentSheetHeightRef = useRef(SHEET_SNAPS[0][0]);
  const snapRef = useRef(getSnaps(0));
  const insetsBottomRef = useRef(insets.bottom);
  insetsBottomRef.current = insets.bottom;

  const prevDriverLocRef = useRef(null);
  const [driverBearing, setDriverBearing] = useState(0);
  const [trimmedPolylineStart, setTrimmedPolylineStart] = useState(0);
  const [liveEta, setLiveEta] = useState(null);
  const [driverIsNearby, setDriverIsNearby] = useState(false);

  // Called by RideDetailView once it knows its intrinsic height.
  // Snaps the sheet to exactly fit title + cards + footer area. No white space.
  const handleRideDetailHeight = useCallback((h) => {
    if (h <= 0) return;
    const PILL_H = 25;
    // FOOTER_H is reserved below the content (footer sits at bottom: 0, same z-stack)
    const targetH = Math.min(PILL_H + h + FOOTER_H, SCREEN_HEIGHT * 0.70);
    if (Math.abs(targetH - currentSheetHeightRef.current) < 4) return;
    snapRef.current = [targetH, SCREEN_HEIGHT * 0.70];
    Animated.spring(sheetHeightAnim, { toValue: targetH, useNativeDriver: false, friction: 8, tension: 50 }).start();
    setSheetSnapHeight(targetH);
  }, []);

  const lastWelcomeHeightRef = useRef(0);
  const handleWelcomeHeight = useCallback((h) => {
    if (h <= 0) return;
    if (Math.abs(h - lastWelcomeHeightRef.current) < 2) return;
    lastWelcomeHeightRef.current = h;
    const PILL_H = 25;
    const targetH = Math.min(PILL_H + h, SCREEN_HEIGHT * 0.70);
    snapRef.current = [targetH];
    Animated.spring(sheetHeightAnim, { toValue: targetH, useNativeDriver: false, friction: 8, tension: 50 }).start();
    setSheetSnapHeight(targetH);
  }, []);

  const lastDriverContentHRef = useRef(0);
  const handleDriverContentHeight = useCallback((h) => {
    if (Platform.OS !== "android" || !h || h <= 0) return;
    if (Math.abs(h - lastDriverContentHRef.current) < 4) return;
    lastDriverContentHRef.current = h;
    const PILL_H = 25;
    const snapH = PILL_H + h;
    snapRef.current = [snapH];
    Animated.spring(sheetHeightAnim, { toValue: snapH, useNativeDriver: false, friction: 8, tension: 50 }).start();
    setSheetSnapHeight(snapH);
  }, []);

  const openDrawer = useCallback(() => {
    setDrawerOpen(true);
    Animated.spring(drawerAnim, { toValue: 0, useNativeDriver: true, friction: 9, tension: 60 }).start();
  }, [drawerAnim]);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    Animated.spring(drawerAnim, { toValue: -DRAWER_WIDTH, useNativeDriver: true, friction: 9, tension: 60 }).start();
  }, [drawerAnim]);

  const navigateFromDrawer = useCallback((screen) => {
    setDrawerOpen(false);
    drawerAnim.setValue(-DRAWER_WIDTH);
    navigation.navigate("AccountStack", { screen });
  }, [drawerAnim, navigation]);

  useEffect(() => {
    if ((ride.canceled && route?.params?.driverId) || ride.denied) {
      ride.actions.makeRideRequest(
        navigation,
        route?.params?.driverId,
        user.user
      );
    }
  }, [ride.canceled, ride.denied, route]);

  useEffect(() => {
    if (!ride.driver && ride.newRideDetails?.polyline.length) {
      ride.actions.calculateFare(
        ride.newRideDetails?.distance.value,
        ride.newRideDetails?.duration.value
      );
    }
  }, [ride.newRideDetails.polyline]);

  useEffect(() => {
    if (ride.driver && ride.step === 4) {
      location.actions.getDirections({
        origin: `${ride.driver.currentLocation.coordinates[1]},${ride.driver.currentLocation.coordinates[0]}`,
        destination: `${ride.newRide.pickUp.location?.latitude},${ride.newRide.pickUp.location?.longitude}`,
        newRideDetails: ride.newRideDetails,
        setNewRideDetails: ride.actions.setNewRideDetails,
        step: ride.step,
        requestId: ride.requestId,
      });
    }
  }, [ride.driver]);

  // Sync animated value → ref so PanResponder always knows current height
  useEffect(() => {
    const id = sheetHeightAnim.addListener(({ value }) => {
      currentSheetHeightRef.current = value;
    });
    return () => sheetHeightAnim.removeListener(id);
  }, []);

  // Animate sheet to first snap when step changes
  useEffect(() => {
    const snaps = getSnaps(ride.step);
    snapRef.current = snaps;
    lastDriverContentHRef.current = 0;
    Animated.spring(sheetHeightAnim, {
      toValue: snaps[0],
      useNativeDriver: false,
      friction: 8,
      tension: 50,
    }).start();
    setSheetSnapHeight(snaps[0]);
  }, [ride.step]);

  // Follow user location when idle (no route active)
  useEffect(() => {
    if (!ride.newRideDetails?.polyline?.length && location.location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.location.latitude,
        longitude: location.location.longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      }, 500);
    }
  }, [location.location]);

  // Re-center on snap height change — Android doesn't auto-adjust for mapPadding changes
  useEffect(() => {
    if (!ride.newRideDetails?.polyline?.length && location.location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.location.latitude,
        longitude: location.location.longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      }, 300);
    }
  }, [sheetSnapHeight]);

  // Fit the full polyline when route is calculated.
  // Using polyline bbox (not just endpoints) handles curved routes like coastal roads.
  useEffect(() => {
    if (!ride.newRideDetails?.polyline?.length) return;
    const coords = Object.values(ride.newRideDetails.polyline);
    if (!coords.length) return;
    const lats = coords.map(p => parseFloat(p.latitude)).filter(v => !isNaN(v));
    const lngs = coords.map(p => parseFloat(p.longitude)).filter(v => !isNaN(v));
    if (!lats.length) return;
    setTimeout(() => {
      const region = computeMapRegion(
        Math.min(...lats), Math.min(...lngs),
        Math.max(...lats), Math.max(...lngs)
      );
      if (region) mapRef.current?.animateToRegion(region, 600);
    }, 400);
  }, [ride.newRideDetails?.polyline?.length]);

  // Track driver movement: bearing, smooth animation, route trimming, live ETA, proximity
  useEffect(() => {
    if (!ride.driver?.currentLocation || ride.step !== 4) return;
    const driverLat = ride.driver.currentLocation.coordinates[1];
    const driverLng = ride.driver.currentLocation.coordinates[0];
    const pickup = ride.newRide.pickUp.location;
    if (!pickup?.latitude) return;

    // Bearing from previous position to current
    if (prevDriverLocRef.current) {
      const bearing = calcBearing(
        prevDriverLocRef.current.lat, prevDriverLocRef.current.lng,
        driverLat, driverLng
      );
      setDriverBearing(bearing);
    }
    prevDriverLocRef.current = { lat: driverLat, lng: driverLng };

    // Route trimming: find the closest polyline point to the driver's current position
    const rawPolyline = ride.newRideDetails?.polyline;
    if (rawPolyline) {
      const polylineArr = Array.isArray(rawPolyline) ? rawPolyline : Object.values(rawPolyline);
      if (polylineArr.length > 0) {
        let minDist = Infinity;
        let minIdx = 0;
        for (let i = 0; i < polylineArr.length; i++) {
          const d = haversineMeters(driverLat, driverLng, polylineArr[i].latitude, polylineArr[i].longitude);
          if (d < minDist) { minDist = d; minIdx = i; }
        }
        setTrimmedPolylineStart(Math.min(minIdx, polylineArr.length - 1));
      }
    }

    // Live ETA: haversine distance / estimated average speed (≈25 km/h)
    const distM = haversineMeters(driverLat, driverLng, parseFloat(pickup.latitude), parseFloat(pickup.longitude));
    if (distM < 80) {
      setLiveEta("< 1 min");
    } else {
      const etaMins = Math.max(1, Math.round(distM / 420));
      setLiveEta(`~${etaMins} min`);
    }

    // Proximity detection: show "almost here" banner when within 300m
    setDriverIsNearby(distM < 300);
  }, [ride.driver?.currentLocation?.coordinates]);

  // Reset driver-approach state when leaving step 4
  useEffect(() => {
    if (ride.step !== 4) {
      setTrimmedPolylineStart(0);
      setLiveEta(null);
      setDriverIsNearby(false);
      prevDriverLocRef.current = null;
      setDriverBearing(0);
    }
  }, [ride.step]);

  useEffect(() => {
    if (user) user.actions.updateLocation();
    location.actions.getCurrentPosition();
    location.actions.getLocationHistory();
    ride.actions.getMapByDrivers();
    ride.actions.validateCountry(user.user);
    ride.actions.validateWorkingHours(user.user);
  }, []);

  useEffect(() => {
    if (ride.step === 5) {
      location.actions.getDirections({
        origin: `${ride.newRide.pickUp.location?.latitude},${ride.newRide.pickUp.location?.longitude}`,
        destination: `${ride.newRide.dropOff.location?.latitude},${ride.newRide.dropOff.location?.longitude}`,
        newRideDetails: ride.newRideDetails,
        setNewRideDetails: ride.actions.setNewRideDetails,
      });
    }
  }, [ride.step]);

  // useEffect(() => {
  //   removeCachedImage("car_v2");
  // }, []);

  // Capture the initial region once — the first render where location is non-null.
  // Cannot use useMemo([]) because location is null on the very first render.
  const initialMapRegionRef = useRef(null);
  if (location.location && !initialMapRegionRef.current) {
    initialMapRegionRef.current = {
      latitude: location.location.latitude,
      longitude: location.location.longitude,
      latitudeDelta: LATITUDE_DELTA,
      longitudeDelta: LONGITUDE_DELTA,
    };
  }

  const handlePanResponder = useMemo(() => {
    let startHeight = SHEET_SNAPS[0][0];
    return PanResponder.create({
      onMoveShouldSetPanResponder: (_, { dy, dx }) =>
        Math.abs(dy) > 8 && Math.abs(dy) > Math.abs(dx) * 1.5,
      onPanResponderGrant: () => {
        sheetHeightAnim.stopAnimation();
        startHeight = currentSheetHeightRef.current;
      },
      onPanResponderMove: (_, { dy }) => {
        const next = Math.max(
          SCREEN_HEIGHT * 0.12,
          Math.min(SCREEN_HEIGHT * 0.88, startHeight - dy)
        );
        sheetHeightAnim.setValue(next);
      },
      onPanResponderRelease: (_, { vy }) => {
        const snaps = snapRef.current;
        const current = currentSheetHeightRef.current;
        let target;
        if (snaps.length === 1) {
          target = snaps[0];
        } else if (vy < -0.4) {
          target = snaps[snaps.length - 1]; // fast swipe up → expand
        } else if (vy > 0.4) {
          target = snaps[0]; // fast swipe down → collapse
        } else {
          target = snaps.reduce((best, s) =>
            Math.abs(s - current) < Math.abs(best - current) ? s : best
          );
        }
        Animated.spring(sheetHeightAnim, {
          toValue: target,
          useNativeDriver: false,
          friction: 8,
          tension: 50,
          overshootClamping: true,
        }).start();
        setSheetSnapHeight(target);
      },
    });
  }, []);

  const onMenuPress = openDrawer;

  const onBackPress = () => {
    if (ride.step === 3) {
      ride.actions.cancelNewRequest();
    }
    navigation.setParams({ driverId: null });
    ride.actions.resetRide();
    if (location.location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.location.latitude,
        longitude: location.location.longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      }, 500);
    }
  };

  const animateToCurrentPosition = async () => {
    const { latitude, longitude } = await location.actions.getCurrentPosition();

    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude,
        longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      });
    }
  };

  if (!location.location) return <LoadingV2 />;

  return (
    <View
      style={{
        flex: 1,
        ...StyleSheet.absoluteFillObject,
        justifyContent: "flex-end",
        backgroundColor: colors.primary,
      }}
    >
      <MapView
        ref={mapRef}
        initialRegion={initialMapRegionRef.current}
        provider={PROVIDER_GOOGLE}
        mapPadding={{ top: insets.top + 60, bottom: insets.bottom + sheetSnapHeight }}
        style={{
          flex: 1,
          width: "100%",
          ...StyleSheet.absoluteFillObject,
        }}
        customMapStyle={theme.isDarkMode ? darkMapStyle : []}
      >
        {location.location && !ride.newRide.dropOff.text && (
          <Marker
            coordinate={{
              latitude: parseFloat(location.location.latitude) || 0,
              longitude: parseFloat(location.location.longitude) || 0,
            }}
          >
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
        {ride.step === 1 &&
          Array.isArray(ride.mapDrivers) &&
          !!ride.mapDrivers.length &&
          ride.mapDrivers.map(({ cab, currentLocation }, index) => {
            return (
              <Marker
                key={index}
                coordinate={{
                  latitude: parseFloat(currentLocation.coordinates[1]) || 0,
                  longitude: parseFloat(currentLocation.coordinates[0]) || 0,
                }}
              >
                <View
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Image
                    source={images[cab?.cabType?.name] || images["bike"]}
                    cacheKey={`${cab?.cabType?.name}_v2`}
                    style={{ width: 40, height: 40 }}
                    resizeMode="contain"
                  />
                </View>
              </Marker>
            );
          })}

        {[2, 3, 4, 5].includes(ride.step) &&
          !!Object.keys(ride.newRide.pickUp.location).length && (
            <Marker
              coordinate={{
                latitude: parseFloat(ride.newRide.pickUp.location.latitude) || 0,
                longitude: parseFloat(ride.newRide.pickUp.location.longitude) || 0,
              }}
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <View style={[markerStyles.pickupDot, { borderColor: colors.primary }]} />
            </Marker>
          )}

        {/* dropOff marker: label card above dot */}
        {[2, 3, 5].includes(ride.step) &&
          !!Object.keys(ride.newRide.dropOff.location).length && (
            <Marker
              coordinate={{
                latitude: parseFloat(ride.newRide.dropOff.location.latitude) || 0,
                longitude: parseFloat(ride.newRide.dropOff.location.longitude) || 0,
              }}
              anchor={{ x: 0.5, y: 1 }}
              onPress={() => navigation.navigate("RideForm")}
            >
              <View style={markerStyles.dropoffWrapper}>
                <View style={[markerStyles.dropoffLabel, { backgroundColor: theme.isDarkMode ? "#1F2937" : "#fff" }]}>
                  <Text numberOfLines={1} style={[markerStyles.dropoffLabelText, { color: colors.text }]}>
                    {ride.newRide.dropOff.text}
                  </Text>
                </View>
                <View style={[markerStyles.dropoffDot, { backgroundColor: colors.error }]} />
              </View>
            </Marker>
          )}

        {ride.step === 4 && ride.driver && (
          <Marker
            ref={destinationMarkerRef}
            coordinate={{
              latitude:
                parseFloat(ride.driver.currentLocation.coordinates[1]) || 0,
              longitude:
                parseFloat(ride.driver.currentLocation.coordinates[0]) || 0,
            }}
            anchor={{ x: 0.5, y: 0.5 }}
            flat
            rotation={driverBearing}
          >
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <Image
                source={images[ride.driver?.cab?.cabType?.name] || images["bike"]}
                cacheKey={`${ride.driver?.cab?.cabType?.name}_v2`}
                style={{ width: 40, height: 40 }}
                resizeMode="contain"
              />
            </View>
          </Marker>
        )}

        {Array.isArray(ride.newRideDetails?.polyline) &&
          !!ride.newRideDetails?.polyline?.length && (
            <>
              <Polyline
                coordinates={Object.values(ride.newRideDetails.polyline).slice(trimmedPolylineStart)}
                strokeColor={colors.primary + "30"}
                strokeWidth={14}
                lineCap="round"
                lineJoin="round"
              />
              <Polyline
                coordinates={Object.values(ride.newRideDetails.polyline).slice(trimmedPolylineStart)}
                strokeColor={colors.primary}
                strokeWidth={5}
                lineCap="round"
                lineJoin="round"
              />
            </>
          )}
      </MapView>
      {/* MENU */}
      {!ride.driver && (
        <TouchableOpacity
          onPress={!ride.newRideDetails?.polyline?.length ? onMenuPress : onBackPress}
          style={{
            position: "absolute",
            top: insets.top + 8,
            left: 20,
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: !ride.newRideDetails?.polyline?.length ? colors.primary : colors.background,
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#000",
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 5,
          }}
        >
          <MaterialCommunityIcons
            name={!ride.newRideDetails?.polyline?.length ? "menu" : "arrow-left"}
            size={26}
            color={!ride.newRideDetails?.polyline?.length ? "#fff" : colors.text}
          />
        </TouchableOpacity>
      )}

      {/* DRAWER OVERLAY */}
      {drawerOpen && (
        <Pressable
          style={{ ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.35)", zIndex: 10 }}
          onPress={closeDrawer}
        />
      )}

      {/* DRAWER PANEL */}
      <Animated.View
        style={[
          drawerStyles.drawer,
          { backgroundColor: colors.background, width: DRAWER_WIDTH, transform: [{ translateX: drawerAnim }] },
        ]}
      >
        {/* Header: tapping navigates to Profile */}
        <RNSafeAreaView edges={["top"]}>
          <TouchableOpacity
            onPress={() => navigateFromDrawer("Profile")}
            style={[drawerStyles.drawerHeader, { borderBottomColor: colors.surfaceVariant ?? "#E5E7EB" }]}
          >
            <View style={[drawerStyles.drawerAvatar, { backgroundColor: colors.primary }]}>
              <Text style={drawerStyles.drawerAvatarText}>
                {`${user.user?.firstName?.charAt(0) ?? ""}${user.user?.lastName?.charAt(0) ?? ""}`.toUpperCase() || "?"}
              </Text>
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={{ fontWeight: "700", fontSize: 16, color: colors.text }} numberOfLines={1}>
                {`${user.user?.firstName ?? ""} ${user.user?.lastName ?? ""}`}
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
                {user.user?.rating > 0 && (
                  <>
                    <Icon name="star" size={13} color="#F59E0B" />
                    <Text style={{ color: "#F59E0B", fontWeight: "700", fontSize: 13, marginLeft: 2 }}>
                      {user.user.rating}
                    </Text>
                  </>
                )}
                {user.user?.totalRides > 0 && (
                  <Text style={{ color: "#9CA3AF", fontSize: 13, marginLeft: user.user?.rating > 0 ? 8 : 0 }}>
                    {user.user.totalRides} rides
                  </Text>
                )}
              </View>
            </View>
            <Icon name="chevron-right" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </RNSafeAreaView>

        <View style={{ flex: 1 }}>
          <DrawerItem icon="format-list-text" label={t("account.ridesHistory")} colors={colors} onPress={() => navigateFromDrawer("RidesHistory")} />
          <DrawerItem icon="comment-text-multiple-outline" label={t("account.feedback")} colors={colors} onPress={() => navigateFromDrawer("Feedback")} />
          <DrawerItem icon="steering" label={t("account.switchToDriver")} colors={colors} onPress={() => { closeDrawer(); app.actions.setApp("partner"); }} />

          {/* Dark mode row */}
          <View style={{ flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingHorizontal: 24 }}>
            <MaterialCommunityIcons name="weather-night" size={22} color={colors.primary} style={{ marginRight: 16 }} />
            <Text style={{ flex: 1, fontSize: 15, color: colors.text, fontWeight: "500" }}>{t("main.darkMode")}</Text>
            <Switch
              value={theme.isDarkMode}
              onValueChange={() => theme.actions.setDarkMode(!theme.isDarkMode)}
              trackColor={{ true: colors.primary }}
              thumbColor="#fff"
            />
          </View>

          <View style={{ marginHorizontal: 24, height: 1, backgroundColor: colors.surfaceVariant ?? "#E5E7EB" }} />
          <DrawerItem icon="exit-to-app" label={t("account.logout")} colors={colors} destructive onPress={() => { closeDrawer(); user.actions.logout(); }} />
        </View>
      </Animated.View>

      {!ride.newRideDetails?.polyline?.length && (
        <TouchableOpacity
          onPress={animateToCurrentPosition}
          style={{
            position: "absolute",
            right: 16,
            bottom: insets.bottom + sheetSnapHeight + 12,
            width: 44,
            height: 44,
            borderRadius: 22,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: theme.isDarkMode ? "#374151" : "#fff",
            shadowColor: "#000",
            shadowOpacity: 0.2,
            shadowRadius: 6,
            elevation: 4,
            zIndex: 4,
          }}
        >
          <Icon name="my-location" size={20} color={colors.primary} />
        </TouchableOpacity>
      )}

      <Animated.View
        {...handlePanResponder.panHandlers}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: sheetHeightWithInsets,
          backgroundColor: theme?.isDarkMode ? colors.background : "#fff",
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          shadowColor: "#000",
          shadowOpacity: 0.15,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: -4 },
          elevation: 10,
          zIndex: 3,
          overflow: "hidden",
        }}
      >
        {/* Drag handle pill */}
        <View style={{ paddingVertical: 10, alignItems: "center" }}>
          <View style={{
            width: 50, height: 5, borderRadius: 3,
            backgroundColor: theme?.isDarkMode ? "#555" : "#e0e0e0",
          }} />
        </View>

        <View style={{ flex: 1, paddingBottom: ride.step === 2 ? FOOTER_H + insets.bottom : 0 }}>
          {ride.rideIsLoading ? (
            <View style={{ height: 80, alignItems: "center", justifyContent: "center", backgroundColor: "transparent" }}>
              <ActivityIndicator animating size="large" color={colors.primary} />
            </View>
          ) : ride.step === 2 ? (
            <RideDetailView user={user} ride={ride} navigation={navigation} onContentHeight={handleRideDetailHeight} />
          ) : ride.step === 3 ? (
            <DriverSearchView ride={ride} onContentHeight={handleDriverContentHeight} />
          ) : ride.step === 4 ? (
            <DriverView ride={ride} liveEta={liveEta} driverIsNearby={driverIsNearby} onContentHeight={handleDriverContentHeight} />
          ) : ride.step === 5 ? (
            <DriverArrivedView ride={ride} onContentHeight={handleDriverContentHeight} />
          ) : ride.step === 6 ? (
            <NoDriverView user={user} ride={ride} navigation={navigation} />
          ) : (
            <WelcomeView user={user} ride={ride} navigation={navigation} location={location} onContentHeight={handleWelcomeHeight} />
          )}
        </View>
      </Animated.View>

      {/* Fixed booking footer — always pinned above insets, never moves with sheet */}
      {ride.step === 2 && !ride.rideIsLoading && (
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: FOOTER_H + insets.bottom,
            backgroundColor: theme?.isDarkMode ? colors.background : "#fff",
            paddingHorizontal: 16,
            paddingTop: 8,
            paddingBottom: insets.bottom + 8,
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: theme?.isDarkMode ? "#374151" : "#E5E7EB",
            zIndex: 5,
            elevation: 6,
          }}
        >
          <Button
            mode="contained"
            disabled={Object.keys(ride.ridePrices).length === 0}
            onPress={() => ride.actions.makeRideRequest(navigation, null, user.user)}
            style={cabViewStyles.bookBtn}
            contentStyle={{ height: 52 }}
          >
            {t("home.bookRide")}
          </Button>
        </View>
      )}
    </View>
  );
}

const WelcomeView = ({ user, ride, navigation, location, onContentHeight }) => {
  const { colors } = useTheme();
  const app = useApp();
  const theme = useMamdooTheme();

  const handleRecentPlace = async (item) => {
    const currentLoc = location.location;
    if (!currentLoc) return;

    const result = await location.actions.getPlaceDetails({
      ...item,
      placeId: item?.placeId || item?.place_id,
    });
    if (!result) return;

    ride.actions.setNewRide({
      ...ride.newRide,
      placeId: result?.placeId,
      pickUp: {
        text: t("home.currentPosition"),
        location: { latitude: currentLoc.latitude, longitude: currentLoc.longitude },
        placeId: null,
      },
      dropOff: {
        text: item.structured_formatting.main_text,
        location: {
          latitude: result.geometry.location.lat,
          longitude: result.geometry.location.lng,
        },
        placeId: result?.placeId,
      },
    });

    ride.actions.setRideIsLoading(true);
    ride.actions.setStep(2);
    location.actions.getDirections({
      origin: `${currentLoc.latitude},${currentLoc.longitude}`,
      destination: `${result.geometry.location.lat},${result.geometry.location.lng}`,
      newRideDetails: ride.newRideDetails,
      setNewRideDetails: ride.actions.setNewRideDetails,
      setStep: ride.actions.setStep,
      setBottomSheetHeight: ride.actions.setBottomSheetHeight,
    });
  };

  return (
    <View onLayout={(e) => onContentHeight?.(e.nativeEvent.layout.height)} style={{ alignItems: "center", paddingBottom: 8 }}>
      <View>
        <Text>
          <Text
            style={{
              ...Classes.text(colors),
              fontSize: 25,
              marginBottom: 10,
            }}
          >
            {t("home.hi")}
          </Text>
          {user.user?.firstName && (
            <Text style={{ fontSize: 20, fontWeight: "bold" }}>
              {user.user?.firstName}
            </Text>
          )}
        </Text>
      </View>
      <View style={{ width: "100%", marginTop: 10 }}>
        <Divider
          style={{
            height: 2,
            ...(!theme.isDarkMode && { backgroundColor: "#e0e0e0" }),
          }}
        />
      </View>
      {ride.validCountry ? (
        ride.validWorkingHours ? (
          <View
            style={{
              alignItems: "center",
              marginTop: 20,
            }}
          >
            <TouchableOpacity
              style={{
                ...Classes.formInput(colors),
                borderRadius: 10,
                justifyContent: "center",
                paddingLeft: 15,
                backgroundColor: theme?.isDarkMode ? "#3B3B3B" : "#e8e8e8",
              }}
              onPress={() => {
                ride.actions.setStep(1);
                ride.actions.setNewRide(defaultNewRide);
                navigation.navigate("RideForm");
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "baseline" }}>
                <Ionicons name="search" size={20} color={colors.primary} />
                <Text
                  variant="titleMedium"
                  style={{
                    color: theme?.isDarkMode ? colors.text : "#565656",
                    fontSize: 20,
                    marginLeft: 10,
                  }}
                >
                  {t("home.whereTo")}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Recent destinations */}
            {location.recentPlaces.length > 0 && (
              <View style={{ width: Classes.formInput(colors).width, marginTop: 4 }}>
                {location.recentPlaces.slice(0, RECENT_PLACES_COUNT).map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleRecentPlace(item)}
                    style={[
                      recentStyles.item,
                      { borderBottomColor: theme.isDarkMode ? "#2D2D2D" : "#EFEFEF" },
                      index === 0 && recentStyles.itemFirst,
                    ]}
                  >
                    <View style={[recentStyles.iconWrap, { backgroundColor: theme.isDarkMode ? "#374151" : "#F3F4F6" }]}>
                      <MaterialCommunityIcons name="clock-outline" size={18} color="#9CA3AF" />
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text
                        numberOfLines={1}
                        style={{ fontSize: 14, fontWeight: "600", color: colors.text }}
                      >
                        {item.structured_formatting.main_text}
                      </Text>
                      {!!item.structured_formatting.secondary_text && (
                        <Text
                          numberOfLines={1}
                          style={{ fontSize: 12, color: "#9CA3AF", marginTop: 1 }}
                        >
                          {item.structured_formatting.secondary_text}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ) : (
          <View
            style={{
              alignItems: "center",
              marginTop: 10,
            }}
          >
            <View style={{ alignItems: "center" }}>
              <Text variant="titleMedium">{t("ride.outsideWorkingHours")}</Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                marginTop: 10,
              }}
            >
              <Chip icon={"timetable"} textStyle={{ fontWeight: "bold" }}>
                {`${app.settings.workingHours?.startHour}${t("ride.am")} ${t(
                  "ride.outsideWorkingHoursTo"
                )} ${app.settings.workingHours?.endHour}${t("ride.pm")}`}
              </Chip>
            </View>
          </View>
        )
      ) : (
        <View
          style={{
            alignItems: "center",
            marginTop: 10,
          }}
        >
          <View style={{ alignItems: "center" }}>
            <Text variant="titleMedium">{t("ride.serviceNotAvailable")}</Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              marginTop: 10,
            }}
          >
            <Chip icon={"map-marker"} textStyle={{ fontWeight: "bold" }}>
              {ride.countryData.countryName}
            </Chip>
          </View>
        </View>
      )}
    </View>
  );
};

const CabCard = ({ cabType, selected, onPress, ridePrices, duration, isDarkMode, colors }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[
      cabStyles.card,
      selected && {
        borderColor: colors.primary,
        backgroundColor: isDarkMode ? colors.primary + "22" : "#E9FDFF",
      },
      !selected && { borderColor: "transparent" },
    ]}
  >
    <Image
      source={images[cabType.name] || images["bike"]}
      cacheKey={`${cabType.name}_v2`}
      style={cabStyles.image}
      resizeMode="contain"
    />
    <View style={cabStyles.info}>
      <View style={cabStyles.nameRow}>
        <Text style={[cabStyles.name, { color: colors.text }]} numberOfLines={1}>
          {cabType.description[lang || "fr"]}
        </Text>
        <MaterialCommunityIcons name="account" size={13} color="#9CA3AF" style={{ marginLeft: 6 }} />
        <Text style={cabStyles.seats}>{cabType.numberOfSeats}</Text>
      </View>
      <Text style={cabStyles.meta} numberOfLines={1}>{duration}</Text>
    </View>
    <View style={cabStyles.priceCol}>
      <Text style={[cabStyles.priceTop, { color: colors.text }]} numberOfLines={1}>
        {ridePrices[cabType.name]?.price?.text}
      </Text>
      <Text style={cabStyles.priceBottom} numberOfLines={1}>
        – {ridePrices[cabType.name]?.maxPrice?.text}
      </Text>
    </View>
  </TouchableOpacity>
);

const RideDetailView = ({ user, ride, navigation, onContentHeight }) => {
  const { colors } = useTheme();
  const theme = useMamdooTheme();

  return (
    <View onLayout={(e) => onContentHeight?.(e.nativeEvent.layout.height)}>
      <Text style={[cabViewStyles.title, { color: colors.text }]}>{t("home.chooseRide")}</Text>
      <Divider style={{ marginHorizontal: 16 }} />
      <View>
        {ride.cabTypes.map((cabType) => (
          <CabCard
            key={cabType._id}
            cabType={cabType}
            selected={ride.newRide.cabTypeId === cabType._id}
            onPress={() => ride.actions.setNewRide({
              ...ride.newRide,
              ...ride.ridePrices[cabType.name],
              cabTypeId: cabType._id,
            })}
            ridePrices={ride.ridePrices}
            duration={ride.newRideDetails?.duration?.text}
            isDarkMode={theme.isDarkMode}
            colors={colors}
          />
        ))}
        <View style={{ height: 8 }} />
      </View>
    </View>
  );
};

const PulseRing = ({ delay = 0, size = 60, color }) => {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = () => {
      scale.setValue(0);
      opacity.setValue(0.6);
      Animated.parallel([
        Animated.timing(scale, { toValue: 1, duration: 2100, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 2100, useNativeDriver: true }),
      ]).start(() => animate());
    };
    const id = setTimeout(animate, delay);
    return () => clearTimeout(id);
  }, []);

  return (
    <Animated.View
      style={{
        position: "absolute",
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 2,
        borderColor: color,
        transform: [{ scale: scale.interpolate({ inputRange: [0, 1], outputRange: [0.4, 2.5] }) }],
        opacity,
      }}
    />
  );
};

const DriverSearchView = ({ ride, onContentHeight }) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const RING_SIZE = 50;

  return (
    <View
      onLayout={onContentHeight ? (e) => onContentHeight(e.nativeEvent.layout.height) : undefined}
      style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: Platform.OS === "android" ? Math.max(insets.bottom, 48) : Math.max(insets.bottom + 8, 16) }}
    >
      <Text variant="titleLarge" style={{ fontWeight: "bold", color: colors.text }}>
        {`${t("ride.driverSearch")}...`}
      </Text>
      <Text style={{ color: "#9CA3AF", fontSize: 13, marginTop: 2 }}>
        {ride.rideRequestMessage || t("ride.wait")}
      </Text>
      <View style={{ alignItems: "center", marginTop: 18 }}>
        <View style={{ width: RING_SIZE * 2.6, height: RING_SIZE * 2.6, alignItems: "center", justifyContent: "center" }}>
          <PulseRing delay={0} size={RING_SIZE} color={colors.primary} />
          <PulseRing delay={650} size={RING_SIZE} color={colors.primary} />
          <PulseRing delay={1300} size={RING_SIZE} color={colors.primary} />
          <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: colors.primary }} />
        </View>
      </View>
    </View>
  );
};

const DriverView = ({ ride, liveEta, driverIsNearby, onContentHeight }) => {
  const { colors } = useTheme();
  const [visible, setVisible] = useState(false);
  const theme = useMamdooTheme();
  const insets = useSafeAreaInsets();

  const driver = ride.driver;
  if (!driver) return null;

  const initials = `${driver.firstName.charAt(0)}${driver.lastName.charAt(0)}`.toUpperCase();
  const isNewDriver = driver.rideCount === 0;
  const etaLabel = liveEta ?? ride.newRideDetails?.duration?.text;

  return (
    <View
      onLayout={onContentHeight ? (e) => onContentHeight(e.nativeEvent.layout.height) : undefined}
      style={{ paddingHorizontal: 16, paddingBottom: Platform.OS === "android" ? Math.max(insets.bottom, 48) : Math.max(insets.bottom + 8, 16) }}
    >
      {/* Phase header */}
      <View style={driverCardStyles.header}>
        <Text style={[driverCardStyles.phaseLabel, { color: colors.text }]}>
          {`${driver.firstName} ${t("ride.isOnHisWay")}`}
        </Text>
        {etaLabel && (
          <View style={[driverCardStyles.etaBadge, { backgroundColor: colors.primary + "18" }]}>
            <Icon name="access-time" size={13} color={colors.primary} />
            <Text style={[driverCardStyles.etaText, { color: colors.primary }]}>
              {etaLabel}
            </Text>
          </View>
        )}
      </View>

      {/* "Almost here" proximity banner */}
      {driverIsNearby && (
        <View style={[driverCardStyles.nearbyBanner, { backgroundColor: colors.primary }]}>
          <Icon name="directions-bike" size={16} color="#fff" />
          <Text style={driverCardStyles.nearbyText}>{t("ride.driverNearby")}</Text>
        </View>
      )}

      {/* Driver card */}
      <View style={[driverCardStyles.card, { backgroundColor: theme.isDarkMode ? "#1F2937" : "#F9FAFB" }]}>
        <View style={driverCardStyles.cardRow}>
          <View style={[driverCardStyles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={driverCardStyles.avatarText}>{initials}</Text>
          </View>

          <View style={driverCardStyles.driverInfo}>
            <Text style={[driverCardStyles.driverName, { color: colors.text }]} numberOfLines={1}>
              {`${driver.firstName} ${driver.lastName}`}
            </Text>
            <View style={driverCardStyles.metaRow}>
              <Icon name="phone" size={12} color="#9CA3AF" />
              <Text style={driverCardStyles.metaText}>{driver.phoneNumber}</Text>
            </View>
            {(driver.avgRating != null || driver.rideCount != null) && (
              <View style={driverCardStyles.statsRow}>
                {driver.avgRating != null && (
                  <>
                    <Icon name="star" size={12} color="#F59E0B" />
                    <Text style={[driverCardStyles.metaText, { color: "#F59E0B", fontWeight: "700", marginRight: 6 }]}>
                      {driver.avgRating}
                    </Text>
                  </>
                )}
                {driver.rideCount != null && (
                  <>
                    <Icon name="two-wheeler" size={12} color={isNewDriver ? colors.primary : "#9CA3AF"} />
                    <Text style={[driverCardStyles.metaText, isNewDriver ? { color: colors.primary, fontWeight: "600" } : {}]}>
                      {isNewDriver ? t("ride.newDriver") : String(driver.rideCount)}
                    </Text>
                  </>
                )}
              </View>
            )}
          </View>

          {driver.cab?.model && (
            <View style={[driverCardStyles.vehicleBox, { backgroundColor: colors.primary + "14" }]}>
              <Image
                source={images[driver.cab?.cabType?.name] || images["bike"]}
                cacheKey={`${driver.cab?.cabType?.name}_v2`}
                style={{ width: 48, height: 34 }}
                resizeMode="contain"
              />
              <Text style={[driverCardStyles.vehicleBoxModel, { color: colors.text }]} numberOfLines={1}>
                {driver.cab.model}
              </Text>
              {driver.cab.licensePlate && (
                <View style={[driverCardStyles.vehiclePlateTag, { backgroundColor: theme.isDarkMode ? "#374151" : "#E5E7EB" }]}>
                  <Text style={[driverCardStyles.vehicleBoxPlate, { color: colors.text }]} numberOfLines={1}>
                    {driver.cab.licensePlate}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </View>

      <Button
        mode="contained"
        icon="phone"
        onPress={ride.actions.callDriver}
        style={driverCardStyles.callBtn}
        contentStyle={{ height: 46 }}
      >
        {t("ride.callDriver")}
      </Button>

      <TouchableOpacity onPress={() => setVisible(true)} style={driverCardStyles.cancelLink}>
        <Text style={[driverCardStyles.cancelText, { color: colors.error }]}>
          {t("ride.cancelRide")}
        </Text>
      </TouchableOpacity>

      <Portal>
        <Modal
          visible={visible}
          onDismiss={() => setVisible(false)}
          style={{ justifyContent: "flex-end" }}
          contentContainerStyle={[cancelModalStyles.sheet, { backgroundColor: colors.background }]}
        >
          <View style={cancelModalStyles.handle} />
          <View style={cancelModalStyles.body}>
            <View style={[cancelModalStyles.icon, { backgroundColor: "#FEE2E2" }]}>
              <Icon name="warning" size={32} color={colors.error} />
            </View>
            <Text variant="titleLarge" style={[cancelModalStyles.title, { color: colors.text }]}>
              {t("ride.cancelConfirmTitle")}
            </Text>
            <Text style={cancelModalStyles.subtitle}>{t("ride.canceConfirmContent")}</Text>
            <View style={cancelModalStyles.buttons}>
              <Button
                mode="contained"
                buttonColor={colors.error}
                icon="close"
                onPress={() => { setVisible(false); ride.actions.cancelRide(); }}
                style={cancelModalStyles.btn}
                contentStyle={cancelModalStyles.btnContent}
              >
                {t("ride.cancelConfirmOk")}
              </Button>
              <Button
                mode="outlined"
                onPress={() => setVisible(false)}
                style={[cancelModalStyles.btn, { borderColor: colors.primary }]}
                contentStyle={cancelModalStyles.btnContent}
              >
                {t("ride.cancelConfirmCancel")}
              </Button>
            </View>
          </View>
        </Modal>
      </Portal>
    </View>
  );
};

const DriverArrivedView = ({ ride, onContentHeight }) => {
  const { colors } = useTheme();
  const [visible, setVisible] = useState(false);
  const theme = useMamdooTheme();
  const insets = useSafeAreaInsets();

  const driver = ride.driver;
  if (!driver) return null;

  const initials = `${driver.firstName.charAt(0)}${driver.lastName.charAt(0)}`.toUpperCase();
  const isNewDriver = driver.rideCount === 0;

  return (
    <View
      onLayout={onContentHeight ? (e) => onContentHeight(e.nativeEvent.layout.height) : undefined}
      style={{ paddingHorizontal: 16, paddingBottom: Platform.OS === "android" ? Math.max(insets.bottom, 48) : Math.max(insets.bottom + 8, 16) }}
    >
      <View style={driverCardStyles.header}>
        <Text style={[driverCardStyles.phaseLabel, { color: colors.text }]}>
          {`${driver.firstName} ${t("ride.driverArrived")}`}
        </Text>
        <View style={[driverCardStyles.etaBadge, { backgroundColor: colors.primary + "18" }]}>
          <Icon name="directions-walk" size={13} color={colors.primary} />
          <Text style={[driverCardStyles.etaText, { color: colors.primary }]}>
            {t("ride.meetHimOutside")}
          </Text>
        </View>
      </View>

      {/* Driver card */}
      <View style={[driverCardStyles.card, { backgroundColor: theme.isDarkMode ? "#1F2937" : "#F9FAFB" }]}>
        <View style={driverCardStyles.cardRow}>
          <View>
            <View style={[driverCardStyles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={driverCardStyles.avatarText}>{initials}</Text>
            </View>
            <View style={[driverCardStyles.arrivedBadge, { backgroundColor: colors.primary }]}>
              <Icon name="check" size={11} color="#fff" />
            </View>
          </View>

          <View style={driverCardStyles.driverInfo}>
            <Text style={[driverCardStyles.driverName, { color: colors.text }]} numberOfLines={1}>
              {`${driver.firstName} ${driver.lastName}`}
            </Text>
            <View style={driverCardStyles.metaRow}>
              <Icon name="phone" size={12} color="#9CA3AF" />
              <Text style={driverCardStyles.metaText}>{driver.phoneNumber}</Text>
            </View>
            {(driver.avgRating != null || driver.rideCount != null) && (
              <View style={driverCardStyles.statsRow}>
                {driver.avgRating != null && (
                  <>
                    <Icon name="star" size={12} color="#F59E0B" />
                    <Text style={[driverCardStyles.metaText, { color: "#F59E0B", fontWeight: "700", marginRight: 6 }]}>
                      {driver.avgRating}
                    </Text>
                  </>
                )}
                {driver.rideCount != null && (
                  <>
                    <Icon name="two-wheeler" size={12} color={isNewDriver ? colors.primary : "#9CA3AF"} />
                    <Text style={[driverCardStyles.metaText, isNewDriver ? { color: colors.primary, fontWeight: "600" } : {}]}>
                      {isNewDriver ? t("ride.newDriver") : String(driver.rideCount)}
                    </Text>
                  </>
                )}
              </View>
            )}
          </View>

          {driver.cab?.model && (
            <View style={[driverCardStyles.vehicleBox, { backgroundColor: colors.primary + "14" }]}>
              <Image
                source={images[driver.cab?.cabType?.name] || images["bike"]}
                cacheKey={`${driver.cab?.cabType?.name}_v2`}
                style={{ width: 48, height: 34 }}
                resizeMode="contain"
              />
              <Text style={[driverCardStyles.vehicleBoxModel, { color: colors.text }]} numberOfLines={1}>
                {driver.cab.model}
              </Text>
              {driver.cab.licensePlate && (
                <View style={[driverCardStyles.vehiclePlateTag, { backgroundColor: theme.isDarkMode ? "#374151" : "#E5E7EB" }]}>
                  <Text style={[driverCardStyles.vehicleBoxPlate, { color: colors.text }]} numberOfLines={1}>
                    {driver.cab.licensePlate}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </View>

      {/* Call + Map row */}
      <View style={driverCardStyles.actionRow}>
        <View style={{ flex: 1, marginRight: 6 }}>
          <Button
            mode="contained"
            icon="phone"
            onPress={ride.actions.callDriver}
            style={driverCardStyles.callBtn}
            contentStyle={{ height: 46 }}
          >
            {t("ride.callDriver")}
          </Button>
        </View>
        <View style={{ flex: 1, marginLeft: 6 }}>
          <Button
            mode="outlined"
            icon="map"
            onPress={ride.actions.openMap}
            style={[driverCardStyles.callBtn, { borderColor: colors.primary }]}
            contentStyle={{ height: 46 }}
          >
            {t("ride.openMap")}
          </Button>
        </View>
      </View>

      <TouchableOpacity onPress={() => setVisible(true)} style={driverCardStyles.cancelLink}>
        <Text style={[driverCardStyles.cancelText, { color: colors.error }]}>
          {t("ride.cancelRide")}
        </Text>
      </TouchableOpacity>

      <Portal>
        <Modal
          visible={visible}
          onDismiss={() => setVisible(false)}
          style={{ justifyContent: "flex-end" }}
          contentContainerStyle={[cancelModalStyles.sheet, { backgroundColor: colors.background }]}
        >
          <View style={cancelModalStyles.handle} />
          <View style={cancelModalStyles.body}>
            <View style={[cancelModalStyles.icon, { backgroundColor: "#FEE2E2" }]}>
              <Icon name="warning" size={32} color={colors.error} />
            </View>
            <Text variant="titleLarge" style={[cancelModalStyles.title, { color: colors.text }]}>
              {t("ride.cancelConfirmTitle")}
            </Text>
            <Text style={cancelModalStyles.subtitle}>{t("ride.canceConfirmContent")}</Text>
            <View style={cancelModalStyles.buttons}>
              <Button
                mode="contained"
                buttonColor={colors.error}
                icon="close"
                onPress={() => { setVisible(false); ride.actions.cancelRide(); }}
                style={cancelModalStyles.btn}
                contentStyle={cancelModalStyles.btnContent}
              >
                {t("ride.cancelConfirmOk")}
              </Button>
              <Button
                mode="outlined"
                onPress={() => setVisible(false)}
                style={[cancelModalStyles.btn, { borderColor: colors.primary }]}
                contentStyle={cancelModalStyles.btnContent}
              >
                {t("ride.cancelConfirmCancel")}
              </Button>
            </View>
          </View>
        </Modal>
      </Portal>
    </View>
  );
};

const NoDriverView = ({ user, ride, navigation }) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const bottomPad = Platform.OS === "android" ? Math.max(insets.bottom, 48) : Math.max(insets.bottom + 8, 16);

  return (
    <View style={{ flex: 1, paddingBottom: bottomPad }}>
      <View style={{ flexDirection: "row", justifyContent: "center", paddingHorizontal: 10 }}>
        <Text variant="titleLarge" style={{ fontWeight: "bold" }}>
          {t("home.noDriver")}
        </Text>
      </View>
      <View style={{ width: "100%", marginTop: 10 }}>
        <Divider style={{ height: 2, backgroundColor: "#e0e0e0" }} />
      </View>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text variant="titleLarge" style={{ textAlign: "center" }}>{t("ride.tryLater")}</Text>
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-evenly", marginTop: 10 }}>
        <Button
          {...Classes.endRideButtonContainer(colors)}
          mode="outlined"
          onPress={() => {
            navigation.setParams({ driverId: null });
            ride.actions.resetRide();
          }}
        >
          {t("ride.end")}
        </Button>
      </View>
    </View>
  );
};

const drawerStyles = StyleSheet.create({
  drawer: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    zIndex: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 16,
  },
  drawerHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  drawerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  drawerAvatarText: { color: "#fff", fontWeight: "bold", fontSize: 18 },
});

const recentStyles = StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
  },
  itemFirst: {
    borderTopWidth: 1,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
});

const markerStyles = StyleSheet.create({
  pickupDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#fff",
    borderWidth: 3,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  dropoffWrapper: {
    alignItems: "center",
  },
  dropoffLabel: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginBottom: 4,
    maxWidth: 180,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  dropoffLabelText: {
    fontSize: 13,
    fontWeight: "600",
  },
  dropoffDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: "#fff",
  },
});

const cabStyles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 12,
    marginVertical: 3,
    borderRadius: 14,
    borderWidth: 2,
  },
  image: { width: 58, height: 42, marginRight: 12, flexShrink: 0 },
  info: { flex: 1, marginRight: 8 },
  nameRow: { flexDirection: "row", alignItems: "center", marginBottom: 3 },
  name: { fontSize: 15, fontWeight: "700", flexShrink: 1 },
  seats: { fontSize: 13, color: "#9CA3AF", marginLeft: 3 },
  meta: { fontSize: 13, color: "#9CA3AF" },
  priceCol: { alignItems: "flex-end", flexShrink: 0 },
  priceTop: { fontSize: 14, fontWeight: "700", textAlign: "right" },
  priceBottom: { fontSize: 12, color: "#9CA3AF", textAlign: "right", marginTop: 1 },
});

const cabViewStyles = StyleSheet.create({
  title: { fontSize: 17, fontWeight: "700", textAlign: "center", paddingTop: 6, paddingBottom: 12 },
  bookWrap: {
    paddingHorizontal: 16,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E5E7EB",
  },
  bookBtn: { borderRadius: 14 },
});

const cancelModalStyles = StyleSheet.create({
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 24,
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#E5E7EB",
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 4,
  },
  body: { paddingHorizontal: 24, paddingTop: 16, alignItems: "center" },
  icon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: { fontWeight: "bold", textAlign: "center", marginBottom: 8 },
  subtitle: { color: "#9CA3AF", fontSize: 14, textAlign: "center", marginBottom: 24 },
  buttons: { width: "100%", gap: 12 },
  btn: { borderRadius: 12, width: "100%" },
  btnContent: { height: 52 },
});

const driverCardStyles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    marginBottom: 10,
    marginTop: 4,
  },
  phaseLabel: { fontSize: 15, fontWeight: "700", flex: 1 },
  etaBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 4,
    flexShrink: 0,
  },
  etaText: { fontSize: 12, fontWeight: "600" },
  card: { borderRadius: 16, overflow: "hidden", marginBottom: 10 },
  cardRow: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  avatarText: { color: "#fff", fontWeight: "bold", fontSize: 15 },
  arrivedBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },
  driverInfo: { flex: 1 },
  driverName: { fontSize: 14, fontWeight: "700", marginBottom: 3 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  statsRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 3 },
  metaText: { color: "#9CA3AF", fontSize: 12 },
  vehicleBox: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 10,
    alignItems: "center",
    minWidth: 76,
    maxWidth: 96,
    flexShrink: 0,
    gap: 3,
  },
  vehicleBoxModel: {
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },
  vehiclePlateTag: {
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 1,
  },
  vehicleBoxPlate: {
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
  },
  actionRow: { flexDirection: "row", marginBottom: 2 },
  callBtn: { borderRadius: 12, marginBottom: 4 },
  cancelLink: { alignItems: "center", paddingVertical: 10 },
  cancelText: { fontSize: 14, fontWeight: "500" },
  nearbyBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  nearbyText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
});
