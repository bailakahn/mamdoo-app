jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

const AsyncStorage = require("@react-native-async-storage/async-storage");
const { bufferPing, flushBuffer } = require("_utils/carpoolLocationBuffer");

const KEY = "@mamdoo-carpool-test-buffer";
const ping = (n) => ({ lat: 9.6 + n, lng: -13.6 - n, recordedAt: new Date(n).toISOString() });

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe("bufferPing", () => {
  it("creates the buffer on the first ping", async () => {
    await bufferPing(KEY, ping(1));
    const stored = JSON.parse(await AsyncStorage.getItem(KEY));
    expect(stored).toEqual([ping(1)]);
  });

  it("appends to an existing buffer, preserving order", async () => {
    await bufferPing(KEY, ping(1));
    await bufferPing(KEY, ping(2));
    await bufferPing(KEY, ping(3));

    const stored = JSON.parse(await AsyncStorage.getItem(KEY));
    expect(stored).toEqual([ping(1), ping(2), ping(3)]);
  });

  it("caps the buffer at 500 entries, dropping the oldest first", async () => {
    for (let i = 0; i < 502; i++) {
      await bufferPing(KEY, ping(i));
    }

    const stored = JSON.parse(await AsyncStorage.getItem(KEY));
    expect(stored).toHaveLength(500);
    // Entries 0 and 1 were dropped; the oldest surviving is 2, the newest 501.
    expect(stored[0]).toEqual(ping(2));
    expect(stored[stored.length - 1]).toEqual(ping(501));
  });
});

describe("flushBuffer", () => {
  it("does nothing when the buffer is empty", async () => {
    const postFn = jest.fn();
    await flushBuffer(KEY, postFn);
    expect(postFn).not.toHaveBeenCalled();
  });

  it("posts the whole buffer and clears it on success", async () => {
    await bufferPing(KEY, ping(1));
    await bufferPing(KEY, ping(2));

    const postFn = jest.fn(() => Promise.resolve());
    await flushBuffer(KEY, postFn);

    expect(postFn).toHaveBeenCalledWith([ping(1), ping(2)]);
    expect(await AsyncStorage.getItem(KEY)).toBeNull();
  });

  it("leaves the buffer intact when the post fails", async () => {
    await bufferPing(KEY, ping(1));

    const postFn = jest.fn(() => Promise.reject(new Error("network down")));
    await expect(flushBuffer(KEY, postFn)).rejects.toThrow("network down");

    const stored = JSON.parse(await AsyncStorage.getItem(KEY));
    expect(stored).toEqual([ping(1)]);
  });

  it("a ping buffered after a failed flush is not lost", async () => {
    await bufferPing(KEY, ping(1));
    await flushBuffer(KEY, () => Promise.reject(new Error("offline"))).catch(() => {});

    await bufferPing(KEY, ping(2));

    const stored = JSON.parse(await AsyncStorage.getItem(KEY));
    expect(stored).toEqual([ping(1), ping(2)]);
  });
});
