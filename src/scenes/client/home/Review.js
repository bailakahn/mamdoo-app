import React, { useState, useEffect } from "react";
import {
  View,
  TouchableWithoutFeedback,
  Keyboard,
  SafeAreaView,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { Text, useTheme, Headline, TextInput, Chip } from "react-native-paper";
import { AirbnbRating } from "@rneui/themed";
import { Classes } from "_styles";
import { t } from "_utils/lang";
import { useProxy, useNotifications, useLanguage, useRide } from "_hooks";
import { Button } from "_atoms";

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
        justifyContent: "center",
      }}
    >
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
              {ride.endedRide && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "baseline",
                    marginBottom: 20,
                  }}
                >
                  <Text variant="titleLarge" style={{ fontWeight: "bold" }}>
                    {`${t("rating.ridePrice")}: `}
                  </Text>
                  <Text variant="titleLarge">
                    {`${ride.actions.formatPrice(ride.endedRide.maxPrice)} GNF`}
                  </Text>
                </View>
              )}
              <View>
                <Headline style={Classes.text(colors)}>
                  {t("rating.rateDriver")}
                </Headline>
                <Text>{t("rating.rateText")}</Text>
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
                />
              </View>

              <View style={{ marginTop: 20 }}>
                <TextInput
                  style={{
                    ...Classes.formInput(colors),
                    height: 100,
                    alignContent: "flex-start",
                    justifyContent: "flex-start",
                  }}
                  outlineStyle={{ borderRadius: 10 }}
                  mode="outlined"
                  multiline
                  label={"Note"}
                  placeholder={t("rating.notePlaceHolder")}
                  value={note}
                  onChangeText={(value) => setNote(value)}
                  maxLength={200}
                  numberOfLines={2}
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
                  mode="contained"
                  onPress={() => {
                    navigation.navigate("Home");
                    ride.actions.reviewRide({ rating, note, price });
                  }}
                >
                  {`${t("rating.done")}`}
                </Button>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
