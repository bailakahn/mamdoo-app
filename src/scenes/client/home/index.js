import React, { useMemo, useEffect, useRef, useState } from "react";
import MapView, {
  PROVIDER_GOOGLE,
  Marker,
  Polyline,
  AnimatedRegion,
} from "react-native-maps";
import { View, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useTheme,
  Text,
  Divider,
  Avatar,
  Chip,
  IconButton,
} from "react-native-paper";
import LottieView from "lottie-react-native";
import PinAnimation from "_assets/animation/dots.json";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useLocation, useRide, useUser, useProxy } from "_hooks";
import { LoadingV2, Button } from "_atoms";
import BottomSheet from "_organisms/BottomSheet";
import { Classes } from "_styles";
import { t } from "_utils/lang";
import { defaultNewRide } from "_store/initialState";
import PopConfirm from "_organisms/PopConfirm";

const LATITUDE_DELTA = 0.009;
const LONGITUDE_DELTA = 0.009;

export default function Home({ navigation }) {
  useProxy();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const location = useLocation();
  const user = useUser();
  const ride = useRide();
  const destinationMarkerRef = useRef();
  const mapRef = useRef();
  const animatedDriverRef = useRef();
  const [animatedDriver, setAnimatedDriver] = useState(
    new AnimatedRegion({
      latitude: 45.55362794417766,
      longitude: -73.60337738507431,
      latitudeDelta: 0.012,
      longitudeDelta: 0.012,
    })
  );

  useEffect(() => {
    if (mapRef.current && ride.newRideDetails.polyline.length) {
      ride.actions.calculateFare(
        ride.newRideDetails?.distance.value,
        ride.newRideDetails?.duration.value
      );
      if (!ride.driver) {
        ride.actions.setBottomSheetHeight(35);
        // setBottomSheetHeight("35%");
      }
      //   mapRef.current.fitToCoordinates(
      //     Object.values(ride.newRideDetails.polyline),
      //     {
      //       edgePadding: {
      //         top: 50,
      //         right: 50,
      //         bottom: 50,
      //         left: 50,
      //       },
      //       animated: true,
      //     }
      //   );

      //   destinationMarkerRef.current &&
      //     destinationMarkerRef.current.showCallout();
    }
  }, [ride.newRideDetails.polyline]);

  useEffect(() => {
    if (ride.driver) {
      //   setMapHeight("73%");
      ride.actions.setBottomSheetHeight(27);
      location.actions.getDirections(
        `${ride.driver.currentLocation.coordinates[1]},${ride.driver.currentLocation.coordinates[0]}`,
        `${ride.newRide.pickUp.location?.latitude},${ride.newRide.pickUp.location?.longitude}`,
        ride.newRideDetails,
        ride.actions.setNewRideDetails
      );
    }
  }, [ride.driver]);

  useEffect(() => {
    location.actions.getCurrentPosition();
    ride.actions.getMapByDrivers();
  }, []);

  const animateMarker = () => {
    var newCoordinate = {
      latitude: 45.55170464095152,
      longitude: -73.59741215249623,
    };

    // if (Platform.OS === "android") {
    //   if (animatedDriverRef.current) {
    //     animatedDriverRef.current.animateMarkerToCoordinate(
    //       newCoordinate,
    //       3000
    //     ); //  number of duration between points
    //   }
    // } else {
    // animatedDriver
    //   .timing({ ...newCoordinate, duration: 3000, useNativeDriver: false })
    //   .start();
    setAnimatedDriver(newCoordinate);
    // }
  };

  const mapRegion = useMemo(() => {
    if (ride.newRideDetails?.polyline?.length) {
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
        longitude: avgLong,
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
    ride.actions.resetRide();
    ride.actions.setBottomSheetHeight(20);
    // setMapHeight("80%");
    navigation.navigate("Home");
  };

  if (!location.location) return <LoadingV2 />;

  return (
    <View
      style={{
        flex: 1,
        ...StyleSheet.absoluteFillObject,
        justifyContent: "flex-end",
        // alignItems: "flex-end",
      }}
    >
      <MapView
        ref={mapRef}
        region={mapRegion}
        provider={PROVIDER_GOOGLE}
        showsUserLocation={true}
        showsMyLocationButton={
          ride.newRideDetails?.polyline?.length ? false : true
        }
        style={{
          flex: 1,
          width: "100%",
          height: ride.mapHeight,
          ...StyleSheet.absoluteFillObject,
        }}
      >
        {/* <Marker.Animated ref={animatedDriverRef} coordinate={animatedDriver} /> */}
        {ride.step === 0 &&
          Array.isArray(ride.mapDrivers) &&
          ride.mapDrivers.map(({ currentLocation }, index) => (
            <Marker
              key={index}
              coordinate={{
                latitude: currentLocation.coordinates[1],
                longitude: currentLocation.coordinates[0],
              }}
            />
          ))}

        {/* show destination marker when dropoff is filled and search completed */}
        {ride.step === 2 && ride.newRide.dropOff && (
          <Marker
            ref={destinationMarkerRef}
            coordinate={{
              latitude: ride.newRide.dropOff.location.latitude,
              longitude: ride.newRide.dropOff.location.longitude,
            }}
            // title={ride.newRide.dropOff.text}
          >
            {/* <View
                  style={{
                    backgroundColor: colors.background,
                    borderWidth: 5,
                    borderColor: "#e8e8e8",
                    borderRadius: 5,
                    padding: 5,
                  }}
                >
                  <Text>{ride.newRide.dropOff.text}</Text>
                </View> */}
            <MaterialCommunityIcons
              name={"google-maps"}
              size={30}
              color={colors.primary}
            />
          </Marker>
        )}

        {Array.isArray(ride.newRideDetails?.polyline) &&
          !!ride.newRideDetails?.polyline?.length && (
            <Polyline
              coordinates={Object.values(ride.newRideDetails?.polyline)}
              strokeColor={colors.primary} // fallback for when `strokeColors` is not supported by the map-provider
              strokeWidth={6}
            />
          )}
      </MapView>
      {/* MENU */}
      <View
        style={{
          padding: 5,
          top: insets.top,
          position: "absolute",
        }}
      >
        <MaterialCommunityIcons
          onPress={
            !ride.newRideDetails?.polyline?.length ? onMenuPress : onBackPress
          }
          name={!ride.newRideDetails?.polyline?.length ? "menu" : "arrow-left"}
          size={30}
        />
      </View>
      <BottomSheet height={ride.bottomSheetHeight}>
        {ride.step === 2 ? (
          <RideDetailView user={user} ride={ride} navigation={navigation} />
        ) : ride.step === 3 ? (
          <DriverSearchView user={user} ride={ride} navigation={navigation} />
        ) : ride.step === 4 ? (
          <DriverView user={user} ride={ride} navigation={navigation} />
        ) : ride.step === 5 ? (
          <DriverArrivedView user={user} ride={ride} navigation={navigation} />
        ) : (
          <WelcomeView user={user} ride={ride} navigation={navigation} />
        )}
        {/* <Button
          {...Classes.buttonContainer(colors)}
          mode="contained"
          onPress={() => {
            animateMarker();
          }}
        >
          <Text variant="titleLarge">{t("home.bookRide")}</Text>
        </Button> */}
      </BottomSheet>
    </View>
  );
}

const WelcomeView = ({ user, ride, navigation }) => {
  const { colors } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
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
        <Divider style={{ height: 2, backgroundColor: "#e0e0e0" }} />
      </View>
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
            backgroundColor: "#e8e8e8",
          }}
          onPress={() => {
            ride.actions.setStep(1);
            ride.actions.setNewRide(defaultNewRide);
            navigation.navigate("RideForm");
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "baseline" }}>
            <Ionicons name="search" size={20} />
            <Text
              variant="titleMedium"
              style={{
                color: "#565656",
                fontSize: 20,
                marginLeft: 10,
              }}
            >
              {t("home.whereTo")}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const RideDetailView = ({ user, ride, navigation }) => {
  const { colors } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        // alignItems: "center",
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "center" }}>
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
        <Divider style={{ height: 2, backgroundColor: "#e0e0e0" }} />
      </View>
      <View
        style={{
          alignItems: "center",
          marginTop: 10,
        }}
      >
        <View>
          <View
            style={{
              borderWidth: 1,
              padding: 10,
              borderRadius: 10,
              alignItems: "center",
              backgroundColor: "#e0e0e0",
              borderColor: "#e0e0e0",
              marginBottom: 5,
            }}
          >
            <Text>{ride.newRide.pickUp?.text}</Text>
          </View>
          <View
            style={{
              //   backgroundColor: "#e0e0e0", // change the color of the divider
              alignItems: "center",
            }}
          >
            <Text>|</Text>
          </View>
          <View
            style={{
              borderWidth: 1,
              padding: 10,
              borderRadius: 10,
              marginTop: 5,
              alignItems: "center",
              backgroundColor: "#e0e0e0",
              borderColor: "#e0e0e0",
            }}
          >
            <Text>{ride.newRide.dropOff?.text}</Text>
          </View>
        </View>
        <View
          style={{
            padding: 10,
            marginTop: 10,
          }}
        >
          <Text
            variant="titleLarge"
            style={{ fontWeight: "bold", color: colors.primary }}
          >
            {`${ride.newRide.price?.text} - ${ride.newRide.maxPrice.text}`}
          </Text>
        </View>
        <View>
          <Button
            {...Classes.buttonContainer(colors)}
            mode="contained"
            disabled={!ride.newRide.price?.value}
            onPress={() => {
              ride.actions.setStep(3);
              ride.actions.makeRideRequest(navigation);
            }}
          >
            <Text variant="titleLarge">{t("home.bookRide")}</Text>
          </Button>
        </View>
      </View>
    </View>
  );
};

const DriverSearchView = ({ user, ride, navigation }) => {
  const { colors } = useTheme();
  const animation = useRef();

  useEffect(() => {
    if (animation.current) animation.current.play();
  }, []);

  return (
    <View
      style={{
        flex: 1,
      }}
    >
      <View
        style={{
          alignItems: "center",
          marginTop: 10,
        }}
      >
        <View>
          <Text variant="titleLarge" style={{ fontWeight: "bold" }}>{`${t(
            "ride.driverSearch"
          )}...`}</Text>
        </View>
        <View
          style={{
            justifyContent: "flex-end",
          }}
        >
          <LottieView
            ref={animation}
            style={[
              // Classes.animation(colors),
              {
                width: 400,
                height: 400,
              },
            ]}
            source={PinAnimation}
          />
        </View>
      </View>
    </View>
  );
};

const DriverView = ({ user, ride, navigation }) => {
  const { colors } = useTheme();
  const [visible, setVisible] = useState(false);

  return (
    <View
      style={{
        flex: 1,
      }}
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
            {`${ride.driver?.firstName} `}
          </Text>
          <Text variant="titleLarge">{t("ride.isOnHisWay")}</Text>
        </View>

        <View>
          <Chip icon={"clock-time-three"}>
            {ride.distanceMatrix?.duration?.text}
          </Chip>
        </View>
      </View>
      <View style={{ width: "100%", marginTop: 10 }}>
        <Divider style={{ height: 2, backgroundColor: "#e0e0e0" }} />
      </View>
      <View
        style={{
          marginTop: 10,
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
              .toUpperCase()}${ride.driver?.lastName.charAt(0).toUpperCase()}`}
          />
        </View>
        <View>
          <Text
            style={{ fontWeight: "bold", fontSize: 20 }}
          >{`${ride.driver?.firstName} ${ride.driver?.lastName}`}</Text>
        </View>
        <View style={{ marginTop: 10 }}>
          <Chip
            icon={"phone"}
            onPress={ride.actions.callDriver}
            textStyle={{ fontSize: 20 }}
          >{`${ride.driver?.phoneNumber}`}</Chip>
        </View>
      </View>
      <View style={Classes.bottonView(colors)}>
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
            // buttonColor={"#dd7973"}
          >
            <Text variant="titleMedium">{t("ride.cancelRide")}</Text>
          </Button>
        </View>
      </View>
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

  return (
    <View
      style={{
        flex: 1,
      }}
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
            {`${ride.driver?.firstName} `}
          </Text>
          <Text variant="titleLarge">{t("ride.driverArrived")}</Text>
        </View>

        <View>
          <Chip icon={"google-street-view"}>{t("ride.meetHimOutside")}</Chip>
        </View>
      </View>
      <View style={{ width: "100%", marginTop: 10 }}>
        <Divider style={{ height: 2, backgroundColor: "#e0e0e0" }} />
      </View>
      <View
        style={{
          marginTop: 10,
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
              .toUpperCase()}${ride.driver?.lastName.charAt(0).toUpperCase()}`}
          />
        </View>
        <View>
          <Text
            style={{ fontWeight: "bold", fontSize: 20 }}
          >{`${ride.driver?.firstName} ${ride.driver?.lastName}`}</Text>
        </View>
        <View style={{ marginTop: 10 }}>
          <Chip
            icon={"phone"}
            onPress={ride.actions.callDriver}
            textStyle={{ fontSize: 20 }}
          >{`${ride.driver?.phoneNumber}`}</Chip>
        </View>
      </View>
      <View style={Classes.bottonView(colors)}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-evenly",
            alignItems: "baseline",
          }}
        >
          <Button
            {...Classes.cancelRideDriverArrivedButtonContainer(colors)}
            mode="outlined"
            onPress={() => {
              setVisible(true);
            }}
          >
            <Text variant="titleMedium">{t("ride.cancelRide")}</Text>
          </Button>
          <IconButton
            // {...Classes.alertButtonContainer(colors)}
            icon="alert-outline"
            size={40}
            mode="outlined"
            containerColor="red"
            iconColor="#fff"
            onPress={() => {
              setVisible(true);
            }}
          />
        </View>
      </View>
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
    </View>
  );
};
