import React, { useState } from "react";
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
import { useRide } from "_hooks/partner";
import { Button, LoadingV2 } from "_atoms";
import { t2 } from "_utils/lang";

export default function RideSummaryScene({ navigation }) {
  const ride = useRide();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [rating, setRating] = useState(5);
  const [note, setNote] = useState("");
  const [ratingColor, setRatingColor] = useState(colors.primary);

  if (!ride.request?.client || !ride?.ridePrice) return <LoadingV2 />;

  const { client, dropOff } = ride.request;
  const clientInitials =
    `${client.firstName.charAt(0)}${client.lastName.charAt(0)}`.toUpperCase();

  const handleDone = () => {
    ride.actions.reviewRide({ rating, note });
    ride.actions.resetRide();
    navigation.navigate("Home");
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
                {t2("ride.tripCompleted")}
              </Text>
            </View>

            {/* ── Client card ── */}
            <View style={[styles.card, { backgroundColor: colors.primary + "18" }]}>
              <View style={styles.clientRow}>
                <Avatar.Text size={52} label={clientInitials} />
                <View style={styles.clientInfo}>
                  <Text
                    variant="titleMedium"
                    style={{ fontWeight: "bold", color: colors.text }}
                  >
                    {`${client.firstName} ${client.lastName}`}
                  </Text>
                  {dropOff?.text ? (
                    <View style={styles.infoRow}>
                      <Icon name="location-on" size={14} color={colors.error} />
                      <Text
                        style={styles.infoText}
                        numberOfLines={1}
                      >
                        {dropOff.text}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>
            </View>

            {/* ── Earnings card ── */}
            <View style={[styles.card, { backgroundColor: colors.primary + "18" }]}>
              <View style={styles.earningsRow}>
                <View style={styles.earningsLabel}>
                  <Icon name="payments" size={20} color={colors.primary} />
                  <Text style={[styles.earningsLabelText, { color: "#9CA3AF" }]}>
                    {t2("ride.price")}
                  </Text>
                </View>
                <Text
                  variant="titleLarge"
                  style={{ fontWeight: "900", color: colors.text }}
                >
                  {ride.actions.formatPrice(ride.ridePrice)} GNF
                </Text>
              </View>
            </View>

            {/* ── Rating ── */}
            <View style={styles.ratingSection}>
              <Text
                style={[styles.ratingTitle, { color: colors.text }]}
              >
                {t2("ride.rateClient")}
              </Text>
              <Rating
                containerStyle={{ marginTop: 8 }}
                textStyle={{ fontSize: 16, fontWeight: "600" }}
                reviews={[
                  t2("rating.terrible"),
                  t2("rating.bad"),
                  t2("rating.okay"),
                  t2("rating.good"),
                  t2("rating.great"),
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
              label={t2("rating.addComment")}
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
            {t2("ride.doneAndGoHome")}
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
  },

  // ── Success header ─────────────────────────────────────────────────────────
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

  // ── Cards ─────────────────────────────────────────────────────────────────
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
  earningsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  earningsLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  earningsLabelText: {
    fontSize: 14,
    fontWeight: "500",
  },

  // ── Rating ─────────────────────────────────────────────────────────────────
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

  // ── Comment ────────────────────────────────────────────────────────────────
  commentInput: {
    marginBottom: 24,
  },

  // ── Footer ─────────────────────────────────────────────────────────────────
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
