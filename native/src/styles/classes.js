import * as Spacing from "./spacing";
import * as Typography from "./typography";
import * as Mixins from "./mixins";
import { Platform } from "react-native";

export const container = (colors) => ({
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center"
});

export const container2 = (colors) => ({
    flex: 1,
    backgroundColor: colors.background
});

export const bottonView = (colors) => ({
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 20
});

export const topView = (colors) => ({
    justifyContent: "flex-end",
    alignItems: "center"
    // marginTop: 100
});

export const menuItem = (colors) => ({
    height: Mixins.height(60),
    justifyContent: "center"
});

export const accountMenuItem = (colors) => ({
    height: Mixins.height(80),
    justifyContent: "center"
});

export const goButton = (colors) => ({
    borderRadius: Mixins.width(0.35, true),
    width: Mixins.width(0.35, true),
    height: Mixins.width(0.35, true),
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.primary
});

export const statusNoticeView = (colors) => ({
    flexDirection: "row",
    width: Mixins.width(1, true),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20
});

export const modalContent = (colors) => ({
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    width: Mixins.width(0.9, true)
});

export const modalWrapper = (colors) => ({
    alignItems: "center"
});

export const roundButton = (colors, size, color) => ({
    borderRadius: Mixins.width(size, true),
    width: Mixins.width(size, true),
    height: Mixins.width(size, true),
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors[color] || color
});

export const buttonShadow = (colors, size) => ({
    borderRadius: Mixins.width(size, true),
    width: Mixins.width(size, true),
    height: Mixins.width(size, true),
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ffffff"
});

export const driverWelcomeNoticeView = (colors, isOnline) => ({
    width: Mixins.width(0.85, true),
    borderWidth: 1,
    borderColor: !isOnline ? colors.accent : colors.primary,
    borderRadius: 10,
    padding: 20,
    marginTop: 50
});
export const stopButton = (colors) => ({
    borderRadius: Mixins.width(0.35, true),
    width: Mixins.width(0.35, true),
    height: Mixins.width(0.35, true),
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.accent
});

export const shadowView = (colors) => ({
    borderRadius: Mixins.width(0.3, true),
    width: Mixins.width(0.3, true),
    height: Mixins.width(0.3, true),
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.background
});

export const formInput = (colors) => ({
    width: Mixins.width(0.85, true),
    height: Mixins.height(0.06, true),
    fontSize: 20,
    borderBottomColor: "grey",
    marginBottom: 20
    // ...(Platform.OS === "android" && {
    //     borderWidth: 1,
    //     paddingLeft: 18
    // })
});

export const profileFormInput = (colors) => ({
    width: Mixins.width(0.95, true),
    height: Mixins.height(50),
    fontSize: 20,
    borderBottomColor: "grey",
    marginBottom: 20
});

export const errorText = (colors) => ({
    color: colors.error
});

export const error = (colors) => ({
    width: Mixins.width(0.85, true)
});

export const formLogo = (colors) => ({
    width: Mixins.width(0.9, true),
    height: Mixins.height(0.2, true)
});

export const formButton = (colors) => ({
    marginTop: 20,
    width: Mixins.width(0.85, true),
    height: Mixins.height(40),
    justifyContent: "center"
});

export const profileFormButton = (colors) => ({
    marginTop: 20,
    width: Mixins.width(0.95, true),
    height: Mixins.height(50),
    justifyContent: "center"
});

export const profileFormButtonContent = (colors) => ({
    width: Mixins.width(0.95, true),
    height: Mixins.height(50),
    justifyContent: "center"
});

export const nextButton = (colors) => ({
    width: Mixins.width(0.85, true),
    height: Mixins.height(40)
});

export const nextButtonLabel = (colors) => ({
    width: Mixins.width(0.8, true),
    justifyContent: "center"
});

export const backButton = (colors) => ({
    marginTop: 20,
    width: Mixins.width(0.5, true),
    height: Mixins.height(40),
    justifyContent: "center",
    backgroundColor: colors.accent
});

export const backButtonLabel = (colors) => ({
    width: Mixins.width(0.5, true),
    justifyContent: "center"
});

export const offlineContainer = {
    height: Mixins.scaleSize(30),
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    width: Mixins.width(),
    zIndex: 2
};

export const text = (colors) => ({
    color: colors.text
});

export const spinner = (colors) => ({
    color: colors.white
});

export const roundedButton = (colors) => ({
    width: Mixins.width(200),
    height: Mixins.height(200),
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    borderRadius: 100,
    backgroundColor: colors.primary
});

export const animation = (colors) => ({
    backgroundColor: colors.background
});

export const callButton = (colors) => ({
    width: Mixins.width(0.7, true),
    height: 50,
    justifyContent: "center"
});

export const openMapButton = (colors) => ({
    width: Mixins.width(0.7, true),
    height: 50,
    justifyContent: "center"
});

export const dataCell = (colors) => ({
    justifyContent: "center"
});
