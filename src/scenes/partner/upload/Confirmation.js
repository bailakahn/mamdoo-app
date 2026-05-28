import React, { useRef, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme, Text } from "react-native-paper";
import LottieView from "lottie-react-native";
import { t2 } from "_utils/lang";
import { Button } from "_atoms";
import { usePartner } from "_hooks";
import ReadyAnimation from "_assets/animation/ready.json";

export default function Confirmation() {
  const { colors } = useTheme();
  const partner = usePartner();
  const insets = useSafeAreaInsets();
  const animation = useRef(null);

  useEffect(() => {
    animation.current?.play();
  }, []);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={["top"]}>
      <View style={styles.center}>
        <LottieView
          ref={animation}
          source={ReadyAnimation}
          style={styles.lottie}
          autoPlay
          loop
        />
        <Text style={[styles.title, { color: colors.text }]}>{t2("upload.uploadConfirmation")}</Text>
        <Text style={styles.subtitle}>{t2("upload.timeToValidate")}</Text>
      </View>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom + 16, 24) }]}>
        <Button
          mode="contained"
          onPress={() => partner.actions.setPartner({ ...partner.partner, active: true, status: "pending" })}
          style={styles.btn}
          contentStyle={styles.btnContent}
        >
          {t2("upload.continue")}
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },

  lottie: { width: 220, height: 220 },

  title: { fontSize: 24, fontWeight: "700", textAlign: "center", marginTop: 24, marginBottom: 12 },
  subtitle: { fontSize: 15, color: "#9CA3AF", textAlign: "center", lineHeight: 22 },

  footer: { paddingHorizontal: 24, paddingTop: 12 },
  btn: { borderRadius: 14 },
  btnContent: { height: 56 },
});
