import React, { useEffect, useRef, useState } from "react";
import { Animated, Image, View, Dimensions } from "react-native";

export const AutoImageCarousel = ({ images }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      // Start fade-out animation
      Animated.timing(fadeAnim, {
        toValue: 0, // fade out
        duration: 500, // animation duration
        useNativeDriver: true,
      }).start(() => {
        // Once fade-out is done, change the image
        setActiveIndex((prevIndex) =>
          prevIndex + 1 > images.length - 1 ? 0 : prevIndex + 1
        );

        // After image changes, fade-in
        Animated.timing(fadeAnim, {
          toValue: 1, // fade in
          duration: 500, // animation duration
          useNativeDriver: true,
        }).start();
      });
    }, 4000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <View className="relative">
      <Animated.View
        className="w-full"
        style={{ opacity: fadeAnim, height: 90 }}
      >
        <Image
          source={{
            uri: `https://cloud.appwrite.io/v1/storage/buckets/66c5a1030009cc3c7fa4/files/${images[activeIndex]}/view?project=66c59b5800224d59df96&mode=admin`,
          }}
          className="w-full h-full"
          resizeMode="cover"
        />
      </Animated.View>
      {/* Dots Indicator */}
      <View className="bottom-4 flex-row justify-center items-center">
        {images.map((_, index) => (
          <View
            key={index}
            style={{
              width: activeIndex === index ? 12 : 8, // Active dot size
              height: activeIndex === index ? 12 : 8, // Active dot size
              borderRadius: 6, // Make it a circle
              backgroundColor: activeIndex === index ? "#000" : "#888", // Active dot color
              marginHorizontal: 4,
            }}
          />
        ))}
      </View>
    </View>
  );
};
