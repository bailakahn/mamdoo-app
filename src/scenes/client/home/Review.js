import React, { useState, useEffect } from "react";
import {
  View,
  TouchableWithoutFeedback,
  Keyboard,
  SafeAreaView,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import {
  Text,
  useTheme,
  Headline,
  TextInput,
  List,
  Divider,
} from "react-native-paper";
import { AirbnbRating } from "@rneui/themed";
import { Classes } from "_styles";
import { t } from "_utils/lang";
import { useRide } from "_hooks";
import { Button } from "_atoms";
import { Mixins } from "../../../styles";

export default function ReviewScreen({ navigation, route }) {
  const [rating, setRating] = useState(3);
  const [note, setNote] = useState("");
  const [price, setPrice] = useState(0);

  const ride = useRide();

  const { colors } = useTheme();
  const [ratingColor, setRatingColor] = useState(colors.primary);

  useEffect(() => {
    ride.actions.getRide();
  }, []);

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
          <TouchableWithoutFeedback
            onPress={Keyboard.dismiss}
            accessible={false}
          >
            <View style={{ ...Classes.container(colors) }}>
              {ride.endedRide && (
                <View style={{ flex: 1, width: Mixins.width(0.95, true) }}>
                  <List.Item
                    title={t("rating.ridePrice")}
                    right={() => (
                      <Text variant="titleLarge" style={{ fontWeight: "900" }}>
                        {`${ride.actions.formatPrice(
                          ride.endedRide.maxPrice
                        )} GNF`}
                      </Text>
                    )}
                  />
                  <Divider />
                </View>
              )}
              <View>
                <Headline style={Classes.text(colors)}>
                  {t("rating.rateText") + " ?"}
                </Headline>
              </View>

              <View>
                <AirbnbRating
                  reviews={[
                    t("rating.terrible"),
                    t("rating.bad"),
                    t("rating.okay"),
                    t("rating.good"),
                    t("rating.great"),
                  ]}
                  onFinishRating={(value) => {
                    setRating(value);
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
                  defaultRating={5}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
          <View style={Classes.bottonView(colors)}>
            <View style={{ marginTop: 20 }}>
              <TextInput
                style={{
                  ...Classes.formInput(colors),
                  alignContent: "flex-start",
                  justifyContent: "flex-start",
                  backgroundColor: colors.background,
                }}
                outlineStyle={{ borderRadius: 10 }}
                // mode="outlined"
                multiline
                label={t("rating.addComment")}
                // placeholder={t("rating.addComment")}
                left={
                  <TextInput.Icon
                    icon={"comment-processing-outline"}
                    iconColor={colors.primary}
                  />
                }
                value={note}
                onChangeText={(value) => setNote(value)}
                maxLength={200}
                numberOfLines={2}
                onSubmitEditing={() => Keyboard.dismiss()}
                blurOnSubmit={true}
              />
            </View>
            <Button
              {...Classes.buttonContainer(colors)}
              mode="contained"
              onPress={() => {
                navigation.navigate("Home");
                ride.actions.reviewRide({ rating, note, price });
              }}
            >
              {t("rating.done")}
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
