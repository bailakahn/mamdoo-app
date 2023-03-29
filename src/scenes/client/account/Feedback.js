import React, { useState } from "react";
import {
  View,
  TouchableWithoutFeedback,
  Keyboard,
  SafeAreaView,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { Text, useTheme, Headline, TextInput } from "react-native-paper";
import { AirbnbRating } from "@rneui/themed";
import { Classes } from "_styles";
import { t } from "_utils/lang";
import { useNotifications, useLanguage, useFeedback } from "_hooks";
import { Button } from "_atoms";

export default function FeedbackScreen({ navigation, route }) {
  const [newFeedback, setNewFeedback] = useState({
    rating: 3,
    text: "",
  });

  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const feedback = useFeedback();

  useNotifications();
  useLanguage();

  const { colors } = useTheme();
  const [ratingColor, setRatingColor] = useState(colors.primary);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colors.background,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {showSuccessMessage && (
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            marginTop: 30,
          }}
        >
          <Text
            style={{
              fontSize: 20,
              marginLeft: 10,
              color: colors.primary,
            }}
          >
            {t("profile.sucessfullySaved")}
          </Text>
        </View>
      )}

      <KeyboardAvoidingView
        behavior="height"
        style={{ flex: 1, paddingHorizontal: 10 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
          keyboardDismissMode="interactive"
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <TouchableWithoutFeedback
            onPress={Keyboard.dismiss}
            accessible={false}
          >
            <View style={{ ...Classes.container(colors) }}>
              <View
                style={{
                  alignItems: "center",
                }}
              >
                <Headline
                  style={{ ...Classes.text(colors), fontWeight: "bold" }}
                >
                  {t("feedback.title")}
                </Headline>
                {/* <View
                  style={{
                    padding: 10,
                  }}
                >
                  <Text style={{ fontSize: 20 }}>
                    {t("feedback.description")}
                  </Text>
                </View> */}
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
                    height: 200,
                    alignContent: "flex-start",
                    justifyContent: "flex-start",
                  }}
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

              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  marginTop: 30,
                  flexDirection: "row",
                }}
              >
                <Button
                  {...Classes.callButtonContainer(colors)}
                  disabled={!newFeedback.text}
                  mode="contained"
                  onPress={() => {
                    console.log({ newFeedback });
                    feedback.actions.saveFeedback(newFeedback, {
                      setShowSuccessMessage,
                      setNewFeedback,
                    });
                    // navigation.navigate("Account");
                  }}
                >
                  {`${t("feedback.send")}`}
                </Button>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
