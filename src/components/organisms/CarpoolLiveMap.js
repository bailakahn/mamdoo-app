import React, { useEffect, useMemo, useRef } from "react";
import { StyleSheet, View } from "react-native";
import MapView, { PROVIDER_GOOGLE, Marker, MarkerAnimated, AnimatedRegion, Polyline } from "react-native-maps";
import Icon from "@expo/vector-icons/MaterialIcons";
import { useTheme } from "_hooks";
import { darkMapStyle } from "_styles/mapStyles";
import { stopPoint } from "_utils/carpoolRoute";

// Positions arrive about every 10 seconds; the marker glides between them instead
// of jumping, which is most of what makes tracking feel live.
const GLIDE_MS = 2500;

// The rider's live view of the car: the route, their pickup and drop-off stops,
// and the car moving along it.
export default function CarpoolLiveMap({ stopSequence = [], carFix, boardIndex, exitIndex, color }) {
  const theme = useTheme();
  const mapRef = useRef(null);
  const fittedRef = useRef(false);

  const routeLine = useMemo(() => stopSequence.map(stopPoint).filter(Boolean), [stopSequence]);
  const board = stopPoint(stopSequence[boardIndex]);
  const exit = stopPoint(stopSequence[exitIndex]);

  const carCoordinate = useRef(
    new AnimatedRegion({
      latitude: carFix?.latitude ?? board?.latitude ?? 0,
      longitude: carFix?.longitude ?? board?.longitude ?? 0,
      latitudeDelta: 0,
      longitudeDelta: 0,
    })
  ).current;

  useEffect(() => {
    if (!carFix) return;
    carCoordinate
      .timing({ latitude: carFix.latitude, longitude: carFix.longitude, duration: GLIDE_MS, useNativeDriver: false })
      .start();
    // Frame the car and the rider's stop once; after that the rider pans freely.
    if (!fittedRef.current && board && mapRef.current) {
      fittedRef.current = true;
      mapRef.current.fitToCoordinates([carFix, board], {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    }
  }, [carFix?.latitude, carFix?.longitude]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_GOOGLE}
        customMapStyle={theme.isDarkMode ? darkMapStyle : []}
        initialRegion={
          board
            ? { latitude: board.latitude, longitude: board.longitude, latitudeDelta: 0.04, longitudeDelta: 0.04 }
            : undefined
        }
        toolbarEnabled={false}
      >
        {routeLine.length > 1 && <Polyline coordinates={routeLine} strokeColor={color} strokeWidth={4} />}
        {board && <Marker coordinate={board} pinColor={color} />}
        {exit && (
          <Marker coordinate={exit}>
            <Icon name="flag" size={26} color="#374151" />
          </Marker>
        )}
        {carFix && (
          <MarkerAnimated coordinate={carCoordinate} anchor={{ x: 0.5, y: 0.5 }}>
            <View style={[styles.car, { backgroundColor: color }]}>
              <Icon name="directions-car" size={18} color="#fff" />
            </View>
          </MarkerAnimated>
        )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { height: 220, borderRadius: 14, overflow: "hidden", marginBottom: 12 },
  car: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 3,
  },
});
