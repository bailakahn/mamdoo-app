import { Alert } from "react-native";
import { useStore } from "_store";
import { useApi } from "_api";
import { t } from "_utils/lang";

// Owns every covoiturage API call and all dispatching. Screens consume this and
// render — they never call the API or dispatch directly.
export default function useCarpool() {
  const getRequest = useApi();

  const {
    carpool: {
      mode,
      corridors,
      kaloumRoads,
      corridorsLoaded,
      search,
      trips,
      searched,
      bookings,
      isLoading,
    },
    actions: {
      setCarpoolMode,
      setCarpoolCorridors,
      setCarpoolSearch,
      resetCarpoolSearch,
      setCarpoolTrips,
      setCarpoolBookings,
      setCarpoolLoading,
    },
  } = useStore();

  // Corridors and their stops change rarely, so they are fetched once per session
  // and reused across the picker screens — the flow stays responsive on a poor
  // connection.
  const loadCorridors = async ({ force = false } = {}) => {
    if (corridorsLoaded && !force) return;

    setCarpoolLoading(true);
    const result = await getRequest({
      method: "GET",
      endpoint: "carpool/getCorridors",
    }).catch(() => null);
    setCarpoolLoading(false);

    if (result?.success) setCarpoolCorridors(result);
    return result;
  };

  const searchTrips = async () => {
    if (!search.corridorId || !search.boardStop || !search.exitStop || !search.direction) {
      return null;
    }

    setCarpoolLoading(true);
    const result = await getRequest({
      method: "POST",
      endpoint: "carpool/searchTrips",
      params: {
        corridorId: search.corridorId,
        direction: search.direction,
        boardStopId: search.boardStop._id,
        exitStopId: search.exitStop._id,
        serviceDate: search.serviceDate,
        womenOnly: search.womenOnly,
      },
    }).catch(() => null);
    setCarpoolLoading(false);

    setCarpoolTrips(result?.trips || []);
    return result?.trips || [];
  };

  const bookTrip = async (trip) => {
    setCarpoolLoading(true);
    const result = await getRequest({
      method: "POST",
      endpoint: "carpool/createBooking",
      params: {
        tripId: trip.tripId,
        boardStopId: search.boardStop._id,
        exitStopId: search.exitStop._id,
      },
    }).catch((err) => ({ error: err }));
    setCarpoolLoading(false);

    if (!result?.success) {
      Alert.alert(t("carpool.bookingFailedTitle"), bookingErrorMessage(result));
      return null;
    }

    await loadBookings();
    return result.booking;
  };

  const loadBookings = async (scope = "upcoming") => {
    const result = await getRequest({
      method: "GET",
      endpoint: "carpool/getBookings",
      params: { scope },
    }).catch(() => null);

    if (result?.success) setCarpoolBookings(result.bookings);
    return result?.bookings || [];
  };

  const getTrip = async (tripId) =>
    getRequest({
      method: "GET",
      endpoint: "carpool/getTrip",
      params: { tripId },
    }).catch(() => null);

  const getTripEvents = async (tripId) =>
    getRequest({
      method: "GET",
      endpoint: "carpool/getTripEvents",
      params: { tripId },
    }).catch(() => null);

  const confirmArrival = async (bookingId, stopIndex, coords) =>
    getRequest({
      method: "POST",
      endpoint: "carpool/confirmArrival",
      params: { bookingId, stopIndex, ...coords },
    }).catch(() => null);

  const cancelBooking = async (bookingId) => {
    setCarpoolLoading(true);
    const result = await getRequest({
      method: "POST",
      endpoint: "carpool/cancelBooking",
      params: { bookingId },
    }).catch(() => null);
    setCarpoolLoading(false);

    if (result?.success) await loadBookings();
    return result;
  };

  // Server error codes are mapped to plain sentences a first-time user can act on.
  // A raw code or a generic "something went wrong" fails §11.
  const bookingErrorMessage = (result) => {
    const code = result?.error?.code || result?.code;
    const map = {
      "errors.carpoolNoSeats": t("carpool.errorNoSeats"),
      "errors.carpoolRiderSuspended": t("carpool.errorSuspended"),
      "errors.carpoolWomenOnly": t("carpool.errorWomenOnly"),
      "errors.carpoolAlreadyBooked": t("carpool.errorAlreadyBooked"),
      "errors.carpoolTripDeparted": t("carpool.errorDeparted"),
      "errors.carpoolTooLateToBook": t("carpool.errorTooLate"),
      "errors.carpoolAccountSuspended": t("carpool.errorAccountSuspended"),
      "errors.carpoolTripUnavailable": t("carpool.errorUnavailable"),
      "errors.carpoolTripNotBookable": t("carpool.errorNotBookable"),
    };
    return map[code] || t("carpool.errorGeneric");
  };

  const selectCorridor = (corridor) =>
    setCarpoolSearch({
      corridorId: corridor._id,
      corridorCode: corridor.code,
      boardStop: null,
      exitStop: null,
    });

  const selectDirection = (direction) =>
    setCarpoolSearch({ direction, boardStop: null, exitStop: null });

  // The rider's own corridor, in travel order for the direction they picked.
  // Outbound reverses the list so "where do you get on?" always reads top to
  // bottom in the order the car actually passes the stops.
  const stopsInTravelOrder = () => {
    const corridor = corridors.find((c) => c._id === search.corridorId);
    if (!corridor) return [];

    const kaloum = kaloumRoads.flatMap((road) => road.stops);
    const inbound = [...corridor.stops, ...kaloum];

    return search.direction === "outbound" ? [...inbound].reverse() : inbound;
  };

  // The rider's usual commute, if they saved one. Null when none is saved.
  const loadSavedRoute = async () => {
    const result = await getRequest({
      method: "GET",
      endpoint: "carpool/getSavedRoute",
    }).catch(() => null);
    return result?.route || null;
  };

  const saveUsualRoute = async () => {
    if (!search.corridorId || !search.boardStop || !search.exitStop || !search.direction) {
      return null;
    }
    const result = await getRequest({
      method: "POST",
      endpoint: "carpool/saveRoute",
      params: {
        corridorId: search.corridorId,
        direction: search.direction,
        boardStopId: search.boardStop._id,
        exitStopId: search.exitStop._id,
      },
    }).catch(() => null);
    return result?.success ? result.route : null;
  };

  // Loads a saved route into the search so the trip list is one tap away.
  const applySavedRoute = (route) =>
    setCarpoolSearch({
      corridorId: route.corridorId?._id,
      corridorCode: route.corridorId?.code,
      direction: route.direction,
      boardStop: { _id: route.boardStopId?._id, name: route.boardStopId?.name },
      exitStop: { _id: route.exitStopId?._id, name: route.exitStopId?.name },
    });

  return {
    mode,
    corridors,
    kaloumRoads,
    corridorsLoaded,
    search,
    trips,
    searched,
    bookings,
    isLoading,
    actions: {
      setCarpoolMode,
      loadCorridors,
      selectCorridor,
      selectDirection,
      setCarpoolSearch,
      resetCarpoolSearch,
      searchTrips,
      bookTrip,
      loadBookings,
      getTrip,
      getTripEvents,
      confirmArrival,
      cancelBooking,
      stopsInTravelOrder,
      loadSavedRoute,
      saveUsualRoute,
      applySavedRoute,
    },
  };
}
