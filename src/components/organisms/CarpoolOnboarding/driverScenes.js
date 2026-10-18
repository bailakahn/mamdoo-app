import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Icon from "@expo/vector-icons/MaterialIcons";
import { CORRIDOR, Finger, Grow, Line, Mover, PhoneFrame, Pop, Show, Ticker, useSceneProgress } from "./kit";

// The five driver scenes. Same contract as the rider scenes: `active`, theme
// `colors`, and `tr` to translate a key in the driver's language.

const Car = () => (
  <View style={s.car}>
    <Icon name="directions-car" size={16} color="#fff" />
  </View>
);

// 1. Share your usual route: riders on the way, Mamdoo sets the price, 10 %.
export const DriverShareScene = ({ active, colors, tr }) => {
  const progress = useSceneProgress(active, 6500);
  return (
    <PhoneFrame colors={colors}>
      <View style={s.stage}>
        <Line from={{ x: 14, y: 70 }} to={{ x: 184, y: 70 }} color={CORRIDOR.red} width={6} />
        {[60, 130].map((x, i) => (
          <Show key={x} progress={progress} from={0} to={i === 0 ? 0.3 : 0.6} style={[s.person, { left: x - 8, top: 34 }]}>
            <Icon name="person" size={20} color={colors.text} />
          </Show>
        ))}
        <Mover
          progress={progress}
          points={[
            { x: 4, y: 57, at: 0 },
            { x: 48, y: 57, at: 0.25 },
            { x: 48, y: 57, at: 0.32 },
            { x: 118, y: 57, at: 0.55 },
            { x: 118, y: 57, at: 0.62 },
            { x: 170, y: 57, at: 0.8 },
          ]}
        >
          <Car />
        </Mover>
        <View style={[s.wallet, { borderColor: colors.text + "22" }]}>
          <Icon name="account-balance-wallet" size={26} color="#1F6F43" />
          <Ticker
            progress={progress}
            steps={[
              { at: 0, text: "0 GNF" },
              { at: 0.32, text: "+3.000 GNF" },
              { at: 0.62, text: "+6.000 GNF" },
            ]}
            textStyle={s.walletText}
          />
        </View>
        <Show progress={progress} from={0.7} style={[s.note, { top: 220 }]}>
          <Icon name="price-check" size={16} color={colors.primary} />
          <Text style={[s.noteText, { color: colors.text }]}>{tr("onbPriceAndCommission")}</Text>
        </Show>
      </View>
    </PhoneFrame>
  );
};

// 2. Set up once: car, documents, usual route; then trips publish a week ahead.
export const DriverSetupScene = ({ active, colors, tr }) => {
  const progress = useSceneProgress(active, 6500);
  const step = (label, at, top) => (
    <View style={[s.step, { top, borderColor: colors.text + "22" }]}>
      <Text style={[s.stepText, { color: colors.text }]}>{label}</Text>
      <Pop progress={progress} at={at}>
        <Icon name="check-circle" size={20} color="#1F6F43" />
      </Pop>
    </View>
  );
  return (
    <PhoneFrame colors={colors}>
      <View style={s.stage}>
        {step(tr("onbStepCar"), 0.1, 16)}
        {step(tr("onbStepDocuments"), 0.22, 56)}
        {step(tr("onbStepRoute"), 0.34, 96)}
        <View style={[s.week, { top: 150 }]}>
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <View key={i} style={[s.dayCol, { borderColor: colors.text + "22" }]}>
              <Text style={[s.dayLabel, { color: colors.text }]}>{tr(`onbWeekday${i}`)}</Text>
              {i < 5 && (
                <Pop progress={progress} at={0.45 + i * 0.06}>
                  <View style={[s.tripBlock, { backgroundColor: colors.primary }]} />
                </Pop>
              )}
            </View>
          ))}
        </View>
        <Show progress={progress} from={0.8} style={[s.note, { top: 236 }]}>
          <Icon name="event-repeat" size={16} color={colors.primary} />
          <Text style={[s.noteText, { color: colors.text }]}>{tr("onbPublishedAhead")}</Text>
        </Show>
      </View>
    </PhoneFrame>
  );
};

// 3. The evening before: heads-up push, seats can't drop below bookings, cancel until 6 h.
export const DriverEveningScene = ({ active, colors, tr }) => {
  const progress = useSceneProgress(active, 7000);
  const seat = (n, blocked) => (
    <View style={[s.seat, { borderColor: colors.primary, opacity: blocked ? 0.3 : 1 }]}>
      <Text style={[s.seatText, { color: colors.text }]}>{n}</Text>
    </View>
  );
  return (
    <PhoneFrame colors={colors}>
      <View style={s.stage}>
        <Pop progress={progress} at={0.04} style={[s.push, { top: 8, backgroundColor: colors.background, borderColor: colors.text + "22" }]}>
          <Icon name="notifications-active" size={16} color={colors.primary} />
          <Text style={[s.pushText, { color: colors.text }]} numberOfLines={2}>
            {tr("onbHeadsUpPush")}
          </Text>
        </Pop>
        <Show progress={progress} from={0.18} style={[s.tripCard, { top: 76, borderColor: colors.primary }]}>
          <Text style={[s.tripTime, { color: colors.text }]}>07:30</Text>
          <Ticker
            progress={progress}
            steps={[
              { at: 0.18, text: tr("onbSeatsThreeOneBooked") },
              { at: 0.66, text: tr("onbSeatsTwoOneBooked") },
            ]}
            textStyle={[s.tripMeta, { color: colors.text }]}
          />
        </Show>
        <Show progress={progress} from={0.3} style={[s.seats, { top: 146 }]}>
          {seat(0, true)}
          {seat(1, false)}
          {seat(2, false)}
          {seat(3, false)}
        </Show>
        <Show progress={progress} from={0.44} to={0.62} style={[s.blocked, { top: 190 }]}>
          <Icon name="block" size={14} color="#B3261E" />
          <Text style={s.blockedText}>{tr("onbCantGoBelow")}</Text>
        </Show>
        <Show progress={progress} from={0.74} style={[s.note, { top: 236 }]}>
          <Icon name="schedule" size={16} color={colors.primary} />
          <Text style={[s.noteText, { color: colors.text }]}>{tr("onbFreeCancelDriver")}</Text>
        </Show>
        <Finger
          progress={progress}
          taps={[
            { x: 34, y: 162, at: 0.42 },
            { x: 122, y: 162, at: 0.64 },
          ]}
        />
      </View>
    </PhoneFrame>
  );
};

// 4. On the day: start, reach the stop, arrival detected with a 10 s countdown, aboard.
export const DriverDayScene = ({ active, colors, tr }) => {
  const progress = useSceneProgress(active, 7500);
  return (
    <PhoneFrame colors={colors}>
      <View style={s.stage}>
        <Show progress={progress} from={0} to={0.16} style={[s.bigButton, { top: 120, backgroundColor: colors.primary }]}>
          <Icon name="play-arrow" size={18} color="#fff" />
          <Text style={s.bigButtonText}>{tr("onbStartTrip")}</Text>
        </Show>
        <Show progress={progress} from={0.18} style={StyleSheet.absoluteFill}>
          <Line from={{ x: 14, y: 50 }} to={{ x: 184, y: 50 }} color={CORRIDOR.red} width={6} />
          <View style={[s.stopPin, { left: 126, top: 22 }]}>
            <Icon name="place" size={26} color={CORRIDOR.red} />
          </View>
          <Mover progress={progress} points={[{ x: 4, y: 37, at: 0.18 }, { x: 124, y: 37, at: 0.4 }]}>
            <Car />
          </Mover>
        </Show>
        <Show progress={progress} from={0.42} to={0.72} style={[s.autoBox, { top: 96, borderColor: colors.primary }]}>
          <Text style={[s.autoTitle, { color: colors.text }]}>{tr("onbArrivalDetected")}</Text>
          <Ticker
            progress={progress}
            steps={[
              { at: 0.42, text: "10 s" },
              { at: 0.5, text: "7 s" },
              { at: 0.58, text: "4 s" },
              { at: 0.66, text: "1 s" },
            ]}
            textStyle={[s.autoCount, { color: colors.primary }]}
          />
        </Show>
        <Show progress={progress} from={0.74} style={[s.riderCard, { top: 100, borderColor: colors.text + "22" }]}>
          <Icon name="person" size={20} color={colors.text} />
          <Text style={[s.riderName, { color: colors.text }]}>Aissatou</Text>
          <View style={[s.aboard, { backgroundColor: colors.primary }]}>
            <Text style={s.aboardText}>{tr("onbAboard")}</Text>
          </View>
        </Show>
        <Pop progress={progress} at={0.86} style={[s.tickBig, { top: 160 }]}>
          <Icon name="check-circle" size={40} color="#1F6F43" />
        </Pop>
        <Finger
          progress={progress}
          taps={[
            { x: 100, y: 134, at: 0.1 },
            { x: 160, y: 118, at: 0.84 },
          ]}
        />
      </View>
    </PhoneFrame>
  );
};

// 5. After the trip: riders, cash, commission and balance; the limit that blocks publishing.
export const DriverAfterScene = ({ active, colors, tr }) => {
  const progress = useSceneProgress(active, 6500);
  const line = (label, value, at, top, bold) => (
    <Show progress={progress} from={at} style={[s.summaryLine, { top }]}>
      <Text style={[s.summaryLabel, { color: colors.text }]}>{label}</Text>
      <Text style={[s.summaryValue, { color: colors.text, fontWeight: bold ? "800" : "600" }]}>{value}</Text>
    </Show>
  );
  return (
    <PhoneFrame colors={colors}>
      <View style={s.stage}>
        {line(tr("onbSummaryRiders"), "2", 0.05, 16)}
        {line(tr("onbSummaryCash"), "6.000 GNF", 0.15, 46)}
        {line(tr("onbSummaryCommission"), "600 GNF", 0.25, 76, true)}
        {line(tr("onbSummaryBalance"), "600 GNF", 0.35, 106, true)}
        <Show progress={progress} from={0.48} style={[s.gaugeWrap, { top: 150 }]}>
          <View style={[s.gauge, { backgroundColor: colors.text + "18" }]}>
            <Grow progress={progress} from={0.5} to={0.65} share={0.35} style={s.gaugeFill} />
          </View>
          <Text style={[s.gaugeText, { color: colors.text }]}>{tr("onbBalanceLimit")}</Text>
        </Show>
        <Show progress={progress} from={0.72} style={[s.icons, { top: 236 }]}>
          <View style={s.iconItem}>
            <Icon name="star" size={20} color="#B45309" />
            <Text style={[s.iconText, { color: colors.text }]}>{tr("onbRateRiders")}</Text>
          </View>
          <View style={s.iconItem}>
            <Icon name="block" size={20} color="#B3261E" />
            <Text style={[s.iconText, { color: colors.text }]}>{tr("onbBlockRider")}</Text>
          </View>
        </Show>
      </View>
    </PhoneFrame>
  );
};

const s = StyleSheet.create({
  stage: { flex: 1 },
  car: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: CORRIDOR.red,
    borderWidth: 2,
    borderColor: "#fff",
  },
  person: { position: "absolute" },
  stopPin: { position: "absolute" },
  wallet: {
    position: "absolute",
    left: 24,
    right: 24,
    top: 120,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    gap: 6,
  },
  walletText: { fontSize: 20, fontWeight: "800", color: "#1F6F43", textAlign: "center" },
  note: { position: "absolute", left: 12, right: 12, flexDirection: "row", alignItems: "center", gap: 6 },
  noteText: { flex: 1, fontSize: 11 },
  step: {
    position: "absolute",
    left: 12,
    right: 12,
    height: 32,
    borderWidth: 1,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  stepText: { fontSize: 12, fontWeight: "600" },
  week: { position: "absolute", left: 10, right: 10, flexDirection: "row", gap: 4 },
  dayCol: { flex: 1, height: 70, borderWidth: 1, borderRadius: 6, alignItems: "center", paddingTop: 4, gap: 6 },
  dayLabel: { fontSize: 9, fontWeight: "600" },
  tripBlock: { width: 16, height: 26, borderRadius: 4 },
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
  tripCard: {
    position: "absolute",
    left: 12,
    right: 12,
    borderWidth: 1.5,
    borderRadius: 10,
    padding: 10,
  },
  tripTime: { fontSize: 18, fontWeight: "800" },
  tripMeta: { fontSize: 11, marginTop: 2 },
  seats: { position: "absolute", left: 16, right: 16, flexDirection: "row", justifyContent: "space-between" },
  seat: { width: 36, height: 32, borderRadius: 8, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  seatText: { fontSize: 14, fontWeight: "700" },
  blocked: { position: "absolute", left: 12, right: 12, flexDirection: "row", alignItems: "center", gap: 4 },
  blockedText: { flex: 1, fontSize: 10, color: "#B3261E" },
  bigButton: {
    position: "absolute",
    left: 20,
    right: 20,
    height: 40,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  bigButtonText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  autoBox: { position: "absolute", left: 16, right: 16, borderWidth: 2, borderRadius: 12, padding: 12, alignItems: "center" },
  autoTitle: { fontSize: 12, fontWeight: "700" },
  autoCount: { fontSize: 26, fontWeight: "800", textAlign: "center" },
  riderCard: {
    position: "absolute",
    left: 12,
    right: 12,
    height: 40,
    borderWidth: 1,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    gap: 8,
  },
  riderName: { flex: 1, fontSize: 13, fontWeight: "600" },
  aboard: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  aboardText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  tickBig: { position: "absolute", left: 79 },
  summaryLine: { position: "absolute", left: 14, right: 14, flexDirection: "row", justifyContent: "space-between" },
  summaryLabel: { fontSize: 12 },
  summaryValue: { fontSize: 13 },
  gaugeWrap: { position: "absolute", left: 14, right: 14, gap: 6 },
  gauge: { height: 10, borderRadius: 5, overflow: "hidden" },
  gaugeFill: { height: 10, borderRadius: 5, backgroundColor: "#F59E0B" },
  gaugeText: { fontSize: 10 },
  icons: { position: "absolute", left: 14, right: 14, flexDirection: "row", justifyContent: "space-around" },
  iconItem: { alignItems: "center", gap: 4 },
  iconText: { fontSize: 10 },
});
