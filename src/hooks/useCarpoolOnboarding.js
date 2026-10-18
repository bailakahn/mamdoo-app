import { useStore } from "_store";

// Whether this phone has seen the carpool onboarding, for riders and for drivers.
// Kept on the phone, like the ride-hailing onboarding: a new phone shows it again.
export default function useCarpoolOnboarding() {
  const {
    main: { carpoolOnboarded },
    actions: { setCarpoolOnboarded },
  } = useStore();

  return {
    riderSeen: !!carpoolOnboarded?.rider,
    driverSeen: !!carpoolOnboarded?.driver,
    markSeen: (role) => setCarpoolOnboarded(role, true),
  };
}
