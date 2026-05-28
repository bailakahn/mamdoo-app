import React, { useRef, useState, useCallback } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Text, useTheme } from "react-native-paper";
import { useVideoPlayer, VideoView } from "expo-video";
import { Button } from "_atoms";
import { useApp } from "_hooks";
import { t, lang } from "_utils/lang";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const VIDEO_SOURCE = "https://dwfhhymkzgxdd.cloudfront.net/videos/demos/demo.mp4";

const SLIDES = [
  {
    key: "price",
    image: lang === "fr" ? require("_assets/price-fr.png") : require("_assets/price.png"),
    titleKey: "main.onboardingPriceTitle",
    descKey: "main.onboardingPriceDescription",
  },
  {
    key: "destination",
    image: require("_assets/destination.png"),
    titleKey: "main.onboardingDestinationTitle",
    descKey: "main.onboardingDestinationDescription",
  },
  {
    key: "track",
    image: require("_assets/map-3.png"),
    titleKey: "main.onboardingTrackTitle",
    descKey: "main.onboardingTrackDescription",
  },
  {
    key: "video",
    isVideo: true,
    titleKey: "main.onboardingVideoTitle",
    descKey: "main.onboardingVideoDescription",
  },
];

const VIEWABILITY_CONFIG = { viewAreaCoveragePercentThreshold: 50 };

export default function Onboarding() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const app = useApp();
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const player = useVideoPlayer(VIDEO_SOURCE, (p) => {
    p.loop = true;
    p.play();
  });

  const isLast = currentIndex === SLIDES.length - 1;

  const onViewableItemsChanged = useCallback(({ viewableItems }) => {
    if (viewableItems.length > 0) setCurrentIndex(viewableItems[0].index);
  }, []);

  const goNext = () => {
    if (isLast) {
      app.actions.setAppLaunched(true);
      return;
    }
    flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
  };

  const renderSlide = ({ item }) => (
    <View style={styles.slide}>
      <View style={styles.visual}>
        {item.isVideo ? (
          <View style={styles.videoWrap}>
            <VideoView
              player={player}
              style={styles.video}
              contentFit="contain"
              nativeControls={false}
            />
          </View>
        ) : (
          <Image
            source={item.image}
            resizeMode="contain"
            style={styles.image}
            fadeDuration={0}
          />
        )}
      </View>

      <View style={styles.textBlock}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t(item.titleKey)}
        </Text>
        <Text style={styles.description}>{t(item.descKey)}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <TouchableOpacity
        style={[styles.skipWrap, { opacity: isLast ? 0 : 1 }]}
        onPress={() => app.actions.setAppLaunched(true)}
        disabled={isLast}
        hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}
      >
        <Text style={[styles.skipText, { color: colors.primary }]}>
          {t("main.skip")}
        </Text>
      </TouchableOpacity>

      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.key}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={VIEWABILITY_CONFIG}
        initialNumToRender={SLIDES.length}
        style={styles.list}
      />

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom + 16, 24) }]}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor: i === currentIndex ? colors.primary : "#D1D5DB",
                  width: i === currentIndex ? 22 : 8,
                },
              ]}
            />
          ))}
        </View>

        <Button
          mode="contained"
          onPress={goNext}
          style={styles.btn}
          contentStyle={styles.btnContent}
        >
          {isLast ? t("main.onboardingGetStarted") : t("main.next")}
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },

  skipWrap: {
    alignSelf: "flex-end",
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 4,
  },
  skipText: { fontSize: 15, fontWeight: "500" },

  list: { flex: 1 },

  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
    paddingHorizontal: 28,
  },

  visual: {
    height: SCREEN_HEIGHT * 0.44,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: SCREEN_WIDTH * 0.78,
    height: SCREEN_HEIGHT * 0.44,
  },
  videoWrap: {
    width: SCREEN_WIDTH * 0.72,
    height: SCREEN_HEIGHT * 0.44,
    justifyContent: "center",
    alignItems: "center",
  },
  video: {
    width: SCREEN_WIDTH * 0.72,
    height: SCREEN_HEIGHT * 0.44,
  },

  textBlock: {
    marginTop: 28,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 10,
    lineHeight: 32,
  },
  description: {
    fontSize: 15,
    color: "#9CA3AF",
    lineHeight: 23,
  },

  footer: {
    paddingHorizontal: 24,
    paddingTop: 8,
    gap: 16,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  btn: { borderRadius: 14 },
  btnContent: { height: 56 },
});
