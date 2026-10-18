import React, { useCallback, useRef, useState } from "react";
import { Dimensions, FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Text, useTheme } from "react-native-paper";
import { Button } from "_atoms";
import { FRAME_HEIGHT } from "./kit";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const VISUAL_HEIGHT = SCREEN_HEIGHT * 0.48;
// The phone frame shrinks on short screens so the text always fits below it.
const FRAME_SCALE = Math.min(1, VISUAL_HEIGHT / (FRAME_HEIGHT + 24));
const VIEWABILITY_CONFIG = { viewAreaCoveragePercentThreshold: 50 };

// The carpool onboarding pager, shared by riders and drivers. Same layout as the
// ride-hailing onboarding: skip at the top, an animated scene, title and text,
// dots, and one main button. Only the visible slide animates.
//
// slides: [{ key, Scene, title, body, sceneLabel }] — text already translated.
// `tr` is passed to each Scene for the words inside its animation. `onSkip`
// defaults to `onDone` when skipping and finishing lead to the same place.
export default function CarpoolOnboarding({ slides, tr, skipLabel, nextLabel, doneLabel, onDone, onSkip = onDone }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const listRef = useRef(null);
  const [current, setCurrent] = useState(0);
  const isLast = current === slides.length - 1;

  const onViewableItemsChanged = useCallback(({ viewableItems }) => {
    if (viewableItems.length > 0) setCurrent(viewableItems[0].index);
  }, []);

  const goNext = () => {
    if (isLast) return onDone();
    listRef.current?.scrollToIndex({ index: current + 1, animated: true });
  };

  const renderSlide = ({ item, index }) => {
    const Scene = item.Scene;
    return (
      <View style={styles.slide}>
        <View
          style={styles.visual}
          accessible
          accessibilityRole="image"
          accessibilityLabel={item.sceneLabel}
        >
          <View style={{ transform: [{ scale: FRAME_SCALE }] }}>
            <Scene active={index === current} colors={colors} tr={tr} />
          </View>
        </View>
        <View style={styles.textBlock}>
          <Text style={[styles.title, { color: colors.text }]} accessibilityRole="header">
            {item.title}
          </Text>
          <Text style={styles.body}>{item.body}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={["top"]}>
      <TouchableOpacity
        style={[styles.skipWrap, { opacity: isLast ? 0 : 1 }]}
        onPress={onSkip}
        disabled={isLast}
        accessibilityRole="button"
        hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}
      >
        <Text style={[styles.skipText, { color: colors.primary }]}>{skipLabel}</Text>
      </TouchableOpacity>

      <FlatList
        ref={listRef}
        data={slides}
        keyExtractor={(item) => item.key}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={VIEWABILITY_CONFIG}
        initialNumToRender={slides.length}
        style={styles.list}
      />

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom + 16, 24) }]}>
        <View style={styles.dots}>
          {slides.map((slide, i) => (
            <View
              key={slide.key}
              style={[
                styles.dot,
                {
                  backgroundColor: i === current ? colors.primary : "#D1D5DB",
                  width: i === current ? 22 : 8,
                },
              ]}
            />
          ))}
        </View>
        <Button mode="contained" onPress={goNext} style={styles.button} contentStyle={styles.buttonContent}>
          {isLast ? doneLabel : nextLabel}
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  skipWrap: { alignSelf: "flex-end", paddingHorizontal: 24, paddingTop: 8, paddingBottom: 4 },
  skipText: { fontSize: 15, fontWeight: "500" },
  list: { flex: 1 },
  slide: { width: SCREEN_WIDTH, flex: 1, paddingHorizontal: 28 },
  visual: { height: VISUAL_HEIGHT, justifyContent: "center", alignItems: "center" },
  textBlock: { marginTop: 20 },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 10, lineHeight: 30 },
  body: { fontSize: 15, color: "#9CA3AF", lineHeight: 23 },
  footer: { paddingHorizontal: 24, paddingTop: 8, gap: 16 },
  dots: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 6 },
  dot: { height: 8, borderRadius: 4 },
  button: { borderRadius: 14 },
  buttonContent: { height: 56 },
});
