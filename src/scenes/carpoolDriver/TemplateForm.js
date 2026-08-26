import React, { useState, useEffect } from "react";
import { View, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { Text, useTheme, Switch } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "@expo/vector-icons/MaterialIcons";
import { Button } from "_atoms";
import { ChoiceCard, StepHeader, StopPicker } from "_molecules";
import { useCarpool } from "_hooks/carpoolDriver";
import { useApi } from "_api";
import { t2 } from "_utils/lang";

const CORRIDOR_COLORS = { red: "#C8322D", blue: "#2563A8", purple: "#6D4AA6" };
const DAYS = [1, 2, 3, 4, 5, 6, 0];
const SEAT_OPTIONS = [1, 2, 3, 4];
const HOURS = ["05:30", "06:00", "06:30", "07:00", "07:30", "08:00", "08:30", "16:00", "17:00", "17:30", "18:00", "18:30"];

// Publishing a recurring trip, as a wizard rather than a form.
//
// The Kaloum tail is the part §11 singled out as least obvious. The spec has the
// driver pick 2-4 ordered stops from a shared list; instead this asks one question
// — "which road do you take through Kaloum?" — because §1 states there are exactly
// three, and a road maps to an ordered stop set on the server. An ordered
// multi-select becomes a three-way choice with no loss of expressiveness.
export default function CarpoolTemplateForm({ navigation, route }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const carpool = useCarpool();
  const getRequest = useApi();

  const editing = route.params?.template || null;

  const [step, setStep] = useState(1);
  // Step 4 asks "where do you get on" then "where do you get off" as two
  // distinct questions, same as the rider booking flow — not one long list
  // where the second half only becomes visible after scrolling past the first.
  const [stopPhase, setStopPhase] = useState("board");
  const [data, setData] = useState({
    corridors: [],
    kaloumRoads: [],
  });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [form, setForm] = useState({
    corridorId: editing?.corridorId?._id || null,
    corridorCode: editing?.corridorId?.code || null,
    direction: editing?.direction || null,
    kaloumRoad: editing?.kaloumRoad || null,
    originStopId: editing?.originStopId || null,
    destinationStopId: editing?.destinationStopId || null,
    departureTime: editing?.departureTime || null,
    daysOfWeek: editing?.daysOfWeek || [1, 2, 3, 4, 5],
    defaultSeatsOffered: editing?.defaultSeatsOffered || null,
    womenOnly: editing?.womenOnly || false,
  });

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  useEffect(() => {
    (async () => {
      const [corridorsResult] = await Promise.all([
        getRequest({ method: "GET", endpoint: "carpool/getCorridors" }).catch(() => null),
        carpool.actions.loadProfile(),
      ]);
      if (corridorsResult?.success) {
        setData({
          corridors: corridorsResult.corridors,
          kaloumRoads: corridorsResult.kaloumRoads,
        });
      }
      setLoading(false);
    })();
  }, []);

  const car = carpool.profile?.cars?.[0];
  const corridor = data.corridors.find((c) => c._id === form.corridorId);

  // The full route in travel order, so origin and destination can be picked from
  // the same list the trip will actually run.
  const stopsInOrder = () => {
    if (!corridor) return [];
    const road = data.kaloumRoads.find((r) => r.id === form.kaloumRoad);
    const inbound = [...corridor.stops, ...(road?.stops || [])];
    return form.direction === "outbound" ? [...inbound].reverse() : inbound;
  };

  const onSave = async () => {
    setBusy(true);
    const result = await carpool.actions.saveTemplate({
      ...(editing && { templateId: editing._id }),
      carId: car?._id,
      corridorId: form.corridorId,
      direction: form.direction,
      kaloumRoad: form.kaloumRoad,
      originStopId: form.originStopId,
      destinationStopId: form.destinationStopId,
      departureTime: form.departureTime,
      daysOfWeek: form.daysOfWeek,
      defaultSeatsOffered: form.defaultSeatsOffered,
      womenOnly: form.womenOnly,
    });
    setBusy(false);
    if (result?.success) navigation.navigate("CarpoolTemplates");
  };

  const back = () => {
    if (step === 4 && stopPhase === "exit") {
      setStopPhase("board");
      set({ destinationStopId: null });
      return;
    }
    if (step > 1) {
      setStep(step - 1);
      return;
    }
    navigation.goBack();
  };

  if (loading) {
    return (
      <View style={[styles.screen, styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const TITLES = {
    1: t2("carpoolDriver.formCorridorTitle"),
    2: t2("carpoolDriver.formDirectionTitle"),
    3: t2("carpoolDriver.formRoadTitle"),
    4: stopPhase === "board" ? t2("carpoolDriver.whereStart") : t2("carpoolDriver.whereEnd"),
    5: t2("carpoolDriver.formScheduleTitle"),
  };

  const stopsForPhase = () => {
    const all = stopsInOrder();
    if (stopPhase === "board") return all;
    const boardIndex = all.findIndex((s) => s._id === form.originStopId);
    return all.slice(boardIndex + 1);
  };

  const kaloumRoadLabel = form.kaloumRoad ? t2(`carpoolDriver.road_${form.kaloumRoad}`) : "";

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <StepHeader
        step={step}
        totalSteps={5}
        title={TITLES[step]}
        subtitle={
          step === 3
            ? t2("carpoolDriver.formRoadHint")
            : step === 4 && stopPhase === "exit"
              ? t2("carpoolDriver.boardingAt", {
                  stop: stopsInOrder().find((s) => s._id === form.originStopId)?.name,
                })
              : undefined
        }
        onBack={back}
      />

      <ScrollView
        contentContainerStyle={[
          styles.body,
          { paddingBottom: Math.max(insets.bottom + 24, 32) },
        ]}
      >
        {step === 1 &&
          data.corridors.map((c) => (
            <ChoiceCard
              key={c._id}
              accentColor={CORRIDOR_COLORS[c.code] || colors.primary}
              title={c.name}
              selected={form.corridorId === c._id}
              onPress={() => {
                set({ corridorId: c._id, corridorCode: c.code, originStopId: null, destinationStopId: null });
                setStep(2);
              }}
            />
          ))}

        {step === 2 && (
          <>
            <ChoiceCard
              icon="arrow-forward"
              title={t2("carpoolDriver.directionInbound")}
              subtitle={t2("carpoolDriver.directionInboundHint")}
              selected={form.direction === "inbound"}
              onPress={() => {
                set({ direction: "inbound", originStopId: null, destinationStopId: null });
                setStep(3);
              }}
            />
            <ChoiceCard
              icon="arrow-back"
              title={t2("carpoolDriver.directionOutbound")}
              subtitle={t2("carpoolDriver.directionOutboundHint")}
              selected={form.direction === "outbound"}
              onPress={() => {
                set({ direction: "outbound", originStopId: null, destinationStopId: null });
                setStep(3);
              }}
            />
          </>
        )}

        {step === 3 &&
          data.kaloumRoads.map((road) => (
            <ChoiceCard
              key={road.id}
              icon="alt-route"
              title={t2(`carpoolDriver.road_${road.id}`)}
              subtitle={t2("carpoolDriver.roadStops", { count: road.stops.length })}
              selected={form.kaloumRoad === road.id}
              onPress={() => {
                set({ kaloumRoad: road.id, originStopId: null, destinationStopId: null });
                setStopPhase("board");
                setStep(4);
              }}
            />
          ))}

        {step === 4 && (
          <StopPicker
            stops={stopsForPhase()}
            selectedId={stopPhase === "board" ? form.originStopId : form.destinationStopId}
            otherGroupLabel={kaloumRoadLabel}
            searchPlaceholder={t2("carpoolDriver.searchStops")}
            noMatchLabel={(query) => t2("carpoolDriver.noStopMatch", { query })}
            resultsCountLabel={(count) => t2("carpoolDriver.stopsFound", { count })}
            stopsCountLabel={(count) => t2("carpoolDriver.stopsCount", { count })}
            onSelect={(stop) => {
              if (stopPhase === "board") {
                set({ originStopId: stop._id, destinationStopId: null });
                setStopPhase("exit");
                return;
              }
              set({ destinationStopId: stop._id });
              setStep(5);
            }}
          />
        )}

        {step === 5 && (
          <>
            <Text style={styles.fieldLabel}>{t2("carpoolDriver.whatTime")}</Text>
            <View style={styles.chipRow}>
              {HOURS.map((h) => {
                const active = form.departureTime === h;
                return (
                  <TouchableOpacity
                    key={h}
                    onPress={() => set({ departureTime: h })}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: active ? colors.primary : "transparent",
                        borderColor: active ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Text style={[styles.chipText, { color: active ? "#fff" : colors.text }]}>
                      {h}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.fieldLabel}>{t2("carpoolDriver.whichDays")}</Text>
            <View style={styles.chipRow}>
              {DAYS.map((d) => {
                const active = form.daysOfWeek.includes(d);
                return (
                  <TouchableOpacity
                    key={d}
                    onPress={() =>
                      set({
                        daysOfWeek: active
                          ? form.daysOfWeek.filter((x) => x !== d)
                          : [...form.daysOfWeek, d],
                      })
                    }
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    style={[
                      styles.dayChip,
                      {
                        backgroundColor: active ? colors.primary : "transparent",
                        borderColor: active ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Text style={[styles.chipText, { color: active ? "#fff" : colors.text }]}>
                      {t2(`carpoolDriver.day_${d}`)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.fieldLabel}>
              {t2("carpoolDriver.howManySeats", { max: car?.totalSeats || 4 })}
            </Text>
            <View style={styles.chipRow}>
              {SEAT_OPTIONS.filter((n) => n <= (car?.totalSeats || 4)).map((n) => {
                const active = form.defaultSeatsOffered === n;
                return (
                  <TouchableOpacity
                    key={n}
                    onPress={() => set({ defaultSeatsOffered: n })}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    style={[
                      styles.seatBox,
                      {
                        backgroundColor: active ? colors.primary : "transparent",
                        borderColor: active ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Text style={[styles.seatNumber, { color: active ? "#fff" : colors.text }]}>
                      {n}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.switchRow}>
              <Icon name="female" size={22} color={colors.placeholder} />
              <Text style={[styles.switchLabel, { color: colors.text }]}>
                {t2("carpoolDriver.womenOnly")}
              </Text>
              <Switch
                value={form.womenOnly}
                onValueChange={(v) => set({ womenOnly: v })}
              />
            </View>

            <Button
              mode="contained"
              icon="check"
              loading={busy}
              disabled={
                busy ||
                !form.departureTime ||
                !form.daysOfWeek.length ||
                !form.defaultSeatsOffered
              }
              onPress={onSave}
              style={styles.button}
              contentStyle={styles.buttonContent}
            >
              {editing ? t2("carpoolDriver.saveChanges") : t2("carpoolDriver.publishTrip")}
            </Button>
            <Text style={[styles.note, { color: colors.placeholder }]}>
              {t2("carpoolDriver.publishNote")}
            </Text>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  center: { alignItems: "center", justifyContent: "center" },
  body: { paddingHorizontal: 20 },
  fieldLabel: { fontSize: 17, fontWeight: "600", marginTop: 16, marginBottom: 12 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 8 },
  chip: {
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  dayChip: {
    width: 52,
    height: 52,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  chipText: { fontSize: 15, fontWeight: "600" },
  seatBox: {
    width: 64,
    height: 64,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  seatNumber: { fontSize: 24, fontWeight: "700" },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 20,
    marginBottom: 8,
  },
  switchLabel: { flex: 1, fontSize: 16 },
  button: { borderRadius: 12, marginTop: 16 },
  buttonContent: { height: 56 },
  note: { fontSize: 13, textAlign: "center", marginTop: 12, lineHeight: 19 },
});
