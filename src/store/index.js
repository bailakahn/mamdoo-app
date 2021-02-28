import React, { createContext, useReducer, useContext, useEffect } from "react";
import reducer from "./reducers";
import { useActions } from "./actions";
import useMiddleWare from "./middleware";
import initialState from "./initialState";

const StoreContext = createContext(initialState);

export const StoreProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // const enhancedDispatch = useMiddleWare(state, dispatch);

  const actions = useActions(state, dispatch);

  return (
    <StoreContext.Provider
      children={children}
      value={{
        ...state,
        actions,
        dispatch,
      }}
    />
  );
};

export function useStore() {
  return useContext(StoreContext);
}
