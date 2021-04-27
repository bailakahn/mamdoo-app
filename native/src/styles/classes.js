import * as Spacing from "./spacing";
import * as Typography from "./typography";
import * as Mixins from "./mixins";
import { colors } from "react-native-elements";

export const container = (colors) => ({
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center"
});

export const bottonView = (colors) => ({
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 20
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
    height: Mixins.height(40),
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

export const nextButton = (colors) => ({
    marginTop: 20,
    width: Mixins.width(0.5, true),
    height: Mixins.height(40)
});

export const nextButtonView = (colors) => ({
    width: Mixins.width(0.85, true),
    alignItems: "flex-end"
});

export const backButton = (colors) => ({
    marginTop: 20,
    width: Mixins.width(0.5, true),
    height: Mixins.height(40),
    justifyContent: "center",
    backgroundColor: colors.accent
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
