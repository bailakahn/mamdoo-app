import React, { useRef, useMemo, useCallback } from "react";
import {
  View,
  Image,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { useTheme, Text } from "react-native-paper";
import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import { Classes } from "_styles";
import { t2 } from "_utils/lang";
import { Button } from "_atoms";
import { usePartner } from "_hooks";
import useUpload from "../../../../hooks/partner/useUpload";
import * as Mixins from "../../../../styles/mixins";

export default function ProfilePicture({ navigation }) {
  const { colors } = useTheme();
  const partner = usePartner();
  const upload = useUpload();
  // ref
  const bottomSheetModalRef = useRef(null);

  // variables
  const snapPoints = useMemo(() => ["25%", "25%"], []);

  // callbacks
  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const handleSheetChanges = useCallback((index) => {
    console.log("handleSheetChanges", index);
  }, []);

  const BottomView = () => (
    <BottomSheetModalProvider>
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={1}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        handleStyle={{ backgroundColor: colors.overlap }}
        handleIndicatorStyle={{ backgroundColor: colors.text }}
        backdropComponent={BottomSheetBackdrop}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: colors.overlap,
            width: Mixins.width(1, true),
            alignItems: "center",
          }}
        >
          <View style={{ marginTop: 10 }}>
            <Button
              {...Classes.callButtonContainer(colors)}
              mode="contained"
              onPress={() =>
                upload.actions.takePhoto((result) => {
                  partner.actions.setUploadDocuments({
                    ...partner.uploadDocuments,
                    profilePicture: {
                      uri: result.uri,
                      base64: result.base64,
                    },
                  });
                })
              }
            >
              {`${t2("upload.fromCamera")}`}
            </Button>
          </View>
          <View style={{ marginTop: 10 }}>
            <Button
              {...Classes.callButtonContainer(colors)}
              mode="contained"
              onPress={() =>
                upload.actions.pickImage((result) => {
                  partner.actions.setUploadDocuments({
                    ...partner.uploadDocuments,
                    profilePicture: {
                      uri: result.uri,
                      base64: result.base64,
                    },
                  });
                })
              }
            >
              {`${t2("upload.fromGallery")}`}
            </Button>
          </View>
        </View>
      </BottomSheetModal>
    </BottomSheetModalProvider>
  );
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colors.background,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {partner.uploadDocuments.profilePicture ? (
          <View style={{ alignItems: "center" }}>
            <View style={{ alignItems: "center", marginTop: 20 }}>
              <Image
                source={{
                  uri: partner.uploadDocuments?.profilePicture?.uri,
                }}
                style={Classes.profilePicture(colors)}
              />
            </View>
            <View style={{ marginTop: 30 }}>
              <Button
                {...Classes.callButtonContainer(colors)}
                mode="contained"
                onPress={() => navigation.navigate("Upload")}
              >
                {`${t2("upload.profilePictureUse")}`}
              </Button>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                marginTop: 30,
              }}
            >
              <TouchableOpacity
                style={{ marginLeft: 10 }}
                onPress={() => {
                  partner.actions.setUploadDocuments({
                    ...partner.uploadDocuments,
                    profilePicture: null,
                  });
                }}
              >
                <Text style={{ color: colors.error, fontSize: 20 }}>
                  {t2("upload.takeAgain")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View>
            <View
              style={{
                width: Mixins.width(0.95, true),
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 25,
                  fontWeight: "bold",
                }}
              >
                {t2("upload.profilePictureTitle")}
              </Text>
              <Text
                style={{
                  fontSize: 15,
                  marginTop: 20,
                }}
              >
                {t2("upload.profilePictureDescription")}
              </Text>
              <ScrollView style={Classes.uploadInstructions(colors)}>
                <Text
                  style={{
                    fontSize: 15,
                    marginTop: 10,
                  }}
                >
                  {`1. ${t2("upload.profilePictureTipOne")}`}
                </Text>
                <Text
                  style={{
                    fontSize: 15,
                    marginTop: 10,
                  }}
                >
                  {`2. ${t2("upload.profilePictureTipTwo")}`}
                </Text>
                <Text
                  style={{
                    fontSize: 15,
                    marginTop: 10,
                  }}
                >
                  {`3. ${t2("upload.profilePictureTipThree")}`}
                </Text>
                <View style={{ alignItems: "center", marginTop: 30 }}>
                  <Text>Example</Text>
                  <Image
                    source={require("_assets/avatar.png")}
                    style={{
                      width: Mixins.width(0.4, true),
                      height: Mixins.height(0.2, true),
                    }}
                  />
                </View>
              </ScrollView>
            </View>

            {/* <View
                        style={{
                            marginTop: 30,
                            marginBottom: 20,
                            alignItems: "center"
                        }}
                    >
                        <Button
                            {...Classes.callButtonContainer(colors)}
                            mode="contained"
                            onPress={() =>
                                upload.actions.takePhoto((result) => {
                                    partner.actions.setUploadDocuments({
                                        ...partner.uploadDocuments,
                                        profilePicture: {
                                            uri: result.uri,
                                            base64: result.base64
                                        }
                                    });
                                })
                            }
                        >
                            <Text>{`${t2("upload.profilePictureTake")}`}</Text>
                        </Button>
                    </View> */}

            <View
              style={{
                marginTop: 30,
                marginBottom: 20,
                alignItems: "center",
              }}
            >
              <Button
                {...Classes.callButtonContainer(colors)}
                mode="contained"
                // onPress={handlePresentModalPress}
                onPress={() =>
                  upload.actions.takePhoto((result) => {
                    partner.actions.setUploadDocuments({
                      ...partner.uploadDocuments,
                      profilePicture: {
                        uri: result.uri,
                        base64: result.base64,
                      },
                    });
                  })
                }
              >
                <Text>{`${t2("upload.profilePictureTake")}`}</Text>
              </Button>
            </View>
          </View>
        )}
      </ScrollView>
      {/* <BottomView /> */}
    </SafeAreaView>
  );
}
