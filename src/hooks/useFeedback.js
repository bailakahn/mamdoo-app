import React from "react";
import { useApi } from "_api";

export default function useFeedback() {
  const getRequest = useApi();

  const saveFeedback = (feedback, { setNewFeedback, onSuccess }) => {
    getRequest({
      method: "POST",
      endpoint: "app/newfeedback",
      params: feedback,
    })
      .then(() => {
        setNewFeedback({ rating: 5, text: "" });
        if (onSuccess) onSuccess();
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return {
    actions: { saveFeedback },
  };
}
