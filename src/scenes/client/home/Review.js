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
  Avatar,
} from "react-native-paper";
import { AirbnbRating } from "@rneui/themed";
import { Classes } from "_styles";
import { t } from "_utils/lang";
import { useRide } from "_hooks";
import { Button, LoadingV2 } from "_atoms";
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

  if (!ride.endedRide) return <LoadingV2 />;

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
          <View
            style={{
              flexGrow: 1,
              justifyContent: "center",
            }}
          >
            <Text variant="titleLarge" style={{ fontWeight: "bold" }}>
              {t("ride.rideSummaryTitle")}
            </Text>
          </View>

          <TouchableWithoutFeedback
            onPress={Keyboard.dismiss}
            accessible={false}
          >
            <View style={{ ...Classes.container(colors) }}>
              {ride.endedRide && (
                <View
                  style={{
                    flex: 1,
                    width: Mixins.width(0.95, true),
                  }}
                >
                  <List.Item
                    title={t("rating.ridePrice")}
                    right={() => (
                      <Text variant="titleLarge" style={{ fontWeight: "900" }}>
                        {`${ride.actions.formatPrice(
                          ride.endedRide.finalPrice || ride.endedRide.maxPrice
                        )} GNF`}
                      </Text>
                    )}
                    style={{
                      borderRadius: 10,
                    }}
                  />
                  <Divider />
                </View>
              )}

              <View style={{ alignItems: "center", marginBottom: 20 }}>
                <View>
                  <Avatar.Text
                    size={70}
                    label={`${ride.endedRide.driver?.firstName
                      .charAt(0)
                      .toUpperCase()}${ride.endedRide.driver?.lastName
                      .charAt(0)
                      .toUpperCase()}`}
                  />
                </View>

                <View
                  style={{
                    marginTop: 20,
                  }}
                >
                  <Text style={{ fontWeight: "900" }} variant="titleLarge">
                    {`${ride.endedRide.driver.firstName} ${ride.endedRide.driver.lastName}`}
                  </Text>
                </View>
              </View>

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
            <View style={{ marginTop: 20, marginBottom: 20 }}>
              <TextInput
                style={{
                  // ...Classes.formInput(colors),
                  width: Mixins.width(0.93, true),
                  // height: Mixins.width(0.2, true),
                  // fontSize: 20,
                  marginBottom: 20,
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
