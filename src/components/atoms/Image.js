import React, { useEffect, useState, useRef } from "react";
import { Image, View, ActivityIndicator } from "react-native";
import { File, Paths } from "expo-file-system";
import PropTypes from "prop-types";

const CachedImage = (props) => {
  const { source, cacheKey, style = {} } = props;

  // Resolve the original image URI (local asset or remote)
  const originalUri = Image.resolveAssetSource(source)?.uri;

  // Represent the cached file as a File object
  const cachedFile = new File(Paths.cache, cacheKey);

  const [uriToShow, setUriToShow] = useState(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;

    const load = async () => {
      try {
        // If not cached yet, download to our deterministic file
        if (!cachedFile.exists) {
          // Ensure parent cache dir exists is handled by FileSystem internally;
          // download with idempotent overwrite semantics
          await File.downloadFileAsync(originalUri, cachedFile, {
            idempotent: true,
          });
        }

        // After download (or if it already existed), just use the file URI
        if (mounted.current) setUriToShow(cachedFile.uri);
      } catch (e) {
        // Fallback to the original source if anything goes wrong
        if (mounted.current) setUriToShow(originalUri);
      }
    };

    if (originalUri) load();

    return () => {
      mounted.current = false;
    };
  }, [originalUri, cacheKey]);

  return uriToShow ? (
    <Image {...props} style={style} source={{ uri: uriToShow }} />
  ) : (
    <View style={{ ...style, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator size={33} />
    </View>
  );
};

CachedImage.propTypes = {
  source: PropTypes.oneOfType([PropTypes.number, PropTypes.object]).isRequired,
  cacheKey: PropTypes.string.isRequired,
};

export default CachedImage;
