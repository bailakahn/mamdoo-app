import { theme } from "../initialState";
import AsyncStorage from "@react-native-async-storage/async-storage";
import types from "../types";
export default (state = theme, action) => {
    switch (action.type) {
        case types.SET_THEME:
            //AsyncStorage.setItem("@mamdoo-selected-theme", action.isThemeDark);
            return { ...state, isThemeDark: action.isThemeDark};
        case types.GET_THEME : 
        return {...state, isThemeDark};    
            
        default:
            return state;
    }
};
