const combineReducer = (reducers) => {
  return (state, action) => {
    const tempState = { ...state };

    Object.keys(reducers).forEach((key) => {
      tempState[key] = reducers[key](tempState[key], action);
    });

    return tempState;
  };
};

export default combineReducer;
