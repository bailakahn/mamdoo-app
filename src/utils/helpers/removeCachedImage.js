import * as FileSystem from "expo-file-system";

export async function removeCachedImage(cacheKey) {
  const fileURI = `${FileSystem.cacheDirectory}${cacheKey}`;
  try {
    const info = await FileSystem.getInfoAsync(fileURI);
    if (info.exists) {
      await FileSystem.deleteAsync(fileURI, { idempotent: true });
      console.log(`Removed cached image: ${fileURI}`);
    }
  } catch (err) {
    console.error("Error removing cached image", err);
  }
}
