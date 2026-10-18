import React, { useEffect } from "react";
import { StyleSheet, View, Text } from "react-native";
import Animated, {
  Easing,
  Extrapolation,
  cancelAnimation,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

// Building blocks for the onboarding scenes. Every scene runs on one clock,
// `progress`, looping 0 → 1; each element appears, moves or taps at fixed points
// on that clock. Keeps the scenes declarative ("the price shows from 0.6") rather
// than a pile of separate timers.

export const FRAME_WIDTH = 210;
export const FRAME_HEIGHT = 330;

export const CORRIDOR = { red: "#C8322D", blue: "#2563A8", purple: "#6D4AA6" };

// The scene clock. Runs only while the slide is visible; with the phone's Reduce
// Motion setting on, it stays at the end so each scene shows its final frame.
export const useSceneProgress = (active, durationMs) => {
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(reduceMotion ? 1 : 0);

  useEffect(() => {
    cancelAnimation(progress);
    if (reduceMotion) {
      progress.value = 1;
      return;
    }
    if (!active) {
      progress.value = 0;
      return;
    }
    progress.value = 0;
    progress.value = withRepeat(withTiming(1, { duration: durationMs, easing: Easing.linear }), -1, false);
    return () => cancelAnimation(progress);
  }, [active, reduceMotion, durationMs]);

  return progress;
};

// 0 before `start`, 1 after `end`, linear in between.
export const seg = (value, start, end) => {
  "worklet";
  return interpolate(value, [start, end], [0, 1], Extrapolation.CLAMP);
};

// Visible from `from` to `to` (fades in and out over `fade`).
export const Show = ({ progress, from = 0, to = 1.01, fade = 0.04, style, children }) => {
  const animated = useAnimatedStyle(() => {
    const fadeIn = seg(progress.value, from, from + fade);
    const fadeOut = to > 1 ? 1 : 1 - seg(progress.value, to - fade, to);
    const visible = Math.min(fadeIn, fadeOut);
    return { opacity: visible, transform: [{ translateY: (1 - fadeIn) * 6 }] };
  });
  return <Animated.View style={[style, animated]}>{children}</Animated.View>;
};

// Pops in with a small bounce at `at`.
export const Pop = ({ progress, at, style, children }) => {
  const animated = useAnimatedStyle(() => {
    const t = seg(progress.value, at, at + 0.05);
    const scale = interpolate(t, [0, 0.7, 1], [0.6, 1.08, 1], Extrapolation.CLAMP);
    return { opacity: t, transform: [{ scale }] };
  });
  return <Animated.View style={[style, animated]}>{children}</Animated.View>;
};

// Reanimated's interpolate needs at least two points; a single point (one tap,
// or something that never moves) becomes the same point twice.
const atLeastTwo = (points) =>
  points.length > 1 ? points : [points[0], { ...points[0], at: Math.min(points[0].at + 0.001, 1) }];

// Moves its children through `points` ({ x, y, at }) in order.
export const Mover = ({ progress, points: given, style, children }) => {
  const points = atLeastTwo(given);
  const animated = useAnimatedStyle(() => {
    const times = points.map((p) => p.at);
    return {
      transform: [
        { translateX: interpolate(progress.value, times, points.map((p) => p.x), Extrapolation.CLAMP) },
        { translateY: interpolate(progress.value, times, points.map((p) => p.y), Extrapolation.CLAMP) },
      ],
    };
  });
  return <Animated.View style={[styles.mover, style, animated]}>{children}</Animated.View>;
};

// A bar that fills from 0 to `share` (0–1) of its parent's width between `from` and `to`.
export const Grow = ({ progress, from, to, share, style }) => {
  const animated = useAnimatedStyle(() => ({ width: `${seg(progress.value, from, to) * share * 100}%` }));
  return <Animated.View style={[style, animated]} />;
};

// The finger: a translucent dot that glides between taps and pulses on each one.
export const Finger = ({ progress, taps: given }) => {
  const taps = atLeastTwo(given);
  const animated = useAnimatedStyle(() => {
    const times = taps.map((tap) => tap.at);
    let pressed = 0;
    for (const tap of taps) {
      pressed = Math.max(pressed, 1 - Math.abs(progress.value - tap.at) / 0.025);
    }
    const first = times[0];
    const last = times[times.length - 1];
    const visible = seg(progress.value, first - 0.08, first - 0.03) * (1 - seg(progress.value, last + 0.05, last + 0.1));
    return {
      opacity: visible * 0.85,
      transform: [
        { translateX: interpolate(progress.value, times, taps.map((tap) => tap.x), Extrapolation.CLAMP) },
        { translateY: interpolate(progress.value, times, taps.map((tap) => tap.y), Extrapolation.CLAMP) },
        { scale: 1 - Math.max(pressed, 0) * 0.3 },
      ],
    };
  });
  return <Animated.View pointerEvents="none" style={[styles.finger, animated]} />;
};

// Several values in the same spot, each shown for its own window, e.g. an ETA
// that ticks down or a countdown.
export const Ticker = ({ progress, steps, textStyle }) => (
  <View>
    {steps.map((step, i) => (
      <Show
        key={i}
        progress={progress}
        from={step.at}
        to={steps[i + 1]?.at ?? 1.01}
        fade={0.015}
        style={i === 0 ? null : StyleSheet.absoluteFill}
      >
        <Text style={textStyle}>{step.text}</Text>
      </Show>
    ))}
  </View>
);

// A straight line between two points, for routes drawn without an image.
export const Line = ({ from, to, color, width = 4, style }) => {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  return (
    <View
      style={[
        {
          position: "absolute",
          left: from.x + dx / 2 - length / 2,
          top: from.y + dy / 2 - width / 2,
          width: length,
          height: width,
          borderRadius: width / 2,
          backgroundColor: color,
          transform: [{ rotate: `${angle}deg` }],
        },
        style,
      ]}
    />
  );
};

// A phone outline the scene plays inside.
export const PhoneFrame = ({ colors, children }) => (
  <View style={[styles.frame, { borderColor: colors.text + "22", backgroundColor: colors.background }]}>
    <View style={[styles.notch, { backgroundColor: colors.text + "22" }]} />
    <View style={styles.screen}>{children}</View>
  </View>
);

const styles = StyleSheet.create({
  frame: {
    width: FRAME_WIDTH,
    height: FRAME_HEIGHT,
    borderRadius: 30,
    borderWidth: 6,
    overflow: "hidden",
    alignSelf: "center",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  notch: { width: 60, height: 6, borderRadius: 3, alignSelf: "center", marginTop: 8 },
  // Scenes position things in this box: about 198 × 300.
  screen: { flex: 1 },
  mover: { position: "absolute", left: 0, top: 0 },
  finger: {
    position: "absolute",
    left: -14,
    top: -14,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#9CA3AF",
    borderWidth: 2,
    borderColor: "#fff",
  },
});
