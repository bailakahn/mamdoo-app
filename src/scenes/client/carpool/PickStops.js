import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
} from "react-native";
import { Text, useTheme, Searchbar } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MapView, { PROVIDER_GOOGLE, Marker } from "react-native-maps";
import Icon from "@expo/vector-icons/MaterialIcons";
import { StepHeader } from "_molecules";
import * as Location from "expo-location";
import { useCarpool, useTheme as useMamdooTheme } from "_hooks";
import { darkMapStyle } from "_styles/mapStyles";
import { t } from "_utils/lang";

// A5: only Mamdoo's own pickup/dropoff points, on a map, as an alternative to
// the list — the fastest way for a confident rider to recognise a corner they
// already know, and (per the backlog) the fastest way for ops to spot a stop
// sitting in the wrong place. Toggled, not a replacement: the searchable list
// stays the default, since a corridor's 60+ stops are still easier to scan by
// neighbourhood name for most riders most of the time.
const CORRIDOR_COLORS = { red: "#C8322D", blue: "#2563A8", purple: "#6D4AA6" };

// Board and exit are asked one at a time. Picking "where do you get on" first lets
// the exit list be filtered to stops that come after it, so a rider can never
// build an impossible journey and then be told off for it.
//
// A corridor now carries 60+ stops, which is far too many as one flat list. They
// are grouped by neighbourhood — how people actually think about where they are —
// with everything collapsed by default so the screen opens as a short list of
// familiar names rather than a wall of text.
//
// Search matches the stop name, the neighbourhood, AND its alternate spellings, so
// "kobayah" finds Cobaya and "lambanyi" finds Lambandji.
const normalise = (value = "") =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

// Straight-line distance in metres. Good enough to rank stops that are a few
// hundred metres apart; no routing is needed for "which stop is closest to me".
const metresBetween = (a, b) => {
  const R = 6371000;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

export default function PickStops({ navigation }) {
  const { colors } = useTheme();
  const mamdooTheme = useMamdooTheme();
  const insets = useSafeAreaInsets();
  const carpool = useCarpool();
  const mapRef = useRef(null);
  const [here, setHere] = useState(null);

  const [phase, setPhase] = useState(carpool.search.boardStop ? "exit" : "board");
  const [query, setQuery] = useState("");
  const [openHood, setOpenHood] = useState(null);
  const [viewMode, setViewMode] = useState("list");

  const stops = useMemo(
    () => carpool.actions.stopsInTravelOrder(),
    [carpool.search.corridorId, carpool.search.direction, carpool.corridors.length]
  );

  const boardIndex = stops.findIndex((s) => s._id === carpool.search.boardStop?._id);
  const options = phase === "board" ? stops : stops.slice(boardIndex + 1);

  // Riders mostly know where they are standing, so the three closest stops are
  // offered first. Uses the last known fix only, so opening this screen never
  // prompts for permission. Skipped silently when there is no fix.
  useEffect(() => {
    Location.getLastKnownPositionAsync({ maxAge: 120000 })
      .then((fix) => {
        if (fix) setHere({ latitude: fix.coords.latitude, longitude: fix.coords.longitude });
      })
      .catch(() => {});
  }, []);

  const nearest = useMemo(() => {
    if (!here) return [];
    return [...options]
      .map((stop) => ({
        stop,
        metres: metresBetween(here, {
          latitude: stop.location.coordinates[1],
          longitude: stop.location.coordinates[0],
        }),
      }))
      .sort((a, b) => a.metres - b.metres)
      .slice(0, 3)
      .map(({ stop }) => stop);
  }, [here, options]);

  const corridorColor =
    CORRIDOR_COLORS[carpool.search.corridorCode] || colors.primary;

  // Fits every stop currently offered into view whenever the list changes —
  // switching phase (board → exit) or corridor shrinks or moves the set, and a
  // stale framing would leave half the pins off-screen.
  useEffect(() => {
    if (viewMode !== "map" || !mapRef.current || options.length === 0) return;
    mapRef.current.fitToCoordinates(
      options.map((s) => ({
        latitude: s.location.coordinates[1],
        longitude: s.location.coordinates[0],
      })),
      { edgePadding: { top: 60, right: 60, bottom: 60, left: 60 }, animated: true }
    );
  }, [viewMode, options]);

  // Grouped in travel order: neighbourhoods appear in the order the car reaches
  // them, and stops within each keep their order too.
  const groups = useMemo(() => {
    const ordered = [];
    const byName = {};
    for (const stop of options) {
      const hood = stop.neighbourhood || t("carpool.otherStops");
      if (!byName[hood]) {
        byName[hood] = { name: hood, aliases: stop.neighbourhoodAliases || [], stops: [] };
        ordered.push(byName[hood]);
      }
      byName[hood].stops.push(stop);
    }
    return ordered;
  }, [options]);

  const needle = normalise(query.trim());

  // While searching, sections flatten into plain results — nobody wants to expand
  // a section to find what they just typed.
  const matches = useMemo(() => {
    if (!needle) return null;
    return options.filter((stop) => {
      const hood = stop.neighbourhood || "";
      const aliases = (stop.neighbourhoodAliases || []).join(" ");
      return (
        normalise(stop.name).includes(needle) ||
        normalise(hood).includes(needle) ||
        normalise(aliases).includes(needle)
      );
    });
  }, [needle, options]);

  const onSelect = (stop) => {
    Keyboard.dismiss();
    if (phase === "board") {
      carpool.actions.setCarpoolSearch({ boardStop: stop, exitStop: null });
      setPhase("exit");
      setQuery("");
      setOpenHood(null);
      return;
    }
    carpool.actions.setCarpoolSearch({ exitStop: stop });
    navigation.navigate("CarpoolTrips");
  };

  const onBack = () => {
    if (phase === "exit") {
      setPhase("board");
      setQuery("");
      setOpenHood(null);
      carpool.actions.setCarpoolSearch({ exitStop: null });
      return;
    }
    navigation.goBack();
  };

  const StopRow = ({ stop, showHood }) => {
    const selected =
      phase === "board"
        ? carpool.search.boardStop?._id === stop._id
        : carpool.search.exitStop?._id === stop._id;

    return (
      <TouchableOpacity
        onPress={() => onSelect(stop)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={
          stop.neighbourhood ? `${stop.name}, ${stop.neighbourhood}` : stop.name
        }
        accessibilityState={{ selected }}
        style={[
          styles.stopRow,
          {
            borderColor: selected ? colors.primary : "transparent",
            backgroundColor: selected ? colors.primary + "0D" : "transparent",
          },
        ]}
      >
        <Icon
          name={phase === "board" ? "place" : "flag"}
          size={20}
          color={selected ? colors.primary : colors.placeholder}
        />
        <View style={styles.stopText}>
          <Text style={[styles.stopName, { color: colors.text }]}>{stop.name}</Text>
          {showHood && !!stop.neighbourhood && (
            <Text style={[styles.stopHood, { color: colors.placeholder }]}>
              {stop.neighbourhood}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <StepHeader
        step={3}
        totalSteps={4}
        title={phase === "board" ? t("carpool.pickBoardTitle") : t("carpool.pickExitTitle")}
        subtitle={
          phase === "exit"
            ? t("carpool.boardingAt", { stop: carpool.search.boardStop?.name })
            : t("carpool.pickBoardSubtitle")
        }
        onBack={onBack}
      />

      <View style={styles.searchWrap}>
        <View style={styles.searchRow}>
          {viewMode === "list" && (
            <Searchbar
              placeholder={t("carpool.searchStops")}
              value={query}
              onChangeText={setQuery}
              style={[styles.search, { backgroundColor: colors.overlap }]}
              inputStyle={styles.searchInput}
              elevation={0}
            />
          )}
          <TouchableOpacity
            onPress={() => setViewMode(viewMode === "list" ? "map" : "list")}
            accessibilityRole="button"
            accessibilityLabel={
              viewMode === "list" ? t("carpool.viewOnMap") : t("carpool.viewAsList")
            }
            style={[
              styles.viewToggle,
              { borderColor: colors.border, backgroundColor: colors.overlap },
              viewMode === "map" && styles.viewToggleFull,
            ]}
          >
            <Icon
              name={viewMode === "list" ? "map" : "view-list"}
              size={20}
              color={colors.primary}
            />
            {viewMode === "map" && (
              <Text style={[styles.viewToggleText, { color: colors.primary }]}>
                {t("carpool.viewAsList")}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {viewMode === "map" ? (
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          customMapStyle={mamdooTheme.isDarkMode ? darkMapStyle : []}
          initialRegion={{
            latitude: 9.6412,
            longitude: -13.5784,
            latitudeDelta: 0.2,
            longitudeDelta: 0.2,
          }}
        >
          {options.map((stop) => {
            const selected =
              phase === "board"
                ? carpool.search.boardStop?._id === stop._id
                : carpool.search.exitStop?._id === stop._id;
            return (
              <Marker
                key={stop._id}
                coordinate={{
                  latitude: stop.location.coordinates[1],
                  longitude: stop.location.coordinates[0],
                }}
                title={stop.name}
                description={stop.neighbourhood || undefined}
                pinColor={selected ? colors.primary : corridorColor}
                onPress={() => onSelect(stop)}
              />
            );
          })}
        </MapView>
      ) : options.length === 0 ? (
        <View style={styles.center}>
          <Text style={[styles.empty, { color: colors.placeholder }]}>
            {t("carpool.noStopsAfter")}
          </Text>
        </View>
      ) : (
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.list,
            { paddingBottom: Math.max(insets.bottom + 16, 28) },
          ]}
        >
          {!matches && nearest.length > 0 && (
            <View style={styles.group}>
              <Text style={[styles.resultCount, { color: colors.placeholder }]}>
                {t("carpool.nearestToYou")}
              </Text>
              {nearest.map((stop) => (
                <StopRow key={`${stop._id}-near`} stop={stop} showHood />
              ))}
            </View>
          )}

          {matches ? (
            matches.length === 0 ? (
              <View style={styles.center}>
                <Icon name="search-off" size={40} color={colors.placeholder} />
                <Text style={[styles.empty, { color: colors.placeholder }]}>
                  {t("carpool.noStopMatch", { query })}
                </Text>
              </View>
            ) : (
              <>
                <Text style={[styles.resultCount, { color: colors.placeholder }]}>
                  {t("carpool.stopsFound", { count: matches.length })}
                </Text>
                {matches.map((stop) => (
                  <StopRow key={`${stop._id}-m`} stop={stop} showHood />
                ))}
              </>
            )
          ) : (
            groups.map((group) => {
              const open = openHood === group.name;
              return (
                <View key={group.name} style={styles.group}>
                  <TouchableOpacity
                    onPress={() => setOpenHood(open ? null : group.name)}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityState={{ expanded: open }}
                    style={[
                      styles.groupHeader,
                      { borderColor: open ? colors.primary : colors.border },
                    ]}
                  >
                    <Icon
                      name="location-city"
                      size={22}
                      color={open ? colors.primary : colors.placeholder}
                    />
                    <View style={styles.stopText}>
                      <Text style={[styles.groupName, { color: colors.text }]}>
                        {group.name}
                      </Text>
                      <Text style={[styles.groupCount, { color: colors.placeholder }]}>
                        {t("carpool.stopsCount", { count: group.stops.length })}
                      </Text>
                    </View>
                    <Icon
                      name={open ? "expand-less" : "expand-more"}
                      size={26}
                      color={colors.placeholder}
                    />
                  </TouchableOpacity>

                  {open && (
                    <View style={styles.groupBody}>
                      {group.stops.map((stop) => (
                        <StopRow key={stop._id} stop={stop} />
                      ))}
                    </View>
                  )}
                </View>
              );
            })
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  searchWrap: { paddingHorizontal: 20, paddingBottom: 10 },
  searchRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  search: { flex: 1, borderRadius: 12 },
  searchInput: { fontSize: 15, minHeight: 0 },
  viewToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 44,
    width: 44,
    borderRadius: 12,
    borderWidth: 1,
  },
  viewToggleFull: { flex: 1, width: undefined, paddingHorizontal: 16 },
  viewToggleText: { fontSize: 14, fontWeight: "600" },
  map: { flex: 1 },
  list: { paddingHorizontal: 20, paddingTop: 2 },
  center: { alignItems: "center", justifyContent: "center", padding: 32, gap: 10 },
  empty: { fontSize: 15, textAlign: "center", lineHeight: 21 },
  resultCount: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  group: { marginBottom: 10 },
  groupHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    // Large enough to hit without precision, per §11.
    minHeight: 64,
    paddingVertical: 12,
  },
  groupName: { fontSize: 17, fontWeight: "600" },
  groupCount: { fontSize: 13, marginTop: 2 },
  groupBody: { paddingLeft: 8, paddingTop: 4 },
  stopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 56,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  stopText: { flex: 1 },
  stopName: { fontSize: 16, fontWeight: "500" },
  stopHood: { fontSize: 13, marginTop: 2 },
});
