import mainActions from "./main";
import authActions from "./auth";
import rideActions from "./ride";

export const useActions = (state, dispatch) => ({
    ...mainActions(state, dispatch),
    ...authActions(state, dispatch),
    ...rideActions(state, dispatch)
});
