import { useEffect } from "react";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";

const compress = async (uri) => {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 1600 } }],
    { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
  );
  return result.uri;
};

export default function useUpload() {
  useEffect(() => {
    (async () => {
      await ImagePicker.requestMediaLibraryPermissionsAsync();
      await ImagePicker.requestCameraPermissionsAsync();
    })();
  }, []);

  const takePhoto = async (callback) => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      quality: 1,
    });
    if (!result.canceled) {
      const uri = await compress(result.assets[0].uri);
      callback({ uri });
    }
  };

  const pickImage = async (callback) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 1,
    });
    if (!result.canceled) {
      const uri = await compress(result.assets[0].uri);
      callback({ uri });
    }
  };

  return { actions: { takePhoto, pickImage } };
}
