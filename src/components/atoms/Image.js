import React, { useEffect, useState, useRef } from "react";

import { Image, View, ActivityIndicator } from "react-native";

import * as FileSystem from "expo-file-system";

import PropTypes from "prop-types";

const CachedImage = (props) => {
  const { source, cacheKey, style = {} } = props;

  const uri = Image.resolveAssetSource(source).uri;

  const filesystemURI = `${FileSystem.cacheDirectory}${cacheKey}`;

  const [imgURI, setImgURI] = useState(filesystemURI);

  const componentIsMounted = useRef(true);

  const loadImageAsBase64 = async (fileURI) => {
    try {
      const fileBase64 = await FileSystem.readAsStringAsync(fileURI, {
        encoding: FileSystem.EncodingType.Base64,
      });

      return `data:image/png;base64,${fileBase64}`; // Adjust MIME type if necessary
    } catch (error) {
      console.error("Error reading file as base64:", error);
    }
  };

  useEffect(() => {
    const loadImage = async ({ fileURI }) => {
      try {
        // Use the cached image if it exists
        const metadata = await FileSystem.getInfoAsync(fileURI);
        if (!metadata.exists) {
          // download to cache
          if (componentIsMounted.current) {
            setImgURI(null);
            await FileSystem.downloadAsync(uri, fileURI);
          }
        }

        const base64Image = await loadImageAsBase64(fileURI);
        if (componentIsMounted.current) {
          setImgURI(base64Image);
        }
      } catch (err) {
        console.log(); // eslint-disable-line no-console
        setImgURI(uri);
      }
    };

    loadImage({ fileURI: filesystemURI });

    return () => {
      componentIsMounted.current = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {imgURI ? (
        <Image
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...props}
          style={style}
          source={{
            uri: imgURI,
          }}
        />
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

CachedImage.propTypes = {
  source: PropTypes.number.isRequired,
  cacheKey: PropTypes.string.isRequired,
};

export default CachedImage;
