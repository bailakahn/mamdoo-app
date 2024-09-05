import React, { useMemo, useEffect, useRef, useState } from "react";
import MapView, {
  PROVIDER_GOOGLE,
  Marker,
  Polyline,
  AnimatedRegion,
} from "react-native-maps";
import { View, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useTheme,
  Text,
  Divider,
  Avatar,
  Chip,
  Modal,
  Portal,
  Button as OriginalButton,
  Headline,
  List,
} from "react-native-paper";
import LottieView from "lottie-react-native";
import PinAnimation from "_assets/animation/dots.json";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
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
import BottomSheet from "_organisms/BottomSheet";
import { Classes } from "_styles";
import { t, lang } from "_utils/lang";
import { defaultNewRide } from "_store/initialState";
import PopConfirm from "_organisms/PopConfirm";
import { Mixins } from "../../../styles";

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
  const destinationMarkerRef = useRef();
  const mapRef = useRef();

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
      ride.actions.setBottomSheetHeight(35);
    }
  }, [ride.newRideDetails.polyline]);

  useEffect(() => {
    if (ride.driver && ride.step === 4) {
      //   setMapHeight("73%");
      ride.actions.setBottomSheetHeight(27);
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

  useEffect(() => {
    if (user) user.actions.updateLocation();
    location.actions.getCurrentPosition();
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

  const mapRegion = useMemo(() => {
    if (ride.newRideDetails?.polyline?.length) {
      if (ride.step === 4) {
        const lats = ride.newRideDetails?.polyline.map(
          (coord) => coord.latitude
        );
        const lngs = ride.newRideDetails?.polyline.map(
          (coord) => coord.longitude
        );

        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        const minLng = Math.min(...lngs);
        const maxLng = Math.max(...lngs);

        const latDelta = maxLat - minLat;
        const lngDelta = maxLng - minLng;
        const factor = 0.2;
        const adjustedLatDelta = latDelta + latDelta * factor;
        const adjustedLngDelta = lngDelta + lngDelta * factor;

        const latitude = (minLat + maxLat) / 2;
        const longitude = (minLng + maxLng) / 2;

        return {
          latitude,
          longitude,
          latitudeDelta: adjustedLatDelta,
          longitudeDelta: adjustedLngDelta,
        };
      }

      let sumLat = ride.newRideDetails?.polyline.reduce((a, c) => {
        return parseFloat(a) + parseFloat(c.latitude);
      }, 0);
      let sumLong = ride.newRideDetails?.polyline.reduce((a, c) => {
        return parseFloat(a) + parseFloat(c.longitude);
      }, 0);

      let avgLat = sumLat / ride.newRideDetails?.polyline.length || 0;
      let avgLong = sumLong / ride.newRideDetails?.polyline.length || 0;

      return {
        latitude: parseFloat(avgLat),
        longitude: parseFloat(avgLong),
        latitudeDelta: 0.2,
        longitudeDelta: 0.2,
      };
    }

    return {
      latitude: location.location?.latitude,
      longitude: location.location?.longitude,
      latitudeDelta: LATITUDE_DELTA,
      longitudeDelta: LONGITUDE_DELTA,
    };
  }, [location.location, ride.newRideDetails.polyline]);

  const onMenuPress = () => {
    navigation.navigate("AccountStack");
  };

  const onBackPress = () => {
    if (ride.step === 3) {
      ride.actions.cancelNewRequest();
    }
    navigation.setParams({ driverId: null });
    ride.actions.resetRide();
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
        region={mapRegion}
        provider={PROVIDER_GOOGLE}
        mapPadding={{ top: 20 }}
        style={{
          flex: 1,
          width: "100%",
          // height: ride.mapHeight,
          ...StyleSheet.absoluteFillObject,
        }}
        customMapStyle={
          theme.isDarkMode
            ? [
                {
                  elementType: "geometry",
                  stylers: [
                    {
                      color: "#242f3e",
                    },
                  ],
                },
                {
                  elementType: "labels.text.fill",
                  stylers: [
                    {
                      color: "#746855",
                    },
                  ],
                },
                {
                  elementType: "labels.text.stroke",
                  stylers: [
                    {
                      color: "#242f3e",
                    },
                  ],
                },
                {
                  featureType: "administrative.locality",
                  elementType: "labels.text.fill",
                  stylers: [
                    {
                      color: "#d59563",
                    },
                  ],
                },
                {
                  featureType: "poi",
                  elementType: "labels.text.fill",
                  stylers: [
                    {
                      color: "#d59563",
                    },
                  ],
                },
                {
                  featureType: "poi.park",
                  elementType: "geometry",
                  stylers: [
                    {
                      color: "#263c3f",
                    },
                  ],
                },
                {
                  featureType: "poi.park",
                  elementType: "labels.text.fill",
                  stylers: [
                    {
                      color: "#6b9a76",
                    },
                  ],
                },
                {
                  featureType: "road",
                  elementType: "geometry",
                  stylers: [
                    {
                      color: "#38414e",
                    },
                  ],
                },
                {
                  featureType: "road",
                  elementType: "geometry.stroke",
                  stylers: [
                    {
                      color: "#212a37",
                    },
                  ],
                },
                {
                  featureType: "road",
                  elementType: "labels.text.fill",
                  stylers: [
                    {
                      color: "#9ca5b3",
                    },
                  ],
                },
                {
                  featureType: "road.highway",
                  elementType: "geometry",
                  stylers: [
                    {
                      color: "#746855",
                    },
                  ],
                },
                {
                  featureType: "road.highway",
                  elementType: "geometry.stroke",
                  stylers: [
                    {
                      color: "#1f2835",
                    },
                  ],
                },
                {
                  featureType: "road.highway",
                  elementType: "labels.text.fill",
                  stylers: [
                    {
                      color: "#f3d19c",
                    },
                  ],
                },
                {
                  featureType: "transit",
                  elementType: "geometry",
                  stylers: [
                    {
                      color: "#2f3948",
                    },
                  ],
                },
                {
                  featureType: "transit.station",
                  elementType: "labels.text.fill",
                  stylers: [
                    {
                      color: "#d59563",
                    },
                  ],
                },
                {
                  featureType: "water",
                  elementType: "geometry",
                  stylers: [
                    {
                      color: "#17263c",
                    },
                  ],
                },
                {
                  featureType: "water",
                  elementType: "labels.text.fill",
                  stylers: [
                    {
                      color: "#515c6d",
                    },
                  ],
                },
                {
                  featureType: "water",
                  elementType: "labels.text.stroke",
                  stylers: [
                    {
                      color: "#17263c",
                    },
                  ],
                },
              ]
            : []
        }
      >
        {location.location && !ride.newRide.dropOff.text && (
          <Marker
            coordinate={{
              latitude: parseFloat(location.location.latitude) || 0,
              longitude: parseFloat(location.location.longitude) || 0,
            }}
          >
            <Image
              source={require("_assets/client.png")}
              cacheKey={"client"}
              style={{ width: 50, height: 50 }}
              resizeMode="contain"
            />
          </Marker>
        )}
        {/* <Marker.Animated ref={animatedDriverRef} coordinate={animatedDriver} /> */}
        {ride.step === 1 &&
          Array.isArray(ride.mapDrivers) &&
          !!ride.mapDrivers.length &&
          ride.mapDrivers.map(({ currentLocation }, index) => (
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
                  source={require("_assets/motorbike.png")}
                  cacheKey="motorbike"
                  style={{ width: 50, height: 50 }}
                  resizeMode="contain"
                />
              </View>
            </Marker>
          ))}

        {[2, 3, 4, 5].includes(ride.step) &&
          !!Object.keys(ride.newRide.pickUp.location).length && (
            <Marker
              ref={destinationMarkerRef}
              coordinate={{
                latitude:
                  parseFloat(ride.newRide.pickUp.location.latitude) || 0,
                longitude:
                  parseFloat(ride.newRide.pickUp.location.longitude) || 0,
              }}
            >
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: theme.isDarkMode
                      ? colors.background
                      : "#fff",
                    padding: 5,
                    marginBottom: 5,
                  }}
                >
                  <Text variant="titleMedium">{ride.newRide.pickUp.text}</Text>
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={20}
                    color="gray"
                  />
                </View>
                <Image
                  source={require("_assets/dot.png")}
                  cacheKey="dot"
                  style={{ width: 30, height: 30 }}
                  resizeMode="contain"
                />
              </View>
            </Marker>
          )}

        {/* show dropOff marker when dropoff is filled and search completed */}
        {[2, 3, 5].includes(ride.step) &&
          !!Object.keys(ride.newRide.dropOff.location).length &&
          !ride.driver && (
            <Marker
              ref={destinationMarkerRef}
              coordinate={{
                latitude:
                  parseFloat(ride.newRide.dropOff.location.latitude) || 0,
                longitude:
                  parseFloat(ride.newRide.dropOff.location.longitude) || 0,
              }}
              onPress={() => {
                navigation.navigate("RideForm");
              }}
            >
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: theme.isDarkMode
                      ? colors.background
                      : "#fff",
                    padding: 5,
                    marginBottom: 5,
                  }}
                >
                  <Text variant="titleMedium">{ride.newRide.dropOff.text}</Text>
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={20}
                    color="gray"
                  />
                </View>
                <Image
                  source={require("_assets/destination.png")}
                  cacheKey="destination"
                  style={{ width: 50, height: 50 }}
                  resizeMode="contain"
                />
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
          >
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Image
                source={require("_assets/motorbike.png")}
                cacheKey="motirbike"
                style={{ width: 50, height: 50 }}
                resizeMode="contain"
              />
            </View>
          </Marker>
        )}

        {Array.isArray(ride.newRideDetails?.polyline) &&
          !!ride.newRideDetails?.polyline?.length && (
            <Polyline
              coordinates={Object.values(ride.newRideDetails?.polyline)}
              strokeColor={colors.primary} // fallback for when `strokeColors` is not supported by the map-provider
              strokeWidth={5}
            />
          )}
      </MapView>
      {ride.driverArrived && (
        <TouchableOpacity
          style={{
            // height: ride.mapHeight,
            backgroundColor: "rgba(255, 255, 255, 0.5)",
            zIndex: 1,
            alignItems: "center",
            justifyContent: "center",
            ...StyleSheet.absoluteFillObject,
          }}
          onPress={() => {
            ride.actions.openMap();
          }}
        >
          <Text variant="titleLarge" style={{ fontWeight: "bold" }}>
            {t("ride.ongoingRide")}
          </Text>
          <Text variant="titleLarge" style={{ fontWeight: "bold" }}>
            {t("ride.clickToOpenTheMap")}
          </Text>
        </TouchableOpacity>
      )}
      {/* MENU */}
      {!ride.driver && (
        <View
          style={{
            padding: 5,
            top: insets.top,
            position: "absolute",
            marginLeft: 20,
            backgroundColor: colors.background,
            borderRadius: 50,
          }}
        >
          <MaterialCommunityIcons
            onPress={
              !ride.newRideDetails?.polyline?.length ? onMenuPress : onBackPress
            }
            name={
              !ride.newRideDetails?.polyline?.length ? "menu" : "arrow-left"
            }
            size={30}
            color={colors.text}
          />
        </View>
      )}

      {!ride.newRideDetails?.polyline?.length && (
        <View
          style={{
            alignItems: "flex-end",
            marginBottom: 15,
            marginRight: 10,
          }}
        >
          <TouchableOpacity
            style={{
              backgroundColor: "#fff",
              borderRadius: 30,
              padding: 10,
              width: 60,
              height: 60,
              alignItems: "center",
              justifyContent: "center",
              shadowOpacity: 0.3,
            }}
            onPress={animateToCurrentPosition}
          >
            <MaterialCommunityIcons
              name="crosshairs-gps"
              size={25}
              color="gray"
            />
          </TouchableOpacity>
        </View>
      )}

      <BottomSheet
        height={ride.bottomSheetHeight}
        isLoading={ride.rideIsLoading}
      >
        {ride.step === 2 ? (
          <RideDetailView user={user} ride={ride} navigation={navigation} />
        ) : ride.step === 3 ? (
          <DriverSearchView user={user} ride={ride} navigation={navigation} />
        ) : ride.step === 4 ? (
          <DriverView user={user} ride={ride} navigation={navigation} />
        ) : ride.step === 5 ? (
          <DriverArrivedView user={user} ride={ride} navigation={navigation} />
        ) : ride.step === 6 ? (
          <NoDriverView user={user} ride={ride} navigation={navigation} />
        ) : (
          <WelcomeView user={user} ride={ride} navigation={navigation} />
        )}
      </BottomSheet>
    </View>
  );
}

const WelcomeView = ({ user, ride, navigation }) => {
  const { colors } = useTheme();
  const app = useApp();
  const theme = useMamdooTheme();

  return (
    <View
      style={{
        // flex: 1,
        alignItems: "center",
        overflow: "hidden",
      }}
    >
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
              marginBottom: 10,
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

const RideDetailView = ({ user, ride, navigation }) => {
  const { colors } = useTheme();
  const theme = useMamdooTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={
        {
          // flex: 1,
          // alignItems: "center",
        }
      }
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginLeft: 10,
          marginRight: 10,
        }}
      >
        <View style={{ flexDirection: "row" }}>
          <Text
            style={{
              ...Classes.text(colors),
              fontSize: 15,
              fontWeight: "bold",
            }}
          >
            {t("home.distance")}
          </Text>
          <Text style={{ fontSize: 15 }}>
            {ride.newRideDetails?.distance.text}
          </Text>
        </View>

        <View style={{ flexDirection: "row" }}>
          <Text
            style={{
              ...Classes.text(colors),
              fontSize: 15,
              fontWeight: "bold",
              marginLeft: 5,
            }}
          >
            {t("home.estimatedTime")}
          </Text>
          {ride.newRideDetails?.distance && (
            <Text style={{ fontSize: 15 }}>
              {ride.newRideDetails?.duration.text}
            </Text>
          )}
        </View>
      </View>
      <View style={{ width: "100%", marginTop: 10 }}>
        <Divider
          style={{
            height: 2,
            ...(!theme.isDarkMode && { backgroundColor: "#e0e0e0" }),
          }}
        />
      </View>
      <View style={{ alignItems: "center" }}>
        <ScrollView>
          <View
            style={{
              alignItems: "center",
              marginTop: 10,
            }}
          >
            {ride.cabTypes.map((cabType, index) => (
              <View
                key={index}
                style={{
                  width: "100%",
                  backgroundColor: "#E9FDFF",
                  borderRadius: 10,
                  paddingLeft: 10,
                  marginTop: 10,
                }}
              >
                <TouchableOpacity>
                  <List.Item
                    title={
                      <Text
                        variant="titleLarge"
                        style={{
                          fontWeight: "bold",
                          ...(theme.isDarkMode && { color: "#000" }),
                        }}
                      >
                        {cabType.description[lang || "fr"]}
                      </Text>
                    }
                    description={
                      <Text
                        style={{
                          ...(theme.isDarkMode && { color: "#000" }),
                        }}
                      >
                        {ride.newRideDetails?.duration.text}
                      </Text>
                    }
                    left={() => (
                      <View
                        style={{ marginRight: 10, justifyContent: "center" }}
                      >
                        <Image
                          source={require("_assets/bike.png")}
                          cacheKey="motorbike"
                          style={{ width: 50, height: 50 }}
                          resizeMode="contain"
                        />
                      </View>
                    )}
                    right={() => (
                      <View style={{ justifyContent: "flex-start" }}>
                        <View>
                          <Text
                            variant="titleMedium"
                            style={{
                              fontWeight: "bold",
                              ...(theme.isDarkMode && { color: "#000" }),
                            }}
                          >
                            {`${ride.newRide.price.text}`}
                          </Text>
                        </View>
                        <View style={{ alignItems: "center" }}>
                          <Text
                            variant="titleMedium"
                            style={{
                              fontWeight: "bold",
                              ...(theme.isDarkMode && { color: "#000" }),
                            }}
                          >
                            à
                          </Text>
                        </View>
                        <View>
                          <Text
                            variant="titleMedium"
                            style={{
                              fontWeight: "bold",
                              ...(theme.isDarkMode && { color: "#000" }),
                            }}
                          >
                            {`${ride.newRide.maxPrice.text}`}
                          </Text>
                        </View>
                      </View>
                    )}
                  />
                </TouchableOpacity>
              </View>
            ))}

            <View style={{ marginBottom: insets.bottom }}>
              <Button
                {...Classes.buttonContainer(colors)}
                mode="contained"
                disabled={!ride.newRide.price?.value}
                onPress={() => {
                  // ride.actions.setStep(3);
                  ride.actions.makeRideRequest(navigation, null, user.user);
                }}
              >
                {t("home.bookRide")}
              </Button>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const DriverSearchView = ({ user, ride, navigation }) => {
  const { colors } = useTheme();
  const animation = useRef();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (animation.current) animation.current.play();
  }, []);

  return (
    <View
      style={
        {
          // flex: 1,
        }
      }
    >
      <ScrollView>
        <View
          style={{
            alignItems: "center",
          }}
        >
          <Text variant="titleLarge" style={{ fontWeight: "bold" }}>{`${t(
            "ride.driverSearch"
          )}...`}</Text>
        </View>

        <View
          style={{
            ...Classes.driverSearchAnimation(colors),
            marginBottom: insets.bottom,
            alignItems: "center",
            alignSelf: "center",
          }}
        >
          <LottieView
            ref={animation}
            source={PinAnimation}
            style={{
              flex: 1,
              width: Mixins.width(0.7, true),
            }}
            autoPlay
            loop
          />
        </View>
      </ScrollView>
    </View>
  );
};

const DriverView = ({ user, ride, navigation }) => {
  const { colors } = useTheme();
  const [visible, setVisible] = useState(false);
  const theme = useMamdooTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={
        {
          // flex: 1,
        }
      }
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          paddingLeft: 10,
          paddingRight: 10,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "baseline" }}>
          <Text
            style={{
              ...Classes.text(colors),
              //   fontSize: 15,
              fontWeight: "bold",
            }}
            variant="titleLarge"
          >
            {`${
              ride.driver?.firstName?.split(" ")[0].length < 15
                ? ride.driver?.firstName?.split(" ")[0]
                : ride.driver?.firstName?.split(" ")[0].substring(0, 10 - 3) +
                  "..."
            } `}
          </Text>
          <Text variant="titleLarge">{t("ride.isOnHisWay")}</Text>
        </View>

        <View>
          <Chip
            icon={"clock-time-three"}
            style={{
              ...(theme?.isDarkMode && { backgroundColor: "#3B3B3B" }),
            }}
            textStyle={{ color: colors.text }}
          >
            {ride.newRideDetails?.duration?.text}
          </Chip>
        </View>
      </View>
      <View style={{ width: "100%", marginTop: 10 }}>
        <Divider
          style={{
            height: 2,
            ...(!theme.isDarkMode && { backgroundColor: "#e0e0e0" }),
          }}
        />
      </View>
      <ScrollView>
        <View
          style={{
            marginTop: 20,
            marginBottom: 20,
            flexDirection: "row",
            justifyContent: "space-around",
            alignItems: "center",
          }}
        >
          <View style={{ marginTop: 10 }}>
            <Avatar.Text
              size={70}
              label={`${ride.driver?.firstName
                .charAt(0)
                .toUpperCase()}${ride.driver?.lastName
                .charAt(0)
                .toUpperCase()}`}
            />
          </View>
          <View>
            <Text style={{ fontWeight: "bold", fontSize: 20 }}>{`${
              ride.driver?.firstName.split(" ")[0].length < 15
                ? ride.driver?.firstName.split(" ")[0]
                : ride.driver?.firstName.split(" ")[0].substring(0, 10 - 3) +
                  "..."
            }`}</Text>
            <Text style={{ fontWeight: "bold", fontSize: 20 }}>{`${
              ride.driver?.lastName.split(" ")[0].length < 15
                ? ride.driver?.lastName.split(" ")[0]
                : ride.driver?.lastName.split(" ")[0].substring(0, 10 - 3) +
                  "..."
            }`}</Text>
          </View>
          <View style={{ marginTop: 10 }}>
            <Chip
              icon={"phone"}
              onPress={ride.actions.callDriver}
              style={{
                ...(theme?.isDarkMode && { backgroundColor: "#3B3B3B" }),
              }}
              textStyle={{ fontSize: 20, color: colors.text }}
            >{`${ride.driver?.phoneNumber}`}</Chip>
          </View>
        </View>
        {ride.driver?.cab && (
          <View
            style={{
              width: "100%",
              paddingLeft: 20,
              paddingRight: 20,
            }}
          >
            <Text
              variant="titleSmall"
              style={{
                fontWeight: "bold",
                ...(theme.isDarkMode && { color: "#000" }),
              }}
            >
              {`${t("ride.bike")}: ${ride.driver?.cab.model}-${
                ride.driver?.cab.licensePlate
              }`}
            </Text>
          </View>
        )}
        <View style={{ marginBottom: insets.bottom }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-evenly",
              marginTop: 10,
            }}
          >
            <Button
              {...Classes.cancelRideButtonContainer(colors)}
              mode="outlined"
              onPress={() => {
                setVisible(true);
              }}
              textColor={colors.error}
              // buttonColor={"#dd7973"}
            >
              {t("ride.cancelRide")}
            </Button>
          </View>
        </View>
      </ScrollView>
      <PopConfirm
        title={t("ride.cancelConfirmTitle")}
        visible={visible}
        setVisible={setVisible}
        content={t("ride.canceConfirmContent")}
        onCancel={() => setVisible(false)}
        cancelText={
          <Text variant="titleLarge">{t("ride.cancelConfirmCancel")}</Text>
        }
        onConfirm={() => {
          setVisible(false);
          ride.actions.cancelRide();
        }}
        okText={
          <Text variant="titleLarge" style={{ color: colors.error }}>
            {t("ride.cancelConfirmOk")}
          </Text>
        }
        // isRounded={true}
      />
    </View>
  );
};

const DriverArrivedView = ({ user, ride, navigation }) => {
  const { colors } = useTheme();
  const [visible, setVisible] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const theme = useMamdooTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={
        {
          // flex: 1,
        }
      }
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          paddingLeft: 10,
          paddingRight: 10,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "baseline" }}>
          <Text
            style={{
              ...Classes.text(colors),
              fontWeight: "bold",
            }}
            variant="titleLarge"
          >
            {`${
              ride.driver?.firstName?.split(" ")[0].length < 15
                ? ride.driver?.firstName?.split(" ")[0]
                : ride.driver?.firstName?.split(" ")[0].substring(0, 10 - 3) +
                  "..."
            } `}
          </Text>
          <Text variant="titleLarge">{t("ride.driverArrived")}</Text>
        </View>

        <View>
          <Chip
            icon={"google-street-view"}
            style={{
              ...(theme?.isDarkMode && { backgroundColor: "#3B3B3B" }),
            }}
            textStyle={{ color: colors.text }}
          >
            {t("ride.meetHimOutside")}
          </Chip>
        </View>
      </View>
      <View style={{ width: "100%", marginTop: 10 }}>
        <Divider
          style={{
            height: 2,
            ...(!theme.isDarkMode && { backgroundColor: "#e0e0e0" }),
          }}
        />
      </View>
      <ScrollView>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            alignItems: "center",
            marginBottom: 20,
            marginTop: 20,
          }}
        >
          <View style={{ marginTop: 10 }}>
            <Avatar.Text
              size={70}
              label={`${ride.driver?.firstName
                .charAt(0)
                .toUpperCase()}${ride.driver?.lastName
                .charAt(0)
                .toUpperCase()}`}
            />
          </View>
          <View>
            <Text style={{ fontWeight: "bold", fontSize: 20 }}>{`${
              ride.driver?.firstName.split(" ")[0].length < 15
                ? ride.driver?.firstName.split(" ")[0]
                : ride.driver?.firstName.split(" ")[0].substring(0, 10 - 3) +
                  "..."
            }`}</Text>
            <Text style={{ fontWeight: "bold", fontSize: 20 }}>{`${
              ride.driver?.lastName.split(" ")[0].length < 15
                ? ride.driver?.lastName.split(" ")[0]
                : ride.driver?.lastName.split(" ")[0].substring(0, 10 - 3) +
                  "..."
            }`}</Text>
          </View>
          <View style={{ marginTop: 10 }}>
            <Chip
              icon={"phone"}
              onPress={ride.actions.callDriver}
              style={{
                ...(theme?.isDarkMode && { backgroundColor: "#3B3B3B" }),
              }}
              textStyle={{ fontSize: 20, color: colors.text }}
            >{`${ride.driver?.phoneNumber}`}</Chip>
          </View>
        </View>
        {ride.driver?.cab && (
          <View
            style={{
              width: "100%",
              paddingLeft: 20,
              paddingRight: 20,
            }}
          >
            <Text
              variant="titleSmall"
              style={{
                fontWeight: "bold",
                ...(theme.isDarkMode && { color: "#000" }),
              }}
            >
              {`${t("ride.bike")}: ${ride.driver?.cab.model}-${
                ride.driver?.cab.licensePlate
              }`}
            </Text>
          </View>
        )}
        <View style={{ marginBottom: insets.bottom, marginTop: 10 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-evenly",
              // alignItems: "baseline",
            }}
          >
            <Button
              {...Classes.cancelRideDriverArrivedButtonContainer(colors)}
              mode="outlined"
              onPress={() => {
                setVisible(true);
              }}
              textColor={colors.error}
            >
              {t("ride.cancelRide")}
            </Button>
            <TouchableOpacity
              style={{
                ...Classes.alertButtonContainer(colors),
                borderWidth: 1,
                borderRadius: 30,
                backgroundColor: colors.primary,
                borderColor: colors.primary,
              }}
              onPress={() => {
                ride.actions.openMap();
              }}
            >
              <MaterialCommunityIcons
                name="map-outline"
                size={40}
                color="#fff"
              />
            </TouchableOpacity>
            {/* <TouchableOpacity
              style={{
                ...Classes.alertButtonContainer(colors),
                borderWidth: 1,
                borderRadius: 30,
                backgroundColor: "red",
                borderColor: "red",
              }}
              onLongPress={() => {
                setAlertVisible(true);
              }}
              delayLongPress={2000}
            >
              <MaterialCommunityIcons
                name="alert-outline"
                size={40}
                color="#fff"
              />
            </TouchableOpacity> */}
          </View>
        </View>
      </ScrollView>
      <PopConfirm
        title={t("ride.cancelConfirmTitle")}
        visible={visible}
        setVisible={setVisible}
        content={t("ride.canceConfirmContent")}
        onCancel={() => setVisible(false)}
        cancelText={
          <Text variant="titleLarge">{t("ride.cancelConfirmCancel")}</Text>
        }
        onConfirm={() => {
          setVisible(false);
          ride.actions.cancelRide();
        }}
        okText={
          <Text variant="titleLarge" style={{ color: colors.error }}>
            {t("ride.cancelConfirmOk")}
          </Text>
        }
      />
      {/* <Portal>
        <Modal
          contentContainerStyle={Classes.modal(colors)}
          style={Classes.modalWrapper(colors)}
          onDismiss={setAlertVisible}
          visible={alertVisible}
        >
          <View style={{ alignItems: "center" }}>
            <Headline>{t("ride.alertTitle")}</Headline>
          </View>
          <View>
            <Text variant="titleMedium" style={{ textAlign: "center" }}>
              {t("ride.alertDescription")}
            </Text>
          </View>

          <View style={{ marginTop: 20, alignItems: "center" }}>
            <View>
              <OriginalButton
                {...Classes.alertConfirmButtonContainer(colors)}
                mode="contained"
                onPress={() => {
                  ride.actions.getPoliceStations();
                }}
                buttonColor={"red"}
              >
                <Text variant="titleMedium" style={{ color: "#fff" }}>
                  {t("ride.alertButtonConfirm")}
                </Text>
              </OriginalButton>
            </View>

            <View style={{ marginTop: 20 }}>
              <OriginalButton
                {...Classes.alertCancelButtonContainer(colors)}
                mode="contained"
                onPress={() => {
                  setAlertVisible(false);
                }}
                buttonColor={"#fff"}
              >
                <Text variant="titleMedium">{t("ride.alertButtonCancel")}</Text>
              </OriginalButton>
            </View>
          </View>
        </Modal>
      </Portal> */}
    </View>
  );
};

const NoDriverView = ({ user, ride, navigation }) => {
  const { colors } = useTheme();
  const app = useApp();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={
        {
          // flex: 1,
        }
      }
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          paddingLeft: 10,
          paddingRight: 10,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "baseline" }}>
          <Text variant="titleLarge" style={{ fontWeight: "bold" }}>
            {t("home.noDriver")}
          </Text>
        </View>
      </View>
      <View style={{ width: "100%", marginTop: 10 }}>
        <Divider style={{ height: 2, backgroundColor: "#e0e0e0" }} />
      </View>

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
        }}
      >
        <View
          style={{
            marginTop: 10,
            alignItems: "center",
          }}
        >
          {/* <View>
            <Text variant="titleMedium">{t("ride.noMamdoo")}</Text>
          </View> */}
          <View style={{ marginTop: 20 }}>
            <Text variant="titleLarge">{t("ride.tryLater")}</Text>
          </View>
          {/* <View style={{ marginTop: 10, flexDirection: "row" }}>
            <Chip
              icon={"phone"}
              onPress={app.actions.call}
              textStyle={{ fontSize: 20 }}
            >{`${
              app.actions.isWorkingHours()
                ? app.settings.phone
                : app.settings.secondPhoneNumber
            }`}</Chip>
          </View> */}
          {/* <View style={{ marginTop: 20, flexDirection: "row" }}>
            <Button
              {...Classes.callUsButtonContainer(colors)}
              mode="contained"
              onPress={app.actions.call}
            >
              {t("ride.callUs")}
            </Button>
          </View> */}
          {/* <View>
            <Text variant="titleSmall">{t("ride.toFindYouADriver")}</Text>
          </View> */}
        </View>
        <View style={{ marginBottom: insets.bottom, marginTop: 20 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-evenly",
              marginTop: 10,
            }}
          >
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
      </ScrollView>
    </View>
  );
};
