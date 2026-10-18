import { useState } from "react";
import { useStore } from "_store";
import { useApi } from "_api";

// Owns the covoiturage driver's identity: signup, the OTP step, completing a
// brand new profile, and logging out. Kept apart from useCarpool, which owns the
// feature itself (cars, templates, trips) and is deliberately session-agnostic.
//
// A signup response is stored right away, unverified — the same shape the ride
// side already uses (drivers/save also hands back a token before verification,
// and the app gates screens on `verified` rather than waiting to store the
// session). Storing it immediately is also what lets every call from here on
// use the normal getRequest wrapper: useApi() resolves the token for whichever
// surface main.app currently is, so once this driver is in the store, the
// standard call shape works with no special-casing.
//
// A human holds a ride session or a covoiturage session, never both — see the
// note by SET_CARPOOL_DRIVER in store/types.js. The one precaution that needs
// doing here rather than left to chance: if this device still has a ride driver
// signed in when a covoiturage login succeeds, that ride session is taken
// offline and cleared, exactly as a second, silent driver session would be if
// nobody caught it.
export default function useCarpoolAuth() {
  const getRequest = useApi();
  const [isLoading, setIsLoading] = useState(false);

  const {
    auth: { carpoolDriver, carpoolDriverLoaded, carpoolDriverRefreshed, partner },
    actions: {
      setCarpoolDriver,
      getCarpoolDriver,
      removeCarpoolDriver,
      setCarpoolDriverRefreshed,
      removePartner,
    },
  } = useStore();

  // A stale ride session on this device is taken offline with its own token
  // before it is dropped — the token disappears the moment removePartner runs.
  const clearStaleRideSession = async () => {
    if (!partner?.accessToken) return;
    await fetch(`${process.env.EXPO_PUBLIC_PROVIDER_URL}drivers/setOnline`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-mamdoo-access-token": partner.accessToken,
        app: "partner",
      },
      body: JSON.stringify({ isOnline: false }),
    }).catch(() => null);
    removePartner();
  };

  const signup = async (phoneNumber) => {
    setIsLoading(true);
    const result = await getRequest({
      method: "POST",
      endpoint: "carpool/signupDriver",
      params: { phoneNumber },
    }).catch((err) => ({ error: err }));
    setIsLoading(false);

    if (result?.success) setCarpoolDriver(result);
    return result;
  };

  const verifyCode = async (code) => {
    setIsLoading(true);
    const result = await getRequest({
      method: "POST",
      endpoint: "auth/verifyAccount",
      params: { code },
    }).catch((err) => ({ error: err }));
    setIsLoading(false);

    if (result?.success) {
      // The root decides Auth-stack vs Home purely from this session object —
      // without recording verified here, a returning driver's needsProfile
      // already being false would let the root skip this very step.
      setCarpoolDriver({ ...carpoolDriver, verified: true });
      await clearStaleRideSession();
    }
    return result;
  };

  // Sends a fresh code to the same number. The server refuses within 30 s of the
  // last one; the previous code stays valid next to the new one.
  const resendCode = async () =>
    getRequest({ method: "POST", endpoint: "auth/resend" }).catch((err) => ({ error: err }));

  const completeProfile = async ({ firstName, lastName, pin }) => {
    setIsLoading(true);
    const result = await getRequest({
      method: "POST",
      endpoint: "carpool/completeDriverProfile",
      params: { firstName, lastName, pin },
    }).catch((err) => ({ error: err }));
    setIsLoading(false);

    if (result?.success) setCarpoolDriver({ ...carpoolDriver, firstName, lastName, needsProfile: false });
    return result;
  };

  const refresh = async () => {
    const result = await getRequest({ method: "GET", endpoint: "drivers/refresh" }).catch(
      () => null
    );
    if (result) setCarpoolDriver({ ...carpoolDriver, ...result });
    setCarpoolDriverRefreshed();
    return result;
  };

  const logout = async () => {
    await getRequest({ method: "POST", endpoint: "auth/logout" }).catch(() => null);
    removeCarpoolDriver();
  };

  return {
    carpoolDriver,
    carpoolDriverLoaded,
    carpoolDriverRefreshed,
    isLoading,
    actions: {
      loadSession: getCarpoolDriver,
      signup,
      verifyCode,
      resendCode,
      completeProfile,
      refresh,
      logout,
    },
  };
}
