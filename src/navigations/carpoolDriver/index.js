import React, { useEffect } from "react";
import { useCarpoolAuth } from "_hooks/carpoolDriver";
import { useNotifications, useCarpoolOnboarding } from "_hooks";
import { OnboardingScene } from "_scenes/carpoolDriver";
import { LoadingV2 } from "_atoms";
import AuthStack from "./stacks/Auth";
import HomeTabs from "./stacks/Home";

// Three states, not the ride driver app's five (Auth/Verification/Upload/
// Pending/Home): a session either does not exist, is not fully set up yet, or
// is — everything past that (car, documents, ops approval, first template) is
// the Home tab's own onboarding checklist, not a separate tree to gate on here.
//
// No location-permission gate, unlike the ride root: a covoiturage driver does
// not need to be trackable in the background the way an online ride driver
// does. Day-of GPS, if this ever needs it, belongs to the day-of screen itself,
// requested in context — not the app's entire covoiturage session.
export default function CarpoolDriverRoot() {
  const carpoolAuth = useCarpoolAuth();
  const onboarding = useCarpoolOnboarding();
  useNotifications();

  useEffect(() => {
    if (!carpoolAuth.carpoolDriverLoaded) return;
    if (!carpoolAuth.carpoolDriver?.accessToken) {
      // Nothing to refresh yet — this is what unblocks rendering below.
      return;
    }
    carpoolAuth.actions.refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [carpoolAuth.carpoolDriverLoaded]);

  useEffect(() => {
    carpoolAuth.actions.loadSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!carpoolAuth.carpoolDriverLoaded) return <LoadingV2 />;

  // First opening on this phone: explain carpooling before sign-up or the home.
  // Finishing marks it seen in the store, which re-renders this root onwards.
  if (!onboarding.driverSeen) return <OnboardingScene onDone={() => {}} />;

  const session = carpoolAuth.carpoolDriver;
  const isComplete = !!session?.accessToken && !!session?.verified && !session?.needsProfile;

  if (isComplete) return <HomeTabs />;

  const initialRouteName = !session?.accessToken
    ? "Signup"
    : !session?.verified
      ? "VerifyCode"
      : "CompleteProfile";

  return <AuthStack initialRouteName={initialRouteName} />;
}
