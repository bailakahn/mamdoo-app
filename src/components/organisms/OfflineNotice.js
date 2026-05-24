import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Network from "expo-network";
import Icon from "@expo/vector-icons/MaterialIcons";
import { t } from "_utils/lang";

const BACK_ONLINE_LINGER_MS = 2500;
const SLIDE_IN_MS = 380;
const SLIDE_OUT_MS = 280;

export default function OfflineNotice() {
  const network = Network.useNetworkState();
  const insets = useSafeAreaInsets();
  const slideY = useRef(new Animated.Value(-80)).current;
  const [visible, setVisible] = useState(false);
  const [isBackOnline, setIsBackOnline] = useState(false);
  const wasOfflineRef = useRef(false);
  const lingerTimer = useRef(null);

  const slideIn = () => {
    Animated.spring(slideY, {
      toValue: 0,
      useNativeDriver: true,
      tension: 90,
      friction: 12,
    }).start();
  };

  const slideOut = (onDone) => {
    Animated.timing(slideY, {
      toValue: -80,
      duration: SLIDE_OUT_MS,
      useNativeDriver: true,
    }).start(() => onDone?.());
  };

  useEffect(() => {
    if (network.isConnected === null) return;

    clearTimeout(lingerTimer.current);

    if (!network.isConnected) {
      wasOfflineRef.current = true;
      setIsBackOnline(false);
      setVisible(true);
      slideIn();
    } else if (wasOfflineRef.current) {
      setIsBackOnline(true);
      lingerTimer.current = setTimeout(() => {
        slideOut(() => {
          setVisible(false);
          wasOfflineRef.current = false;
        });
      }, BACK_ONLINE_LINGER_MS);
    }

    return () => clearTimeout(lingerTimer.current);
  }, [network.isConnected]);

  if (!visible) return null;

  const top = insets.top + 10;
  const bg = isBackOnline ? "#16A34A" : "#111827";
  const iconName = isBackOnline ? "wifi" : "wifi-off";
  const label = isBackOnline
    ? t("main.backOnline")
    : t("main.noInternetConnection");

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[styles.wrapper, { top, transform: [{ translateY: slideY }] }]}
    >
      <View style={[styles.pill, { backgroundColor: bg }]}>
        <View
          style={[
            styles.iconCircle,
            { backgroundColor: isBackOnline ? "#ffffff22" : "#ffffff18" },
          ]}
        >
          <Icon name={iconName} size={14} color="#fff" />
        </View>
        <Text style={styles.label}>{label}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 9999,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 9,
    paddingLeft: 8,
    paddingRight: 16,
    borderRadius: 100,
    gap: 8,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  iconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
  },
  label: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.1,
  },
});
