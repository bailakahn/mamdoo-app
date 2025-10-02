import { File, Paths } from "expo-file-system";
export function removeCachedImage(cacheKey) {
  const f = new File(Paths.cache, cacheKey);
  if (f.exists) f.delete();
}
