import React, { useEffect } from "react";
import * as ImagePicker from "expo-image-picker";

export default function useUpload() {
  useEffect(() => {
    (async () => {
      // if (Constants.platform.ios) {
      const cameraRollStatus =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
      if (
        cameraRollStatus.status !== "granted" ||
        cameraStatus.status !== "granted"
      ) {
        alert("Sorry, we need these permissions to make this work!");
      }
      // }
    })();
  }, []);

  const takePhoto = async (callback) => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      base64: true,
    });

    if (!result.canceled) {
      callback(result.assets[0]);
    }
  };

  const pickImage = async (callback) => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      base64: true,
    });

    if (!result.canceled) {
      callback(result.assets[0]);
    }
  };

  return {
    actions: {
      takePhoto,
      pickImage,
    },
  };
}
