import React, { useState } from "react";
import {
  View,
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Text, useTheme, TextInput } from "react-native-paper";
import Icon from "@expo/vector-icons/MaterialIcons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { t } from "_utils/lang";
import { useFeedback } from "_hooks";
import { Button } from "_atoms";

const STAR_COLORS = ["", "#EF4444", "#F97316", "#F59E0B", "#22C55E", "#22C55E"];
const STAR_LABEL_KEYS = ["", "rating.terrible", "rating.bad", "rating.okay", "rating.good", "rating.great"];

export default function FeedbackScreen({ navigation }) {
  const [feedback, setFeedback] = useState({ rating: 5, text: "" });
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const feedbackHook = useFeedback();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const starColor = STAR_COLORS[feedback.rating] ?? colors.primary;
  const starLabel = t(STAR_LABEL_KEYS[feedback.rating]) || "";

  const handleSubmit = () => {
    setSubmitting(true);
    feedbackHook.actions.saveFeedback(feedback, {
      setNewFeedback: setFeedback,
      onSuccess: () => {
        setSubmitting(false);
        setSuccess(true);
        setTimeout(() => navigation.goBack(), 2000);
      },
    });
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={["top"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              {t("feedback.title")}
            </Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.body}>
            {/* Success state */}
            {success ? (
              <View style={styles.successContainer}>
                <View style={[styles.successIcon, { backgroundColor: colors.primary + "20" }]}>
                  <Icon name="check-circle" size={56} color={colors.primary} />
                </View>
                <Text style={[styles.successTitle, { color: colors.text }]}>
                  {t("account.feedbackConfirmation")}
                </Text>
              </View>
            ) : (
              <>
                {/* Icon */}
                <View style={[styles.iconContainer, { backgroundColor: colors.primary + "15" }]}>
                  <MaterialCommunityIcons name="comment-text-outline" size={48} color={colors.primary} />
                </View>

                <Text style={[styles.subtitle, { color: "#9CA3AF" }]}>
                  {t("feedback.description")}
                </Text>

                {/* Star rating card */}
                <View style={[styles.card, { backgroundColor: "#F59E0B18" }]}>
                  <Text style={[styles.cardLabel, { color: "#9CA3AF" }]}>
                    {t("feedback.rating")}
                  </Text>
                  <View style={styles.starsRow}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <TouchableOpacity
                        key={star}
                        onPress={() => setFeedback({ ...feedback, rating: star })}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <MaterialCommunityIcons
                          name={star <= feedback.rating ? "star" : "star-outline"}
                          size={40}
                          color={star <= feedback.rating ? starColor : "#D1D5DB"}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                  {starLabel ? (
                    <Text style={[styles.starLabel, { color: starColor }]}>{starLabel}</Text>
                  ) : null}
                </View>

                {/* Comment card */}
                <View style={[styles.card, { backgroundColor: colors.primary + "18" }]}>
                  <Text style={[styles.cardLabel, { color: "#9CA3AF" }]}>
                    {t("feedback.placeholder")}
                  </Text>
                  <TextInput
                    mode="outlined"
                    multiline
                    numberOfLines={5}
                    placeholder={t("feedback.placeholder")}
                    value={feedback.text}
                    onChangeText={(v) => setFeedback({ ...feedback, text: v })}
                    maxLength={200}
                    onSubmitEditing={() => Keyboard.dismiss()}
                    submitBehavior="blurAndSubmit"
                    style={styles.textInput}
                    outlineStyle={{ borderRadius: 12 }}
                    contentStyle={{ minHeight: 100, textAlignVertical: "top" }}
                  />
                  <Text style={styles.charCount}>{feedback.text.length}/200</Text>
                </View>
              </>
            )}
          </View>
        </ScrollView>

        {/* Send button */}
        {!success && (
          <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom + 8, 20) }]}>
            <Button
              mode="contained"
              disabled={!feedback.text.trim() || submitting}
              loading={submitting}
              onPress={handleSubmit}
              style={styles.sendBtn}
              contentStyle={{ height: 52 }}
            >
              {t("feedback.send")}
            </Button>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingVertical: 14,
  },
  headerTitle: { fontSize: 16, fontWeight: "700" },
  body: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 20 },
  iconContainer: {
    width: 88, height: 88, borderRadius: 44,
    justifyContent: "center", alignItems: "center",
    alignSelf: "center", marginBottom: 16,
  },
  subtitle: { textAlign: "center", fontSize: 14, lineHeight: 20, marginBottom: 24 },
  card: { borderRadius: 16, padding: 18, marginBottom: 16 },
  cardLabel: { fontSize: 12, fontWeight: "700", letterSpacing: 0.6, marginBottom: 14, textTransform: "uppercase" },
  starsRow: { flexDirection: "row", justifyContent: "center", gap: 8, marginBottom: 12 },
  starLabel: { textAlign: "center", fontSize: 15, fontWeight: "700" },
  textInput: { backgroundColor: "transparent" },
  charCount: { color: "#9CA3AF", fontSize: 12, textAlign: "right", marginTop: 6 },
  footer: { paddingHorizontal: 20, paddingTop: 12 },
  sendBtn: { borderRadius: 14 },
  successContainer: { alignItems: "center", paddingTop: 60, paddingHorizontal: 24 },
  successIcon: { width: 100, height: 100, borderRadius: 50, justifyContent: "center", alignItems: "center", marginBottom: 20 },
  successTitle: { fontSize: 18, fontWeight: "700", textAlign: "center" },
});
