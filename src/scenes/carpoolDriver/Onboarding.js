import React from "react";
import { CarpoolOnboarding, DriverOnboardingScenes as Scenes } from "_organisms";
import { useCarpoolOnboarding } from "_hooks";
import { t2 } from "_utils/lang";

const SLIDES = [
  { key: "share", Scene: Scenes.DriverShareScene },
  { key: "setup", Scene: Scenes.DriverSetupScene },
  { key: "evening", Scene: Scenes.DriverEveningScene },
  { key: "day", Scene: Scenes.DriverDayScene },
  { key: "after", Scene: Scenes.DriverAfterScene },
];

const tr = (key) => t2(`carpoolDriver.${key}`);

// Shown on first opening of the carpool driver space (before sign-up), and again
// from Account > How it works. `onDone` is given by the root on first opening;
// from Account it is a screen and goes back.
export default function CarpoolDriverOnboarding({ navigation, onDone }) {
  const onboarding = useCarpoolOnboarding();

  const slides = SLIDES.map((slide, i) => ({
    ...slide,
    title: tr(`onbDriverTitle${i + 1}`),
    body: tr(`onbDriverBody${i + 1}`),
    sceneLabel: tr(`onbDriverScene${i + 1}`),
  }));

  const finish = () => {
    onboarding.markSeen("driver");
    if (onDone) onDone();
    else navigation.goBack();
  };

  return (
    <CarpoolOnboarding
      slides={slides}
      tr={tr}
      skipLabel={tr("onbSkip")}
      nextLabel={tr("onbNext")}
      doneLabel={onDone ? tr("onbStartDriver") : tr("onbDone")}
      onDone={finish}
    />
  );
}
