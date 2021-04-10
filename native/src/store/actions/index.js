import mainActions from "./main";
import authActions from "./auth";

export const useActions = (state, dispatch) => ({
    ...mainActions(state, dispatch),
    ...authActions(state, dispatch)
});
