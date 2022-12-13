import combineReducer from "./combine";
import main from "./main";
import auth from "./auth";
import ride from "./ride";
const reducer = combineReducer({
    main,
    auth,
    ride
});

export default reducer;
