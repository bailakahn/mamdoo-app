import React, { useState } from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons"; // For stars

export default function Raiting({
  reviews = ["Terrible", "Bad", "Okay", "Good", "Great"],
  defaultRating = 3,
  maxStars = 5,
  iconSize = 32,
  selectedColor = "#FFD700",
  reviewColor = "#333",
  onFinishRating,
  containerStyle = {},
  textContainerStyle = {},
  textStyle = {},
  iconContainerStyle = {},
}) {
  const [rating, setRating] = useState(defaultRating);

  const handlePress = (value) => {
    setRating(value);
    if (onFinishRating) {
      onFinishRating(value);
    }
  };

  return (
    <View style={{ ...styles.container, ...containerStyle }}>
      {reviews && reviews.length > 0 && (
        <View style={{ ...textContainerStyle }}>
          <Text style={[styles.reviewText, { color: reviewColor }, textStyle]}>
            {reviews[rating - 1]}
          </Text>
        </View>
      )}
      <View style={{ ...styles.starsContainer, ...iconContainerStyle }}>
        {Array.from({ length: maxStars }, (_, i) => {
          const starValue = i + 1;
          return (
            <TouchableOpacity
              key={i}
              onPress={() => handlePress(starValue)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={starValue <= rating ? "star" : "star-outline"}
                size={iconSize}
                color={selectedColor}
                style={styles.star}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  starsContainer: {
    flexDirection: "row",
    marginTop: 6,
  },
  star: {
    marginHorizontal: 4,
  },
  reviewText: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
});
