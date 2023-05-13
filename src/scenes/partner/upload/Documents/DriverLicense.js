import React, { useRef, useCallback, useMemo, useState } from "react";
import {
  View,
  Image as RNImage,
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
import { Button, Image } from "_atoms";
import { usePartner } from "_hooks";
import useUpload from "../../../../hooks/partner/useUpload";
import * as Mixins from "../../../../styles/mixins";

export default function DriverLicense({ navigation }) {
  const { colors } = useTheme();
  const partner = usePartner();
  const upload = useUpload();
  let name = "";
  // ref
  const bottomSheetModalRef = useRef(null);

  // variables
  const snapPoints = useMemo(() => ["25%", "25%"], []);

  // callbacks
  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const handleSheetChanges = useCallback((index) => {}, []);

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
                    [name]: {
                      uri: result.uri,
                      base64: result.base64,
                    },
                  });
                })
              }
            >
              {t2("upload.fromCamera")}
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
                    [name]: {
                      uri: result.uri,
                      base64: result.base64,
                    },
                  });
                })
              }
            >
              {t2("upload.fromGallery")}
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
      }}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          alignItems: "center",
        }}
      >
        {partner.uploadDocuments.driverLicenseFront &&
        partner.uploadDocuments.driverLicenseBack ? (
          <View
            style={{
              alignItems: "center",
              flexGrow: 1,
              justifyContent: "center",
            }}
          >
            <View style={{ alignItems: "center", marginTop: 20 }}>
              <RNImage
                source={{
                  uri: partner.uploadDocuments?.driverLicenseFront?.uri,
                }}
                style={{
                  width: Mixins.width(0.6, true),
                  height: Mixins.height(0.2, true),
                }}
                resizeMode="contain"
              />
              <RNImage
                source={{
                  uri: partner.uploadDocuments?.driverLicenseBack?.uri,
                }}
                style={{
                  width: Mixins.width(0.6, true),
                  height: Mixins.height(0.2, true),
                  marginTop: 20,
                }}
                resizeMode="contain"
              />
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
                {t2("upload.driverLicenceTitle")}
              </Text>
              <Text
                style={{
                  fontSize: 15,
                  marginTop: 20,
                }}
              >
                {t2("upload.driverLicenceDescription")}
              </Text>
              <ScrollView style={Classes.uploadInstructions(colors)}>
                <View
                  style={{
                    flexDirection: "column",
                    alignItems: "center",
                    marginTop: 30,
                  }}
                >
                  <Image
                    source={require("_assets/driver-license-front.png")}
                    cacheKey={"driver-license-front"}
                    style={{
                      width: Mixins.width(0.6, true),
                      height: Mixins.height(0.2, true),
                    }}
                    resizeMode="contain"
                  />
                  <Image
                    source={require("_assets/driver-license-back.png")}
                    cacheKey="driver-license-back"
                    style={{
                      width: Mixins.width(0.6, true),
                      height: Mixins.height(0.2, true),
                    }}
                    resizeMode="contain"
                  />
                </View>
              </ScrollView>
            </View>
          </View>
        )}
        <View style={Classes.bottonView(colors)}>
          {partner.uploadDocuments.driverLicenseBack &&
          partner.uploadDocuments.driverLicenseFront ? (
            <View>
              <View style={{ marginTop: 30 }}>
                <Button
                  {...Classes.buttonContainer(colors)}
                  mode="contained"
                  onPress={() => navigation.navigate("Upload")}
                >
                  {t2("upload.useThisPicture")}
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
                      driverLicenseFront: null,
                      driverLicenseBack: null,
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
                  alignItems: "center",
                }}
              >
                <Button
                  {...Classes.buttonContainer(colors)}
                  mode="contained"
                  onPress={() => {
                    handlePresentModalPress();
                    name = "driverLicenseFront";
                  }}
                >
                  {t2("upload.driverLicenceFront")}
                </Button>
              </View>
              <View
                style={{
                  alignItems: "center",
                }}
              >
                <Button
                  {...Classes.buttonContainer(colors)}
                  mode="contained"
                  onPress={() => {
                    handlePresentModalPress();
                    name = "driverLicenseBack";
                  }}
                >
                  {t2("upload.driverLicenceBack")}
                </Button>
              </View>
            </View>
          )}
        </View>
        <BottomView />
      </ScrollView>
    </SafeAreaView>
  );
}
