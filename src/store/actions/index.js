import mainActions from "./main";
import themeActions from "./theming";

export const useActions = (state, dispatch) => ({
    ...mainActions(state, dispatch),
    ...themeActions(state, dispatch)
});
