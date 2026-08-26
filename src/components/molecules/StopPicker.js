import React, { useState, useMemo } from "react";
import { View, StyleSheet, TouchableOpacity, Keyboard } from "react-native";
import { Text, useTheme, Searchbar } from "react-native-paper";
import Icon from "@expo/vector-icons/MaterialIcons";

// A corridor now carries 60+ stops — far too many as one flat list. Grouped by
// neighbourhood, collapsed by default, with search flattening into plain
// results while typing. Same interaction the rider booking flow already
// proved; text is passed in as props (not translated here) so this works from
// either app's translation namespace.
//
// Purely presentational: `stops` is whatever the caller wants shown (already
// filtered to "comes after the origin", if that is the caller's rule), and
// selection is reported upward, not held here.
const normalise = (value = "") =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

export default function StopPicker({
  stops,
  selectedId,
  onSelect,
  otherGroupLabel,
  searchPlaceholder,
  noMatchLabel,
  resultsCountLabel,
  stopsCountLabel,
}) {
  const { colors } = useTheme();
  const [query, setQuery] = useState("");
  const [openGroup, setOpenGroup] = useState(null);

  const groups = useMemo(() => {
    const ordered = [];
    const byName = {};
    for (const stop of stops) {
      const name = stop.neighbourhood || otherGroupLabel;
      if (!byName[name]) {
        byName[name] = { name, aliases: stop.neighbourhoodAliases || [], stops: [] };
        ordered.push(byName[name]);
      }
      byName[name].stops.push(stop);
    }
    return ordered;
  }, [stops, otherGroupLabel]);

  const needle = normalise(query.trim());
  const matches = useMemo(() => {
    if (!needle) return null;
    return stops.filter((stop) => {
      const hood = stop.neighbourhood || "";
      const aliases = (stop.neighbourhoodAliases || []).join(" ");
      return (
        normalise(stop.name).includes(needle) ||
        normalise(hood).includes(needle) ||
        normalise(aliases).includes(needle)
      );
    });
  }, [needle, stops]);

  const select = (stop) => {
    Keyboard.dismiss();
    onSelect(stop);
  };

  const StopRow = ({ stop, showHood }) => {
    const selected = selectedId === stop._id;
    return (
      <TouchableOpacity
        onPress={() => select(stop)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={stop.neighbourhood ? `${stop.name}, ${stop.neighbourhood}` : stop.name}
        accessibilityState={{ selected }}
        style={[
          styles.stopRow,
          {
            borderColor: selected ? colors.primary : "transparent",
            backgroundColor: selected ? colors.primary + "0D" : "transparent",
          },
        ]}
      >
        <Icon name="place" size={20} color={selected ? colors.primary : colors.placeholder} />
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
    <View>
      <Searchbar
        placeholder={searchPlaceholder}
        value={query}
        onChangeText={setQuery}
        style={[styles.search, { backgroundColor: colors.overlap }]}
        inputStyle={styles.searchInput}
        elevation={0}
      />

      {matches ? (
        matches.length === 0 ? (
          <View style={styles.center}>
            <Icon name="search-off" size={36} color={colors.placeholder} />
            <Text style={[styles.empty, { color: colors.placeholder }]}>
              {noMatchLabel(query)}
            </Text>
          </View>
        ) : (
          <>
            <Text style={[styles.resultCount, { color: colors.placeholder }]}>
              {resultsCountLabel(matches.length)}
            </Text>
            {matches.map((stop) => (
              <StopRow key={`${stop._id}-m`} stop={stop} showHood />
            ))}
          </>
        )
      ) : (
        groups.map((group) => {
          const open = openGroup === group.name;
          return (
            <View key={group.name} style={styles.group}>
              <TouchableOpacity
                onPress={() => setOpenGroup(open ? null : group.name)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityState={{ expanded: open }}
                style={[styles.groupHeader, { borderColor: open ? colors.primary : colors.border }]}
              >
                <Icon
                  name="location-city"
                  size={22}
                  color={open ? colors.primary : colors.placeholder}
                />
                <View style={styles.stopText}>
                  <Text style={[styles.groupName, { color: colors.text }]}>{group.name}</Text>
                  <Text style={[styles.groupCount, { color: colors.placeholder }]}>
                    {stopsCountLabel(group.stops.length)}
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
    </View>
  );
}

const styles = StyleSheet.create({
  search: { borderRadius: 12, marginBottom: 10 },
  searchInput: { fontSize: 15, minHeight: 0 },
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
