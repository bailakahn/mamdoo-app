import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Icon from "@expo/vector-icons/MaterialIcons";
import { CORRIDOR, Finger, Line, Mover, PhoneFrame, Pop, Show, Ticker, useSceneProgress } from "./kit";

// The five rider scenes. Each receives `active` (is its slide on screen), the
// theme colours and `tr` (translate a key in the rider's language).

const Car = ({ color }) => (
  <View style={[s.car, { backgroundColor: color }]}>
    <Icon name="directions-car" size={14} color="#fff" />
  </View>
);

// 1. A seat in a car already going your way, on fixed lines, cheaper than a taxi.
export const RiderWhatScene = ({ active, colors, tr }) => {
  const progress = useSceneProgress(active, 6000);
  const red = [{ x: 30, y: 40 }, { x: 70, y: 120 }, { x: 110, y: 200 }, { x: 150, y: 260 }];
  return (
    <PhoneFrame colors={colors}>
      <View style={[s.map, { backgroundColor: colors.primary + "0D" }]}>
        <Line from={{ x: 170, y: 40 }} to={{ x: 150, y: 260 }} color={CORRIDOR.blue} />
        <Line from={{ x: 100, y: 30 }} to={{ x: 150, y: 260 }} color={CORRIDOR.purple} />
        {red.slice(0, -1).map((point, i) => (
          <Line key={i} from={point} to={red[i + 1]} color={CORRIDOR.red} width={6} />
        ))}
        <View style={[s.stopDot, { left: 64, top: 114, borderColor: CORRIDOR.red }]} />
        <Show progress={progress} from={0} to={0.42} style={[s.person, { left: 76, top: 100 }]}>
          <Icon name="person-pin-circle" size={22} color={colors.text} />
        </Show>
        <Mover
          progress={progress}
          points={[
            { x: 20, y: 30, at: 0 },
            { x: 60, y: 110, at: 0.35 },
            { x: 60, y: 110, at: 0.45 },
            { x: 100, y: 190, at: 0.7 },
            { x: 140, y: 250, at: 0.9 },
          ]}
        >
          <Car color={CORRIDOR.red} />
        </Mover>
        <Pop progress={progress} at={0.5} style={s.priceTag}>
          <Text style={[s.priceOld, { color: colors.text }]}>{tr("onbTaxiPrice")}</Text>
          <Text style={[s.priceNew, { color: colors.primary }]}>{tr("onbSeatPrice")}</Text>
        </Pop>
      </View>
    </PhoneFrame>
  );
};

// 2. Book in seconds, any day this week, and save the usual route.
export const RiderBookScene = ({ active, colors, tr }) => {
  const progress = useSceneProgress(active, 7000);
  const row = (label, top, at, color = colors.text) => (
    <Show progress={progress} from={at} style={[s.row, { top, borderColor: colors.text + "22" }]}>
      <Text style={[s.rowText, { color }]} numberOfLines={1}>
        {label}
      </Text>
    </Show>
  );
  return (
    <PhoneFrame colors={colors}>
      <View style={s.stage}>
        {row(tr("onbLineRed"), 20, 0, CORRIDOR.red)}
        {row(tr("onbIntoKaloum"), 58, 0.12)}
        {row(tr("onbStopsExample"), 96, 0.24)}
        <Show progress={progress} from={0.36} style={[s.days, { top: 136 }]}>
          {[0, 1, 2, 3].map((i) => (
            <View
              key={i}
              style={[s.dayChip, { borderColor: colors.primary, backgroundColor: i === 3 ? colors.primary : "transparent" }]}
            >
              <Text style={{ fontSize: 10, color: i === 3 ? "#fff" : colors.text }}>{tr(`onbDay${i}`)}</Text>
            </View>
          ))}
        </Show>
        <Show progress={progress} from={0.48} style={[s.tripCard, { top: 172, borderColor: colors.primary }]}>
          <Text style={[s.tripTime, { color: colors.text }]}>07:30</Text>
          <Text style={[s.tripPrice, { color: colors.primary }]}>{tr("onbSeatPrice")}</Text>
        </Show>
        <Show progress={progress} from={0.6} style={[s.bookButton, { top: 222, backgroundColor: colors.primary }]}>
          <Text style={s.bookText}>{tr("onbBookSeat")}</Text>
        </Show>
        <Pop progress={progress} at={0.7} style={[s.tick, { top: 218 }]}>
          <Icon name="check-circle" size={34} color="#1F6F43" />
        </Pop>
        <Show progress={progress} from={0.8} style={[s.saved, { top: 268 }]}>
          <Icon name="bookmark" size={14} color={colors.primary} />
          <Text style={[s.savedText, { color: colors.primary }]}>{tr("onbSavedUsual")}</Text>
        </Show>
        <Finger
          progress={progress}
          taps={[
            { x: 100, y: 34, at: 0.08 },
            { x: 100, y: 72, at: 0.2 },
            { x: 100, y: 110, at: 0.32 },
            { x: 150, y: 148, at: 0.44 },
            { x: 100, y: 236, at: 0.66 },
          ]}
        />
      </View>
    </PhoneFrame>
  );
};

// 3. Be on time: the earliest pickup, a 5-minute wait, free cancellation until 2 h.
export const RiderOnTimeScene = ({ active, colors, tr }) => {
  const progress = useSceneProgress(active, 6500);
  return (
    <PhoneFrame colors={colors}>
      <View style={s.stage}>
        <View style={[s.infoCard, { top: 18, borderColor: colors.primary }]}>
          <Icon name="schedule" size={18} color={colors.primary} />
          <Text style={[s.infoText, { color: colors.text }]}>{tr("onbPickupFrom")}</Text>
        </View>
        <Line from={{ x: 10, y: 140 }} to={{ x: 188, y: 140 }} color={colors.text + "33"} width={10} />
        <View style={[s.stopPin, { left: 120, top: 112 }]}>
          <Icon name="place" size={26} color={CORRIDOR.red} />
        </View>
        <Mover progress={progress} points={[{ x: 0, y: 130, at: 0 }, { x: 116, y: 130, at: 0.35 }]}>
          <Car color={CORRIDOR.red} />
        </Mover>
        <Show progress={progress} from={0.38} style={[s.countdownBox, { top: 172, backgroundColor: "#FEF3C7" }]}>
          <Icon name="timer" size={18} color="#92400E" />
          <Ticker
            progress={progress}
            steps={[
              { at: 0.38, text: "5:00" },
              { at: 0.5, text: "3:00" },
              { at: 0.62, text: "1:00" },
              { at: 0.74, text: "0:00" },
            ]}
            textStyle={s.countdown}
          />
        </Show>
        <Show progress={progress} from={0.78} style={[s.note, { top: 236 }]}>
          <Icon name="event-available" size={16} color="#1F6F43" />
          <Text style={[s.noteText, { color: colors.text }]}>{tr("onbFreeCancel")}</Text>
        </Show>
      </View>
    </PhoneFrame>
  );
};

// 4. Follow the car: the "5 minutes away" push, live map and ETA, then save data.
export const RiderTrackScene = ({ active, colors, tr }) => {
  const progress = useSceneProgress(active, 7000);
  return (
    <PhoneFrame colors={colors}>
      <View style={s.stage}>
        <Show progress={progress} from={0} to={0.62} style={[s.map, { top: 64, height: 150, backgroundColor: colors.primary + "0D" }]}>
          <Line from={{ x: 10, y: 120 }} to={{ x: 170, y: 30 }} color={CORRIDOR.red} width={5} />
          <View style={[s.stopPin, { left: 156, top: 8 }]}>
            <Icon name="place" size={24} color={CORRIDOR.red} />
          </View>
          <Mover progress={progress} points={[{ x: 4, y: 108, at: 0.12 }, { x: 120, y: 44, at: 0.58 }]}>
            <Car color={CORRIDOR.red} />
          </Mover>
        </Show>
        <Pop progress={progress} at={0.04} style={[s.push, { top: 8, backgroundColor: colors.background, borderColor: colors.text + "22" }]}>
          <Icon name="notifications-active" size={16} color={colors.primary} />
          <Text style={[s.pushText, { color: colors.text }]} numberOfLines={2}>
            {tr("onbPushNear")}
          </Text>
        </Pop>
        <View style={[s.etaRow, { top: 226 }]}>
          <Ticker
            progress={progress}
            steps={[
              { at: 0.1, text: tr("onbEtaFar") },
              { at: 0.4, text: tr("onbEtaNear") },
              { at: 0.7, text: tr("onbStopsAway") },
            ]}
            textStyle={[s.eta, { color: colors.text }]}
          />
        </View>
        <Show progress={progress} from={0.64} style={[s.toggle, { top: 266, borderColor: colors.primary }]}>
          <Icon name="data-saver-on" size={16} color={colors.primary} />
          <Text style={[s.toggleText, { color: colors.primary }]}>{tr("onbSaveData")}</Text>
        </Show>
        <Finger progress={progress} taps={[{ x: 100, y: 278, at: 0.62 }]} />
      </View>
    </PhoneFrame>
  );
};

// 5. Travel with confidence: car photo and plate, verified driver, SOS, sharing, women only.
export const RiderSafetyScene = ({ active, colors, tr }) => {
  const progress = useSceneProgress(active, 6000);
  const badge = (icon, label, at, top, color = colors.primary) => (
    <Pop progress={progress} at={at} style={[s.badge, { top, borderColor: color }]}>
      <Icon name={icon} size={16} color={color} />
      <Text style={[s.badgeText, { color }]}>{label}</Text>
    </Pop>
  );
  return (
    <PhoneFrame colors={colors}>
      <View style={s.stage}>
        <View style={[s.carPhoto, { top: 14, backgroundColor: colors.text + "10" }]}>
          <Icon name="directions-car" size={56} color={colors.text + "88"} />
          <View style={s.plate}>
            <Text style={s.plateText}>BA 7577</Text>
          </View>
        </View>
        {badge("verified-user", tr("onbVerified"), 0.15, 132)}
        {badge("sos", "SOS", 0.32, 170, "#B3261E")}
        {badge("share", tr("onbShareTrip"), 0.49, 208)}
        {badge("female", tr("onbWomenOnly"), 0.66, 246, "#9D174D")}
      </View>
    </PhoneFrame>
  );
};

const s = StyleSheet.create({
  stage: { flex: 1 },
  map: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0 },
  car: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  stopDot: { position: "absolute", width: 14, height: 14, borderRadius: 7, borderWidth: 3, backgroundColor: "#fff" },
  stopPin: { position: "absolute" },
  person: { position: "absolute" },
  priceTag: {
    position: "absolute",
    right: 10,
    top: 150,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  priceOld: { fontSize: 11, textDecorationLine: "line-through", opacity: 0.5 },
  priceNew: { fontSize: 16, fontWeight: "800" },
  row: { position: "absolute", left: 12, right: 12, height: 30, borderWidth: 1, borderRadius: 8, justifyContent: "center", paddingHorizontal: 10 },
  rowText: { fontSize: 12, fontWeight: "600" },
  days: { position: "absolute", left: 12, right: 12, flexDirection: "row", gap: 6 },
  dayChip: { flex: 1, height: 26, borderRadius: 8, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  tripCard: {
    position: "absolute",
    left: 12,
    right: 12,
    height: 40,
    borderWidth: 1.5,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
  },
  tripTime: { fontSize: 16, fontWeight: "800" },
  tripPrice: { fontSize: 13, fontWeight: "700" },
  bookButton: { position: "absolute", left: 12, right: 12, height: 32, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  bookText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  tick: { position: "absolute", right: 16 },
  saved: { position: "absolute", left: 12, right: 12, flexDirection: "row", alignItems: "center", gap: 6 },
  savedText: { fontSize: 11, fontWeight: "600" },
  infoCard: {
    position: "absolute",
    left: 12,
    right: 12,
    borderWidth: 1.5,
    borderRadius: 10,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoText: { flex: 1, fontSize: 12, fontWeight: "600" },
  countdownBox: {
    position: "absolute",
    left: 40,
    right: 40,
    borderRadius: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  countdown: { fontSize: 24, fontWeight: "800", color: "#92400E", fontVariant: ["tabular-nums"] },
  note: { position: "absolute", left: 12, right: 12, flexDirection: "row", alignItems: "center", gap: 6 },
  noteText: { flex: 1, fontSize: 11 },
  push: {
    position: "absolute",
    left: 8,
    right: 8,
    borderWidth: 1,
    borderRadius: 12,
    padding: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  pushText: { flex: 1, fontSize: 11, fontWeight: "600" },
  etaRow: { position: "absolute", left: 12, right: 12 },
  eta: { fontSize: 15, fontWeight: "800" },
  toggle: {
    position: "absolute",
    left: 30,
    right: 30,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  toggleText: { fontSize: 11, fontWeight: "700" },
  carPhoto: { position: "absolute", left: 12, right: 12, height: 100, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  plate: { position: "absolute", bottom: 8, backgroundColor: "#FDE047", borderRadius: 4, paddingHorizontal: 8, paddingVertical: 2 },
  plateText: { fontSize: 12, fontWeight: "800", color: "#111", letterSpacing: 1 },
  badge: {
    position: "absolute",
    left: 24,
    right: 24,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  badgeText: { fontSize: 12, fontWeight: "700" },
});
