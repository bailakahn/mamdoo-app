import * as Mixins from "./mixins";
import { Platform, StatusBar } from "react-native";
import { color } from "react-native-reanimated";
export const container = (colors) => ({
  flex: 1,
  backgroundColor: colors.background,
  alignItems: "center",
  justifyContent: "center",
  ...(Platform.OS === "android" && {
    paddingTop: StatusBar.currentHeight,
  }),
});

export const container2 = (colors) => ({
  flex: 1,
  backgroundColor: colors.background,
});

export const textInputOutline = (colors) => ({
  // borderColor: colors.inputBoder,
  borderRadius: 10,
});

export const containerCenter = (colors) => ({
  justifyContent: "center",
  alignItems: "center",
});

export const mainView = (colors) => ({
  width: Mixins.width(0.9, true),
});

export const privacyPolicyView = (colors) => ({
  width: Mixins.width(0.9, true),
});

export const centeredLargeText = (colors) => ({
  width: Mixins.width(0.9, true),
});

export const buttonContainer = (colors) => ({
  style: {
    marginTop: 20,
    width: Mixins.width(0.95, true),
    height: Mixins.height(45),
    justifyContent: "center",
  },
  contentStyle: {
    height: Mixins.height(40),
  },
});

export const logoutButtonContainer = (colors) => ({
  style: {
    marginTop: 20,
    width: Mixins.width(0.95, true),
    height: Mixins.height(45),
    justifyContent: "center",
    backgroundColor: colors.error,
  },
  contentStyle: {
    height: Mixins.height(40),
  },
});

export const cancelRideButtonContainer = (colors) => ({
  style: {
    width: Mixins.width(0.95, true),
    height: Mixins.height(45),
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.error,
  },
  contentStyle: {
    height: Mixins.height(40),
  },
});

export const callUsButtonContainer = (colors) => ({
  style: {
    width: Mixins.width(0.65, true),
    height: Mixins.height(45),
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.primary,
  },
  contentStyle: {
    height: Mixins.height(40),
  },
});

export const endRideButtonContainer = (colors) => ({
  style: {
    width: Mixins.width(0.95, true),
    height: Mixins.height(45),
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.primary,
  },
  contentStyle: {
    height: Mixins.height(40),
  },
});

export const cancelRideDriverArrivedButtonContainer = (colors) => ({
  style: {
    width: Mixins.width(0.45, true),
    height: Mixins.height(45),
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.error,
  },
  contentStyle: {
    height: Mixins.height(40),
  },
});

export const nextOnboardingButtonContainer = (colors) => ({
  style: {
    width: Mixins.width(0.35, true),
    // height: Mixins.height(35),
    // justifyContent: "center",
  },
  contentStyle: {
    // height: Mixins.height(35),
  },
});

export const logoutPendingButtonContainer = (colors) => ({
  style: {
    width: Mixins.width(0.95, true),
    height: Mixins.height(45),
    justifyContent: "center",
    backgroundColor: colors.error,
  },
  contentStyle: {
    height: Mixins.height(40),
  },
});

export const skipButtonContainer = (colors) => ({
  style: {
    width: Mixins.width(0.3, true),
    height: Mixins.height(35),
    justifyContent: "center",
  },
  contentStyle: {
    height: Mixins.height(40),
  },
});

export const alertButtonContainer = (colors) => ({
  width: Mixins.width(0.35, true),
  height: Mixins.height(45),
  justifyContent: "center",
  alignItems: "center",
});

export const alertConfirmButtonContainer = (colors) => ({
  style: {
    width: Mixins.width(0.65, true),
    height: Mixins.height(45),
    justifyContent: "center",
  },
  contentStyle: {
    height: Mixins.height(40),
  },
});

export const alertCancelButtonContainer = (colors) => ({
  style: {
    width: Mixins.width(0.65, true),
    height: Mixins.height(45),
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.error,
  },
  contentStyle: {
    height: Mixins.height(40),
  },
});

export const callButtonContainer = (colors) => ({
  style: {
    width: Mixins.width(0.7, true),
    height: Mixins.height(50),
    justifyContent: "center",
  },
  contentStyle: {
    height: Mixins.height(50),
  },
});

export const verifyButtonContainer = (colors) => ({
  style: {
    width: Mixins.width(0.85, true),
    height: Mixins.height(50),
    justifyContent: "center",
  },
  contentStyle: {
    height: Mixins.height(50),
  },
});

export const backButtonContainer = (colors, type) => ({
  style: {
    marginTop: 20,
    width: Mixins.width(0.5, true),
    height: Mixins.height(50),
    justifyContent: "center",
    backgroundColor: colors[type],
  },
  contentStyle: {
    height: Mixins.height(50),
  },
});

export const dynamicButtonContainer = (colors, type) => ({
  style: {
    marginTop: 20,
    width: Mixins.width(0.5, true),
    height: Mixins.height(50),
    justifyContent: "center",
    backgroundColor: colors[type],
  },
  contentStyle: {
    height: Mixins.height(50),
  },
});

export const openMapButtoContainer = (colors) => ({
  style: {
    width: Mixins.width(0.7, true),
    height: Mixins.height(50),
    justifyContent: "center",
  },
  contentStyle: {
    height: Mixins.height(50),
  },
});

export const nextButtonContainer = (colors) => ({
  style: {
    width: Mixins.width(0.85, true),
    height: Mixins.height(50),
  },
  contentStyle: {
    height: Mixins.height(50),
  },
});

export const bottonView = (colors) => ({
  flex: 1,
  justifyContent: "flex-end",
  marginBottom: 20,
});

export const topView = (colors) => ({
  justifyContent: "flex-end",
  alignItems: "center",
  // marginTop: 100
});

export const menuItem = (colors) => ({
  height: Mixins.height(60),
  justifyContent: "center",
});

export const accountMenuItem = (colors) => ({
  height: Mixins.height(80),
  justifyContent: "center",
});

export const goButton = (colors) => ({
  borderRadius: Mixins.width(0.35, true),
  width: Mixins.width(0.35, true),
  height: Mixins.width(0.35, true),
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: colors.primary,
});

export const statusNoticeView = (colors) => ({
  flexDirection: "row",
  width: Mixins.width(1, true),
  justifyContent: "center",
  alignItems: "center",
  marginBottom: 20,
});

export const modalContent = (colors) => ({
  backgroundColor: colors.background,
  alignItems: "center",
  justifyContent: "center",
  padding: 30,
  width: Mixins.width(0.9, true),
});

export const modal = (colors) => ({
  backgroundColor: colors.background,
  justifyContent: "center",
  padding: 30,
  width: Mixins.width(0.9, true),
});

export const modalWrapper = (colors) => ({
  alignItems: "center",
});

export const roundButton = (colors, size, color) => ({
  borderRadius: Mixins.width(size, true),
  width: Mixins.width(size, true),
  height: Mixins.width(size, true),
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: colors[color] || color,
});

export const buttonShadow = (colors, size) => ({
  borderRadius: Mixins.width(size, true),
  width: Mixins.width(size, true),
  height: Mixins.width(size, true),
  justifyContent: "center",
  alignItems: "center",
  borderWidth: 1,
  borderColor: "#ffffff",
});

export const driverWelcomeNoticeView = (colors, isOnline) => ({
  width: Mixins.width(0.85, true),
  borderWidth: 1,
  borderColor: !isOnline ? colors.accent : colors.primary,
  borderRadius: 10,
  padding: 20,
  marginTop: 50,
});

export const notice = (colors, color) => ({
  width: Mixins.width(0.85, true),
  borderWidth: 1,
  borderColor: colors[color],
  borderRadius: 10,
  padding: 20,
  marginTop: 50,
});

export const stopButton = (colors) => ({
  borderRadius: Mixins.width(0.35, true),
  width: Mixins.width(0.35, true),
  height: Mixins.width(0.35, true),
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: colors.accent,
});

export const shadowView = (colors) => ({
  borderRadius: Mixins.width(0.3, true),
  width: Mixins.width(0.3, true),
  height: Mixins.width(0.3, true),
  justifyContent: "center",
  alignItems: "center",
  borderWidth: 1,
  borderColor: colors.background,
});

export const formInput = (colors) => ({
  width: Mixins.width(0.93, true),
  height: Mixins.width(0.13, true),
  fontSize: 20,
  marginBottom: 20,
});

export const rideFormInput = (colors, isDarkMode = false) => ({
  width: Mixins.width(0.93, true),
  height: Mixins.width(0.1, true),
  // fontSize: 20,
  marginBottom: 10,
  backgroundColor: isDarkMode ? "#3B3B3B" : "#e8e8e8",
});

export const predictionItems = (colors) => ({
  width: Mixins.width(0.93, true),
  height: Mixins.width(0.15, true),
});

export const rideFormInputContainer = (colors) => ({
  width: Mixins.width(0.93, true),
  // height: Mixins.width(0.1, true),
  fontSize: 20,
  // marginBottom: 10,
});

export const profileFormInput = (colors) => ({
  width: Mixins.width(0.95, true),
  fontSize: 20,
  borderBottomColor: "grey",
  marginBottom: 20,
});

export const cabType = (colors) => ({
  width: Mixins.width(0.95, true),
  height: Mixins.width(0.15, true),
  borderRadius: 10,
  // padding: 10,
  marginBottom: 10,
  borderWidth: 1,
  borderColor: "#e0e0e0",
});

export const errorText = (colors) => ({
  color: colors.error,
});

export const error = (colors) => ({
  width: Mixins.width(0.85, true),
});

export const formLogo = (colors) => ({
  width: Mixins.width(0.9, true),
  height: Mixins.height(0.2, true),
});

export const formButton = (colors) => ({
  marginTop: 20,
  width: Mixins.width(0.85, true),
  height: Mixins.height(40),
  justifyContent: "center",
});

export const profileFormButton = (colors) => ({
  marginTop: 20,
  width: Mixins.width(0.95, true),
  height: Mixins.height(50),
  justifyContent: "center",
});

export const profileFormButtonContent = (colors) => ({
  width: Mixins.width(0.95, true),
  height: Mixins.height(50),
  justifyContent: "center",
});

export const nextButton = (colors) => ({
  width: Mixins.width(0.85, true),
  height: Mixins.height(50),
});

export const nextButtonLabel = (colors) => ({
  width: Mixins.width(0.8, true),
  justifyContent: "center",
});

export const backButton = (colors) => ({
  marginTop: 20,
  width: Mixins.width(0.5, true),
  height: Mixins.height(50),
  justifyContent: "center",
  backgroundColor: colors.accent,
});

export const mamdooUse = (colors) => ({
  marginBottom: 20,
});

export const splashButton = (colors) => ({
  style: {
    marginTop: 20,
    width: Mixins.width(0.6, true),
    height: Mixins.height(90),
    justifyContent: "center",
    borderRadius: 15,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  contentStyle: {
    height: Mixins.height(90),
  },
});

export const backButtonLabel = (colors) => ({
  width: Mixins.width(0.5, true),
  justifyContent: "center",
});

export const offlineContainer = {
  height: Mixins.scaleSize(30),
  justifyContent: "center",
  alignItems: "center",
  flexDirection: "row",
  width: Mixins.width(),
  zIndex: 2,
};

export const text = (colors) => ({
  color: colors.text,
});

export const spinner = (colors) => ({
  color: colors.white,
});

export const roundedButton = (colors) => ({
  width: Mixins.width(150),
  height: Mixins.height(150),
  justifyContent: "center",
  alignItems: "center",
  padding: 10,
  borderRadius: 75,
  backgroundColor: colors.primary,
});

export const animation = (colors) => ({
  backgroundColor: colors.background,
});

export const driverSearchAnimation = (colors) => ({
  width: Mixins.width(0.95, true),
  height: Mixins.height(0.2, true),
});

export const callButton = (colors) => ({
  width: Mixins.width(0.7, true),
  height: 50,
  justifyContent: "center",
});

export const deleteAccountButton = (colors) => ({
  marginTop: 30,
  width: Mixins.width(0.7, true),
  justifyContent: "center",
  backgroundColor: colors.error,
});

export const logoutButton = (colors) => ({
  style: {
    width: Mixins.width(0.7, true),
    height: Mixins.height(50),
    justifyContent: "center",
    backgroundColor: colors.error,
  },
  contentStyle: {
    height: Mixins.height(50),
  },
});

export const authorizeButton = (colors) => ({
  width: Mixins.width(0.7, true),
  height: 50,
  justifyContent: "center",
  backgroundColor: "#25C0D2",
});

export const openMapButton = (colors) => ({
  width: Mixins.width(0.7, true),
  height: 50,
  justifyContent: "center",
});

export const dataCell = (colors) => ({
  justifyContent: "center",
});

export const centeredText = (colors) => ({
  width: Mixins.width(0.7, true),
});

export const fullWidth = (colors) => ({
  width: Mixins.width(1, true),
});

export const centeredView = (colors) => ({
  width: Mixins.width(0.85, true),
});

export const centeredViewUpload = (colors) => ({
  width: Mixins.width(0.9, true),
});

export const uploadInstructions = (colors) => ({
  // height: Mixins.height(0.4, true),
});

export const uploadDocuments = (colors) => ({
  height: Mixins.height(0.4, true),
});

export const profilePicture = (colors) => ({
  width: Mixins.width(0.7, true),
  height: Mixins.height(0.3, true),
});
