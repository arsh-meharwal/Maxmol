import { View, Text, Image } from "react-native";
import React, { useEffect } from "react";
import { router } from "expo-router";
import image from "../../assets/Success.gif";

const confirmationScreen = () => {
  useEffect(() => {
    setTimeout(() => router.replace("/home"), 3500);
  }, []);
  return (
    <View className="h-screen flex justify-center items-center bg-white ">
      <Image
        source={image}
        className="w-screen h-1/4 mix-blend-overlay "
        resizeMode="contain"
      />
      <Text className="font-semibold text-base mb-64">
        Thanks for the Purchase. Your order is confirmed
      </Text>
    </View>
  );
};

export default confirmationScreen;
