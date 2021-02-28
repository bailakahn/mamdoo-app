import mainActions from "./main";

export const useActions = (state, dispatch) => ({
    ...mainActions(state, dispatch)
});
