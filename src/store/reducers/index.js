import combineReducer from "./combine";
import main from "./main";
import theme from "./theming";
const reducer = combineReducer({
    main,
    theme
});

export default reducer;
