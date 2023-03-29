import React from "react";
import { useApi } from "_api";

export default function useFeedback() {
  const getRequest = useApi();

  const saveFeedback = (
    feedback,
    { setShowSuccessMessage, setNewFeedback }
  ) => {
    getRequest({
      method: "POST",
      endpoint: "app/newfeedback",
      params: feedback,
    })
      .then(() => {
        setShowSuccessMessage(true);
        setNewFeedback({
          rating: 3,
          text: "",
        });
        setTimeout(() => {
          setShowSuccessMessage(false);
        }, 5000);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return {
    actions: { saveFeedback },
  };
}
