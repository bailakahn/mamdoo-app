import types from "../types";
import { carpool, defaultCarpoolSearch } from "../initialState";

export default (state = carpool, action) => {
  switch (action.type) {
    // "course" (ride-hailing) or "covoiturage". A mode within the rider journey,
    // deliberately NOT a second app-level role switch — the app already has one of
    // those and two would mean two different things called "switching".
    case types.SET_CARPOOL_MODE:
      return { ...state, mode: action.mode };

    case types.SET_CARPOOL_CORRIDORS:
      return {
        ...state,
        corridors: action.data?.corridors || [],
        kaloumRoads: action.data?.kaloumRoads || [],
        corridorsLoaded: true,
      };

    case types.SET_CARPOOL_SEARCH:
      return { ...state, search: { ...state.search, ...action.search } };

    case types.RESET_CARPOOL_SEARCH:
      return { ...state, search: { ...defaultCarpoolSearch }, trips: [] };

    case types.SET_CARPOOL_TRIPS:
      return { ...state, trips: action.trips || [], searched: true };

    case types.SET_CARPOOL_BOOKINGS:
      return { ...state, bookings: action.bookings || [] };

    case types.SET_CARPOOL_LOADING:
      return { ...state, isLoading: action.isLoading };

    default:
      return state;
  }
};
