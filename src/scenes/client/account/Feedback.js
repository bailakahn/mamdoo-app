import React, { useState } from "react";
import {
  View,
  Keyboard,
  SafeAreaView,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import { Text, useTheme, Headline, TextInput } from "react-native-paper";
import { AirbnbRating } from "@rneui/themed";
import { Classes } from "_styles";
import { t } from "_utils/lang";
import { useFeedback } from "_hooks";
import { Button } from "_atoms";
import { Mixins } from "../../../styles";

export default function FeedbackScreen({ navigation }) {
  const [newFeedback, setNewFeedback] = useState({
    rating: 3,
    text: "",
  });

  const feedback = useFeedback();

  const { colors } = useTheme();
  const [ratingColor, setRatingColor] = useState(colors.primary);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colors.background,
        alignItems: "center",
      }}
    >
      <KeyboardAvoidingView
        {...(Platform.OS === "ios"
          ? {
              enabled: true,
              behavior: "padding",
              keyboardVerticalOffset: 5,
            }
          : {})}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            alignItems: "center",
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ ...Classes.container(colors) }}>
            <View
              style={{
                alignItems: "center",
              }}
            >
              <Headline style={{ ...Classes.text(colors), fontWeight: "bold" }}>
                {t("feedback.title")}
              </Headline>
            </View>

            <View
              style={{
                marginTop: 20,
              }}
            >
              <Text style={{ fontSize: 20 }}>{t("feedback.rating")}</Text>
              <AirbnbRating
                reviews={[
                  t("rating.terrible"),
                  t("rating.bad"),
                  t("rating.okay"),
                  t("rating.good"),
                  t("rating.great"),
                ]}
                defaultRating={newFeedback.rating}
                onFinishRating={(value) => {
                  setNewFeedback({
                    ...newFeedback,
                    rating: value,
                  });
                  setRatingColor(
                    [1, 2].includes(value)
                      ? colors.error
                      : [3].includes(value)
                      ? colors.primary
                      : "#4DD3BC"
                  );
                }}
                reviewColor={ratingColor}
                selectedColor={ratingColor}
              />
            </View>

            <View style={{ marginTop: 20 }}>
              <TextInput
                style={{
                  ...Classes.formInput(colors),
                  height: Mixins.height(0.2, true),
                  alignContent: "flex-start",
                  justifyContent: "flex-start",
                }}
                outlineStyle={{ borderRadius: 10 }}
                mode="outlined"
                multiline
                placeholder={t("feedback.placeholder")}
                value={newFeedback.text}
                onChangeText={(value) =>
                  setNewFeedback({
                    ...newFeedback,
                    text: value,
                  })
                }
                maxLength={200}
                numberOfLines={4}
                onSubmitEditing={() => Keyboard.dismiss()}
                blurOnSubmit={true}
              />
            </View>
          </View>
          <View style={Classes.bottonView(colors)}>
            <Button
              {...Classes.buttonContainer(colors)}
              disabled={!newFeedback.text}
              mode="contained"
              onPress={() => {
                feedback.actions.saveFeedback(newFeedback, {
                  setNewFeedback,
                });
              }}
            >
              {t("feedback.send")}
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
