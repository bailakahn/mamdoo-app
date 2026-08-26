import combineReducer from "./combine";
import main from "./main";
import auth from "./auth";
import ride from "./ride";
import carpool from "./carpool";
const reducer = combineReducer({
    main,
    auth,
    ride,
    carpool
});

export default reducer;
