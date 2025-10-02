import { Dimensions, Platform, PixelRatio } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// based on iPhone 15 scale (393 × 852)
const BASE_WIDTH = 393;
const BASE_HEIGHT = 852;

const wscale = SCREEN_WIDTH / BASE_WIDTH;
const hscale = SCREEN_HEIGHT / BASE_HEIGHT;

export default function normalize(size, based = "width") {
  const newSize = based === "height" ? size * hscale : size * wscale;

  if (Platform.OS === "ios") {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  } else {
    // keep Android adjustment
    return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
  }
}
