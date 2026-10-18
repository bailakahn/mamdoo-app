import AsyncStorage from "@react-native-async-storage/async-storage";

// Phones lose signal constantly in Conakry, and a background task can fire
// while there is nobody to show a network error to — so a fix is never sent
// directly. It goes into a persistent buffer first (survives the app being
// killed mid-trip, unlike an in-memory array) and a flush is attempted
// opportunistically; a failed flush just leaves the buffer for the next try.
// This is the client half of what carpool/recordLocation's batching exists for.
//
// Capped at the same 500 the server accepts per batch — beyond that, evidence
// from hours ago is worth less than not losing the buffer to unbounded growth
// during a long offline stretch, so the oldest fixes are dropped first.
const MAX_BUFFERED = 500;

export const bufferPing = async (storageKey, ping) => {
  const raw = await AsyncStorage.getItem(storageKey).catch(() => null);
  const buffer = raw ? JSON.parse(raw) : [];
  buffer.push(ping);
  const trimmed =
    buffer.length > MAX_BUFFERED ? buffer.slice(buffer.length - MAX_BUFFERED) : buffer;
  await AsyncStorage.setItem(storageKey, JSON.stringify(trimmed)).catch(() => {});
};

// postFn receives the whole buffered array and must throw on failure — the
// buffer is only cleared once the server has actually accepted it.
export const flushBuffer = async (storageKey, postFn) => {
  const raw = await AsyncStorage.getItem(storageKey).catch(() => null);
  const buffer = raw ? JSON.parse(raw) : [];
  if (!buffer.length) return;

  await postFn(buffer);
  await AsyncStorage.removeItem(storageKey);
};
