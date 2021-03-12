import * as Spacing from "./spacing";
import * as Typography from "./typography";
import * as Mixins from "./mixins";

export const container = (colors) => ({
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
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

export const drawerPreference = (colors) => ({
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  });
