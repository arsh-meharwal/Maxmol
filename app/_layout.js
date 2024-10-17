import { View, Text, StatusBar } from "react-native";
import { Stack } from "expo-router";
import React from "react";
import GlobalProvider from "@/context/GlobalProvider";

const RootLayout = () => {
  return (
    <>
      <GlobalProvider>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(screens)" options={{ headerShown: false }} />
        </Stack>
      </GlobalProvider>
      <StatusBar backgroundColor="#161622" style="light" />
    </>
  );
};

export default RootLayout;
