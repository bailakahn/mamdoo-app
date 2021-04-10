import combineReducer from "./combine";
import main from "./main";
import auth from "./auth";
const reducer = combineReducer({
    main,
    auth
});

export default reducer;
