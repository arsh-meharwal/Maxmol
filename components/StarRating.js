import { View, Text } from "react-native";
import React from "react";
import { Star } from "./Svgs";

export const StarRating = ({ rating, maxStars = 5 }) => {
  const fullStars = Math.floor(rating); // Full stars
  const fractionalStar = rating - fullStars; // Fractional part (e.g., 0.3)
  const fillPercentage = fractionalStar.toFixed(1); // Fill percentage for the last star

  return (
    <View style={{ flexDirection: "row" }}>
      {Array.from({ length: fullStars }, (_, index) => (
        <Star key={index} width={20} height={20} fillPercentage={1} /> // Full star
      ))}
      {fullStars < maxStars && (
        <Star width={20} height={20} fillPercentage={fillPercentage} /> // Fractional star
      )}
      {/* Render empty stars if needed */}
      {Array.from({ length: maxStars - fullStars - 1 }, (_, index) => (
        <Star
          key={index + fullStars + 1}
          width={20}
          height={20}
          fillPercentage={0}
        /> // Empty star
      ))}
    </View>
  );
};
