import React from "react";
import { useApi } from "_api";
import { useNavigation } from "@react-navigation/native";

export default function useFeedback() {
  const getRequest = useApi();
  const navigation = useNavigation();

  const saveFeedback = (feedback, { setNewFeedback }) => {
    getRequest({
      method: "POST",
      endpoint: "app/newfeedback",
      params: feedback,
    })
      .then(() => {
        setNewFeedback({
          rating: 3,
          text: "",
        });
        navigation.navigate("Account", { showFeedbackSuccessMessage: true });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return {
    actions: { saveFeedback },
  };
}
