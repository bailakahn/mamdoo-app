import types from "../types";

export default function carpoolActions(state, dispatch) {
  return {
    setCarpoolMode: (mode) => {
      dispatch({ type: types.SET_CARPOOL_MODE, mode });
    },
    setCarpoolCorridors: (data) => {
      dispatch({ type: types.SET_CARPOOL_CORRIDORS, data });
    },
    setCarpoolSearch: (search) => {
      dispatch({ type: types.SET_CARPOOL_SEARCH, search });
    },
    resetCarpoolSearch: () => {
      dispatch({ type: types.RESET_CARPOOL_SEARCH });
    },
    setCarpoolTrips: (trips) => {
      dispatch({ type: types.SET_CARPOOL_TRIPS, trips });
    },
    setCarpoolBookings: (bookings) => {
      dispatch({ type: types.SET_CARPOOL_BOOKINGS, bookings });
    },
    setCarpoolLoading: (isLoading) => {
      dispatch({ type: types.SET_CARPOOL_LOADING, isLoading });
    },
  };
}
