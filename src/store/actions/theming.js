import AsyncStorage from "@react-native-async-storage/async-storage";
import types from "../types";

export default function themeActions(state, dispatch) {
    return {
       
        setTheme: (isThemeDark) => {
            
             dispatch({
                type: types.SET_THEME,
                isThemeDark
            }); 
        },
        getTheme: () =>
           
                    dispatch({
                        type: types.GET_THEME,
                    })
           
    };
}
