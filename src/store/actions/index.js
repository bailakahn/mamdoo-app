import mainActions from "./main";
import authActions from "./auth";
import rideActions from "./ride";
import carpoolActions from "./carpool";

export const useActions = (state, dispatch) => ({
    ...mainActions(state, dispatch),
    ...authActions(state, dispatch),
    ...rideActions(state, dispatch),
    ...carpoolActions(state, dispatch)
});
