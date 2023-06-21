import { useEffect, useRef, useState } from "react";
import {
  View,
  KeyboardAvoidingView,
  ScrollView,
  SafeAreaView,
  Platform,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useTheme, Text, Divider, TextInput, List } from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { Classes } from "_styles";
import { t } from "_utils/lang";
import {
  useRide,
  useLocation,
  useApp,
  useUser,
  useTheme as useMamdooTheme,
} from "_hooks";

function ModalScreen({ navigation }) {
  const { colors } = useTheme();
  const ride = useRide();
  const location = useLocation();
  const theme = useMamdooTheme();
  const app = useApp();
  const pickUpRef = useRef();
  const dropOffRef = useRef();
  const user = useUser();

  const [input, setInput] = useState("dropOff");

  const refreshAsync = async () => {
    const currentLocation = await location.actions.getCurrentPosition();

    const results = await location.actions.getPlace(
      `${currentLocation?.latitude},${currentLocation?.longitude}`
    );

    ride.actions.setNewRide({
      ...ride.newRide,
      pickUp: {
        // text: results[0].vicinity.split(",")[0],
        text: t("home.currentPosition"),
        location: {
          latitude: currentLocation?.latitude,
          longitude: currentLocation?.longitude,
        },
        placeId: results[0].place_id,
      },
    });
  };

  useEffect(() => {
    dropOffRef.current.focus();
    refreshAsync();
  }, []);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
    >
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "flex-start",
          backgroundColor: colors.background,
        }}
      >
        <View>
          <View>
            <TextInput
              ref={pickUpRef}
              style={Classes.rideFormInput(colors, theme.isDarkMode)}
              outlineStyle={{ borderRadius: 5, borderWidth: 0 }}
              mode="outlined"
              placeholder={t("home.from")}
              value={ride.newRide.pickUp.text}
              onChangeText={(value) => {
                location.actions.getPredictions({
                  input: value,
                  location: `${location.location?.latitude},${location.location?.longitude}`,
                  user: user.user,
                });
                ride.actions.setNewRide({
                  ...ride.newRide,
                  pickUp: {
                    // ...ride.newRide.pickUp,
                    location: {},
                    text: value,
                  },
                });
              }}
              right={
                <TextInput.Icon
                  style={{ marginTop: 15 }}
                  icon={"close-circle-outline"}
                  iconColor={colors.primary}
                  onPress={() =>
                    ride.actions.setNewRide({
                      ...ride.newRide,
                      pickUp: {
                        text: "",
                        placeId: "",
                        location: {},
                      },
                    })
                  }
                />
              }
              onFocus={() => {
                setInput("pickUp");
                location.actions.setSearchPredictions([]);
              }}
              selectTextOnFocus
            />

            <TextInput
              ref={dropOffRef}
              style={Classes.rideFormInput(colors, theme.isDarkMode)}
              outlineStyle={{ borderRadius: 5, borderWidth: 0 }}
              mode="outlined"
              placeholder={t("home.to")}
              placeholderTextColor={theme.isDarkMode ? colors.text : undefined}
              value={ride.newRide.dropOff.text}
              onChangeText={(value) => {
                location.actions.getPredictions({
                  input: value,
                  location: `${location.location?.latitude},${location.location?.longitude}`,
                  user: user.user,
                });
                ride.actions.setNewRide({
                  ...ride.newRide,
                  dropOff: {
                    ...ride.newRide.dropOff,
                    text: value,
                  },
                });
              }}
              right={
                <TextInput.Icon
                  style={{ marginTop: 15 }}
                  icon={"close-circle-outline"}
                  iconColor={colors.primary}
                  onPress={() =>
                    ride.actions.setNewRide({
                      ...ride.newRide,
                      dropOff: {
                        ...ride.newRide.dropOff,
                        text: "",
                      },
                    })
                  }
                />
              }
              onFocus={async () => {
                // if pickUp is empty
                if (
                  !ride.newRide.pickUp.placeId &&
                  !Object.keys(ride.newRide.pickUp.location).length
                ) {
                  await refreshAsync();
                }
                setInput("dropOff");
                location.actions.setSearchPredictions([]);
              }}
              selectTextOnFocus
            />
          </View>
          <Divider style={{ height: 5 }} />
          <View>
            {/* <View style={{ flex: 1, alignItems: "center" }}>
              <Text variant="titleLarge">{t("home.noResultFound")}</Text>
            </View> */}
            <FlatList
              keyboardShouldPersistTaps={"always"}
              data={location.searchPredictions}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={async () => {
                    const result = await location.actions.getPlaceDetails(
                      item.place_id
                    );
                    console.log({
                      main_text: item.structured_formatting.main_text,
                    });
                    ride.actions.setNewRide({
                      ...ride.newRide,
                      [input]: {
                        text: item.structured_formatting.main_text,
                        location: {
                          latitude: result.geometry.location.lat,
                          longitude: result.geometry.location.lng,
                        },
                        placeId: item.place_id,
                      },
                    });

                    if (input === "pickUp") {
                      dropOffRef.current.focus();
                    }

                    if (input === "dropOff") {
                      ride.actions.setRideIsLoading(true);
                      // check if pickUp is set
                      ride.actions.setStep(2);
                      location.actions.getDirections({
                        origin: `${ride.newRide.pickUp.location?.latitude},${ride.newRide.pickUp.location?.longitude}`,
                        destination: `${result.geometry.location.lat},${result.geometry.location.lng}`,
                        newRideDetails: ride.newRideDetails,
                        setNewRideDetails: ride.actions.setNewRideDetails,
                        setStep: ride.actions.setStep,
                        setBottomSheetHeight: ride.actions.setBottomSheetHeight,
                      });
                      navigation.navigate("Home");
                    }
                  }}
                >
                  <List.Item
                    title={item.structured_formatting.main_text}
                    description={
                      item.structured_formatting.secondary_text &&
                      item.structured_formatting.secondary_text.length > 52
                        ? item.structured_formatting.secondary_text.substring(
                            0,
                            52 - 3
                          ) + "..."
                        : item.structured_formatting.secondary_text
                    }
                    titleStyle={{ fontWeight: "500", marginBottom: 3 }}
                    style={{
                      ...Classes.predictionItems(colors),
                      // paddingBottom: 15,
                    }}
                    left={() => (
                      <MaterialCommunityIcons
                        name="map-marker"
                        size={20}
                        color={colors.primary}
                      />
                    )}
                  />
                  <Divider />
                </TouchableOpacity>
              )}
              keyExtractor={(item, index) => index.toString()}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

export default ModalScreen;
