import React from "react";
import { CarpoolOnboarding, RiderOnboardingScenes as Scenes } from "_organisms";
import { useCarpool, useCarpoolOnboarding } from "_hooks";
import { t } from "_utils/lang";

const SLIDES = [
  { key: "what", Scene: Scenes.RiderWhatScene },
  { key: "book", Scene: Scenes.RiderBookScene },
  { key: "onTime", Scene: Scenes.RiderOnTimeScene },
  { key: "track", Scene: Scenes.RiderTrackScene },
  { key: "safety", Scene: Scenes.RiderSafetyScene },
];

const tr = (key) => t(`carpool.${key}`);

// Shown the first time a rider picks Covoiturage, and again from "How it works".
// First time: skipping lands on the carpool home, finishing starts a search.
// Replay: both simply return to where the rider came from.
export default function CarpoolRiderOnboarding({ navigation, route }) {
  const onboarding = useCarpoolOnboarding();
  const carpool = useCarpool();
  const replay = !!route?.params?.replay;

  const slides = SLIDES.map((slide, i) => ({
    ...slide,
    title: tr(`onbRiderTitle${i + 1}`),
    body: tr(`onbRiderBody${i + 1}`),
    sceneLabel: tr(`onbRiderScene${i + 1}`),
  }));

  const finish = (startSearch) => {
    onboarding.markSeen("rider");
    if (replay) return navigation.goBack();
    navigation.replace("CarpoolHome");
    if (startSearch) {
      carpool.actions.resetCarpoolSearch();
      navigation.navigate("CarpoolCorridor");
    }
  };

  return (
    <CarpoolOnboarding
      slides={slides}
      tr={tr}
      skipLabel={tr("onbSkip")}
      nextLabel={tr("onbNext")}
      doneLabel={replay ? tr("onbDone") : tr("onbStartRider")}
      onDone={() => finish(true)}
      onSkip={() => finish(false)}
    />
  );
}
