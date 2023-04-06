import React, { useEffect, useRef, useState } from "react";
import { Alert, Image, View, ActivityIndicator } from "react-native";
import * as FileSystem from "expo-file-system";

const imageDir = FileSystem.cacheDirectory + "images/";

// Checks if images directory exists. If not, creates it
async function ensureDirExists() {
  const dirInfo = await FileSystem.getInfoAsync(imageDir);
  if (!dirInfo.exists) {
    console.log("Images directory doesn't exist, creating...");
    await FileSystem.makeDirectoryAsync(imageDir, { intermediates: true });
  }
}

function getImgXtension(uri) {
  var basename = uri.split(/[\\/]/).pop();
  return /[.]/.exec(basename) ? /[^.]+$/.exec(basename) : undefined;
}

async function findImageInCache(uri) {
  try {
    let info = await FileSystem.getInfoAsync(uri);
    return { ...info, err: false };
  } catch (error) {
    return {
      exists: false,
      err: true,
      msg: error,
    };
  }
}

async function cacheImage(uri, cacheUri, callback) {
  try {
    const downloadImage = FileSystem.createDownloadResumable(
      uri,
      cacheUri,
      {},
      callback
    );
    const downloaded = await downloadImage.downloadAsync();

    return {
      cached: true,
      err: false,
      path: downloaded.uri,
    };
  } catch (error) {
    return {
      cached: false,
      err: true,
      msg: error,
    };
  }
}

const CustomFastImage = (props) => {
  const { source, cacheKey, style } = props;

  const uri = Image.resolveAssetSource(source).uri;

  const isMounted = useRef(true);
  const [imgUri, setUri] = useState("");
  useEffect(() => {
    async function loadImg() {
      await ensureDirExists();

      let imgXt = getImgXtension(uri);

      if (!imgXt || !imgXt.length) {
        console.log("Impossible de charger l'image");
        // Alert.alert(`Impossible de charger l'image`);
        return;
      }

      const cacheFileUri = `${FileSystem.cacheDirectory}images/${cacheKey}.${imgXt[0]}`;
      let imgXistsInCache = await findImageInCache(cacheFileUri);

      if (imgXistsInCache.exists) {
        console.log("cached!");
        setUri(cacheFileUri);
      } else {
        let cached = await cacheImage(uri, cacheFileUri, () => {});

        if (cached.cached) {
          console.log("cached NEw!");
          setUri(cached.path);
        } else {
          console.log("Impossible de charger l'image", cached);
          // Alert.alert(`Couldn't load Image!`);
        }
      }
    }
    loadImg();
    return () => (isMounted.current = false);
  }, []);
  return (
    <>
      {imgUri ? (
        <Image source={{ uri: imgUri }} style={style} />
      ) : (
        <View
          style={{ ...style, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator size={33} />
        </View>
      )}
    </>
  );
};

export default CustomFastImage;
