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
