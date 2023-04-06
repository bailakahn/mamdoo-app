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
          if (componentIsMounted.current) {
            setImgURI(fileURI);
          }
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
