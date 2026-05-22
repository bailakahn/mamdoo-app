import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Keyboard,
  ScrollView,
  Platform,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Text, useTheme, Avatar, TextInput, Divider } from "react-native-paper";
import Icon from "@expo/vector-icons/MaterialIcons";
import { Rating } from "_molecules";
import { t } from "_utils/lang";
import { useRide } from "_hooks";
import { Button, LoadingV2 } from "_atoms";

export default function ReviewScreen({ navigation }) {
  const [rating, setRating] = useState(5);
  const [note, setNote] = useState("");

  const ride = useRide();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [ratingColor, setRatingColor] = useState(colors.primary);

  useEffect(() => {
    ride.actions.getRide();
  }, []);

  if (!ride.endedRide) return <LoadingV2 />;

  const { driver, dropOff, finalPrice, maxPrice } = ride.endedRide;
  const driverInitials = driver
    ? `${driver.firstName.charAt(0)}${driver.lastName.charAt(0)}`.toUpperCase()
    : "??";

  const handleDone = () => {
    navigation.navigate("Home");
    ride.actions.reviewRide({ rating, note, price: 0 });
  };

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
      >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* ── Success header ── */}
            <View style={styles.successHeader}>
              <View style={[styles.successIcon, { backgroundColor: colors.primary + "22" }]}>
                <Icon name="check-circle" size={56} color={colors.primary} />
              </View>
              <Text
                variant="headlineSmall"
                style={[styles.successTitle, { color: colors.text }]}
              >
                {t("ride.tripCompleted")}
              </Text>
            </View>

            {/* ── Driver card ── */}
            <View style={[styles.card, { backgroundColor: colors.primary + "18" }]}>
              <View style={styles.clientRow}>
                <Avatar.Text size={52} label={driverInitials} />
                <View style={styles.clientInfo}>
                  <Text
                    variant="titleMedium"
                    style={{ fontWeight: "bold", color: colors.text }}
                  >
                    {driver ? `${driver.firstName} ${driver.lastName}` : ""}
                  </Text>
                  {dropOff?.text ? (
                    <View style={styles.infoRow}>
                      <Icon name="location-on" size={14} color={colors.error} />
                      <Text style={styles.infoText} numberOfLines={1}>
                        {dropOff.text}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>
            </View>

            {/* ── Price card ── */}
            <View style={[styles.card, { backgroundColor: colors.primary + "18" }]}>
              <View style={styles.priceRow}>
                <View style={styles.priceLabel}>
                  <Icon name="payments" size={20} color={colors.primary} />
                  <Text style={[styles.priceLabelText, { color: "#9CA3AF" }]}>
                    {t("rating.ridePrice")}
                  </Text>
                </View>
                <Text variant="titleLarge" style={{ fontWeight: "900", color: colors.text }}>
                  {`${ride.actions.formatPrice(finalPrice || maxPrice)} GNF`}
                </Text>
              </View>
            </View>

            {/* ── Rating ── */}
            <View style={styles.ratingSection}>
              <Text style={[styles.ratingTitle, { color: colors.text }]}>
                {t("rating.rateDriver")}
              </Text>
              <Rating
                containerStyle={{ marginTop: 8 }}
                textStyle={{ fontSize: 16, fontWeight: "600" }}
                reviews={[
                  t("rating.terrible"),
                  t("rating.bad"),
                  t("rating.okay"),
                  t("rating.good"),
                  t("rating.great"),
                ]}
                defaultRating={5}
                iconSize={44}
                selectedColor={ratingColor}
                reviewColor={ratingColor}
                onFinishRating={(value) => {
                  setRating(value);
                  setRatingColor(
                    [1, 2].includes(value)
                      ? colors.error
                      : value === 3
                      ? "#F59E0B"
                      : colors.primary
                  );
                }}
              />
            </View>

            {/* ── Comment ── */}
            <TextInput
              mode="outlined"
              multiline
              numberOfLines={3}
              label={t("rating.addComment")}
              value={note}
              onChangeText={setNote}
              maxLength={200}
              style={[styles.commentInput, { backgroundColor: colors.background }]}
              outlineStyle={{ borderRadius: 12 }}
              left={
                <TextInput.Icon
                  icon="comment-processing-outline"
                  iconColor={colors.primary}
                />
              }
              onSubmitEditing={() => Keyboard.dismiss()}
            />
          </ScrollView>

        {/* ── Pinned footer ── */}
        <View style={[styles.footer, { paddingBottom: insets.bottom + 8 }]}>
          <Divider style={{ marginBottom: 12 }} />
          <Button
            mode="contained"
            onPress={handleDone}
            style={styles.ctaButton}
            contentStyle={styles.ctaButtonContent}
            icon="home"
          >
            {t("ride.doneAndGoHome")}
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
  },

  successHeader: {
    alignItems: "center",
    paddingVertical: 28,
  },
  successIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  successTitle: {
    fontWeight: "bold",
    textAlign: "center",
  },

  card: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
  },
  clientRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  clientInfo: {
    flex: 1,
    gap: 6,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  infoText: {
    color: "#9CA3AF",
    fontSize: 13,
    flex: 1,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  priceLabelText: {
    fontSize: 14,
    fontWeight: "500",
  },

  ratingSection: {
    marginTop: 8,
    marginBottom: 20,
    alignItems: "center",
  },
  ratingTitle: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },

  commentInput: {
    marginBottom: 24,
  },

  footer: {
    paddingHorizontal: 24,
    paddingTop: 4,
  },
  ctaButton: {
    borderRadius: 14,
  },
  ctaButtonContent: {
    height: 56,
  },
});
