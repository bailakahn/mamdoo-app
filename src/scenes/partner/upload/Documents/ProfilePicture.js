import React, { useRef, useMemo, useCallback } from "react";
import {
  View,
  Image as RNImage,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { useTheme, Text } from "react-native-paper";
import { Classes } from "_styles";
import { t2 } from "_utils/lang";
import { Button, Image } from "_atoms";
import { usePartner } from "_hooks";
import useUpload from "../../../../hooks/partner/useUpload";
import * as Mixins from "../../../../styles/mixins";

export default function ProfilePicture({ navigation }) {
  const { colors } = useTheme();
  const partner = usePartner();
  const upload = useUpload();

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
          <View
            style={{
              flexGrow: 1,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <View style={{ alignItems: "center", marginTop: 20 }}>
              <RNImage
                source={{
                  uri: partner.uploadDocuments?.profilePicture?.uri,
                }}
                style={Classes.profilePicture(colors)}
              />
            </View>
          </View>
        ) : (
          <View>
            <View
              style={{
                width: Mixins.width(0.95, true),
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "900",
                  marginTop: 15,
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
                  <Image
                    source={require("_assets/avatar.png")}
                    cacheKey={"avatar"}
                    style={{
                      width: Mixins.width(0.4, true),
                      height: Mixins.height(0.2, true),
                    }}
                  />
                </View>
              </ScrollView>
            </View>
          </View>
        )}
        <View style={Classes.bottonView(colors)}>
          {partner.uploadDocuments.profilePicture ? (
            <View>
              <View style={{ marginTop: 30 }}>
                <Button
                  {...Classes.buttonContainer(colors)}
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
              <Button
                {...Classes.buttonContainer(colors)}
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
                {t2("upload.profilePictureTake")}
              </Button>
            </View>
          )}
        </View>
      </ScrollView>
      {/* <BottomView /> */}
    </SafeAreaView>
  );
}
