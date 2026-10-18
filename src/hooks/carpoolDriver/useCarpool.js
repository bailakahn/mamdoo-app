import { useState, useCallback } from "react";
import { Alert } from "react-native";
import { useApi } from "_api";
import { t2 } from "_utils/lang";

// Owns every covoiturage API call on the driver side.
//
// Local state rather than the global store: unlike the rider flow, none of this is
// needed across screens simultaneously, and the day-of screen must always show
// what the server says right now rather than a cached copy that could be minutes
// stale while a driver is standing at a stop.
export default function useCarpool() {
  const getRequest = useApi();

  const [profile, setProfile] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [trips, setTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const call = async ({ method = "POST", endpoint, params, silent = false }) => {
    const result = await getRequest({ method, endpoint, params }).catch((err) => ({
      error: err,
    }));

    if (!result?.success && !silent) {
      Alert.alert(t2("carpoolDriver.errorTitle"), errorMessage(result));
      return null;
    }
    return result;
  };

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    const result = await getRequest({
      method: "GET",
      endpoint: "carpool/getCarpoolProfile",
    }).catch(() => null);
    setIsLoading(false);

    if (result?.success) setProfile(result);
    return result;
  }, []);

  const enroll = async () => {
    const result = await call({ endpoint: "carpool/enrollDriver" });
    if (result) await loadProfile();
    return result;
  };

  const saveCar = async (car) => {
    const result = await call({ endpoint: "carpool/saveCar", params: car });
    if (result) await loadProfile();
    return result;
  };

  const deleteCar = async (carId) => {
    const result = await call({ endpoint: "carpool/deleteCar", params: { carId } });
    if (result) await loadProfile();
    return result;
  };

  const setActiveCar = async (carId) => {
    const result = await call({ endpoint: "carpool/setActiveCar", params: { carId } });
    if (result) await loadProfile();
    return result;
  };

  const loadTemplates = useCallback(async () => {
    const result = await getRequest({
      method: "GET",
      endpoint: "carpool/getTemplates",
    }).catch(() => null);

    if (result?.success) setTemplates(result.templates);
    return result?.templates || [];
  }, []);

  const saveTemplate = async (template) => {
    const endpoint = template.templateId
      ? "carpool/updateTemplate"
      : "carpool/createTemplate";
    const result = await call({ endpoint, params: template });
    if (result) await loadTemplates();
    return result;
  };

  const deleteTemplate = async (templateId) => {
    const result = await call({
      endpoint: "carpool/deleteTemplate",
      params: { templateId },
    });
    if (result) await loadTemplates();
    return result;
  };

  const loadTrips = useCallback(async (scope = "upcoming") => {
    setIsLoading(true);
    const result = await getRequest({
      method: "GET",
      endpoint: "carpool/getDriverTrips",
      params: { scope },
    }).catch(() => null);
    setIsLoading(false);

    if (result?.success) setTrips(result.trips);
    return result?.trips || [];
  }, []);

  const confirmTrip = async (tripId, seatsOffered) => {
    const result = await call({
      endpoint: "carpool/confirmTrip",
      params: { tripId, ...(seatsOffered !== undefined && { seatsOffered }) },
    });
    return result;
  };

  const skipTrip = async (tripId) =>
    call({ endpoint: "carpool/skipTrip", params: { tripId } });

  // Tells riders at a stop the car is about `minutes` away. The server sends each
  // rider this once, so repeating the call is harmless.
  const notifyApproaching = async (tripId, stopIndex, minutes) =>
    call({ endpoint: "carpool/notifyApproaching", params: { tripId, stopIndex, minutes }, silent: true });

  // Test builds only: a trip from this template leaving in 20 minutes.
  const createTestTrip = async (templateId) =>
    call({ endpoint: "carpool/createTestTrip", params: { templateId } });

  const cancelTrip = async (tripId, reason) =>
    call({ endpoint: "carpool/cancelTrip", params: { tripId, reason } });

  // --- Day-of ---

  const getTrip = async (tripId) =>
    getRequest({ method: "GET", endpoint: "carpool/getTrip", params: { tripId } }).catch(
      () => null
    );

  const startTrip = async (tripId) =>
    call({ endpoint: "carpool/startTrip", params: { tripId } });

  const arriveAtStop = async (tripId, stopIndex, coords) =>
    call({ endpoint: "carpool/arriveAtStop", params: { tripId, stopIndex, ...coords } });

  const markAboard = async (bookingId) =>
    call({ endpoint: "carpool/markAboard", params: { bookingId } });

  // Not silent on failure: refusing a no-show because grace has not elapsed is
  // information the driver needs to see, not an error to swallow.
  const markNoShow = async (bookingId) =>
    call({ endpoint: "carpool/markNoShow", params: { bookingId } });

  const completeTrip = async (tripId) =>
    call({ endpoint: "carpool/completeTrip", params: { tripId } });

  const blockRider = async ({ riderId, reason, note = null, tripId = null, bookingId = null }) =>
    call({
      endpoint: "carpool/blockRider",
      params: { riderId, reason, note, tripId, bookingId },
    });

  const getBalance = async () =>
    getRequest({ method: "GET", endpoint: "carpool/getDriverBalance" }).catch(() => null);

  // --- Documents ---
  // The checklist itself is server-driven (configurations.carpoolDocuments), so
  // this hook never hard-codes which documents exist or which are required.

  const [documents, setDocuments] = useState([]);

  const loadDocuments = useCallback(async (carId) => {
    const result = await getRequest({
      method: "GET",
      endpoint: "carpool/getDocumentChecklist",
      params: carId ? { carId } : undefined,
    }).catch(() => null);

    if (result?.success) setDocuments(result.documents);
    return result?.documents || [];
  }, []);

  const uploadDocument = async (documentKey, localUri, carId) => {
    try {
      const { url, key } = await getRequest({
        method: "POST",
        endpoint: "carpool/requestUploadUrl",
        params: { documentKey, carId },
      });

      const fileResponse = await fetch(localUri);
      const blob = await fileResponse.blob();
      const s3Response = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "image/jpeg" },
        body: blob,
      });
      if (!s3Response.ok) throw new Error(`S3 ${s3Response.status}`);

      await getRequest({
        method: "POST",
        endpoint: "carpool/updateDocumentKey",
        params: { documentKey, carId, s3Key: key },
      });

      await loadDocuments(carId);
      return true;
    } catch {
      Alert.alert(t2("carpoolDriver.errorTitle"), t2("carpoolDriver.errorGeneric"));
      return false;
    }
  };

  const submitDocuments = async (carId) => call({ endpoint: "carpool/submitDocuments", params: { carId } });

  const errorMessage = (result) => {
    const code = result?.error?.code || result?.code;
    const map = {
      "errors.carpoolPublicationBlocked": t2("carpoolDriver.errorBlocked"),
      "errors.carpoolGraceNotElapsed": t2("carpoolDriver.errorGrace"),
      "errors.carpoolNoArrivalRecorded": t2("carpoolDriver.errorNoArrival"),
      "errors.carpoolEnrolmentNotActive": t2("carpoolDriver.errorNotActive"),
      "errors.carpoolNotEnrolled": t2("carpoolDriver.errorNotEnrolled"),
      "errors.carpoolInvalidRoute": t2("carpoolDriver.errorRoute"),
      "errors.carpoolTripNotPending": t2("carpoolDriver.errorNotPending"),
      "errors.carpoolCarNotFound": t2("carpoolDriver.errorCarNotFound"),
      "errors.carpoolNotYourPassenger": t2("carpoolDriver.errorNotYourPassenger"),
      "errors.carpoolSeatsBelowBooked": t2("carpoolDriver.errorSeatsBelowBooked"),
      "errors.carpoolTestTripUsed": t2("carpoolDriver.errorTestTripUsed"),
    };
    // Server messages for grace countdowns carry the seconds remaining, which is
    // more useful than any generic copy we could write.
    return map[code] || result?.error?.message || t2("carpoolDriver.errorGeneric");
  };

  return {
    profile,
    templates,
    trips,
    documents,
    isLoading,
    actions: {
      loadProfile,
      enroll,
      saveCar,
      deleteCar,
      setActiveCar,
      loadTemplates,
      saveTemplate,
      deleteTemplate,
      loadTrips,
      confirmTrip,
      skipTrip,
      cancelTrip,
      notifyApproaching,
      createTestTrip,
      getTrip,
      startTrip,
      arriveAtStop,
      markAboard,
      markNoShow,
      completeTrip,
      blockRider,
      getBalance,
      loadDocuments,
      uploadDocument,
      submitDocuments,
    },
  };
}
