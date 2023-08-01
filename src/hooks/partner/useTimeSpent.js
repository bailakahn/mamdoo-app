import { useState, useEffect, useRef } from "react";
import { AppState } from "react-native";
import { differenceInSeconds } from "date-fns";

// used only for dev to debug
const saveUserTimeSpent = (time, from = "") => {
  console.log(`[${from}]Time spent in the app: ${time}`);
};

/**
 * Tracks time user spent in application logged in
 * @param {Boolean} isOnline driver online status
 * @param {*} saveTime function to save time in the database
 */
export default function useTimeSpent(isOnline, saveTime) {
  const appState = useRef(AppState.currentState);
  const startTime = useRef(Date.now());
  const intervalId = useRef(null);
  const isSaving = useRef(false);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      _handleAppStateChange
    );

    // clean up function
    return () => {
      // remove appstate subscription
      subscription.remove();
      //   check if user is online
      if (isOnline) {
        // clear the interval when the component is unmounted
        if (intervalId.current) {
          clearInterval(intervalId.current);
        }

        // save time spent if a save is not in progress
        if (!isSaving.current) {
          const endTime = Date.now();
          const timeSpent = differenceInSeconds(endTime, startTime.current); // time spent in seconds
          saveUserTimeSpent(timeSpent, "UNMOUNT");
          saveTime(timeSpent);
        }
      }
    };
  }, [isOnline]);

  // restart timer everytime driver online sttus changes
  useEffect(() => {
    if (appState.current === "active" && isOnline) {
      startInterval();
    }
  }, [isOnline]);

  //   commented because when status change, the unmount function already runs
  //   useEffect(() => {
  //     if (!isOnline && intervalId.current) {
  //       console.log({ baila: true });
  //       clearInterval(intervalId.current);
  //       if (!isSaving.current) {
  //         const endTime = Date.now();
  //         const timeSpent = differenceInSeconds(endTime, startTime.current);
  //         saveUserTimeSpent(timeSpent, "OnlineChange");
  //       }
  //     }
  //   }, [isOnline]);

  // function to start tracking driver time
  const startInterval = () => {
    if (isOnline) {
      // App has come to the foreground
      startTime.current = Date.now();
      // send time to the backend every 5 minutes
      intervalId.current = setInterval(async () => {
        isSaving.current = true;
        const endTime = Date.now();
        const timeSpent = differenceInSeconds(endTime, startTime.current); // time spent in seconds
        startTime.current = Date.now(); // reset start time
        saveUserTimeSpent(timeSpent, "INTERVAL");
        await saveTime(timeSpent);
        isSaving.current = false;
      }, 300000);
    }
  };

  // function to handle application state and track user time when app state change to foreground or background
  const _handleAppStateChange = async (nextAppState) => {
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === "active" &&
      isOnline
    ) {
      if (intervalId.current) {
        clearInterval(intervalId.current);
      }
      startInterval();
    } else if (
      appState.current.match(/active/) &&
      nextAppState === "background" &&
      isOnline
    ) {
      // App has gone to the background
      if (intervalId.current) {
        clearInterval(intervalId.current); // stop the timer
      }
      // only save if a save is not in progress
      if (!isSaving.current) {
        const endTime = Date.now();
        const timeSpent = differenceInSeconds(endTime, startTime.current); // time spent in seconds
        saveUserTimeSpent(timeSpent, "BACKGROUND");
        await saveTime(timeSpent);
      }
    }

    appState.current = nextAppState;
  };
}
