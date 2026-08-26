import React, { useState, useMemo } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
} from "react-native";
import { Text, useTheme, Searchbar } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "@expo/vector-icons/MaterialIcons";
import { StepHeader } from "_molecules";
import { useCarpool } from "_hooks";
import { t } from "_utils/lang";

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

export default function PickStops({ navigation }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const carpool = useCarpool();

  const [phase, setPhase] = useState(carpool.search.boardStop ? "exit" : "board");
  const [query, setQuery] = useState("");
  const [openHood, setOpenHood] = useState(null);

  const stops = useMemo(
    () => carpool.actions.stopsInTravelOrder(),
    [carpool.search.corridorId, carpool.search.direction, carpool.corridors.length]
  );

  const boardIndex = stops.findIndex((s) => s._id === carpool.search.boardStop?._id);
  const options = phase === "board" ? stops : stops.slice(boardIndex + 1);

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
        <Searchbar
          placeholder={t("carpool.searchStops")}
          value={query}
          onChangeText={setQuery}
          style={[styles.search, { backgroundColor: colors.overlap }]}
          inputStyle={styles.searchInput}
          elevation={0}
        />
      </View>

      {options.length === 0 ? (
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
  search: { borderRadius: 12 },
  searchInput: { fontSize: 15, minHeight: 0 },
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
