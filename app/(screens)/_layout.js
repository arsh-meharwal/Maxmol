import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

const ScreenLayout = () => {
  return (
    <>
      <Stack>
        <Stack.Screen name="productDetail" options={{ headerShown: false }} />
        <Stack.Screen name="currentOrders" options={{ headerShown: false }} />
        <Stack.Screen name="viewProducts" options={{ headerShown: false }} />
        <Stack.Screen
          name="deliveredOrders"
          options={{ headerShown: true, title: "All Delivered Orders" }}
        />
        <Stack.Screen
          name="cancelledOrders"
          options={{ headerShown: true, title: "All Cancelled Orders" }}
        />
        <Stack.Screen
          name="settings"
          options={{ headerShown: true, title: "App Settings" }}
        />
        <Stack.Screen
          name="confirmationScreen"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="addressForm"
          options={{ headerShown: true, title: "Add Delivery Address" }}
        />
        <Stack.Screen
          name="viewUsers"
          options={{ headerShown: true, title: "Logged In Users" }}
        />
        <Stack.Screen
          name="paymentSelect"
          options={{ headerShown: true, title: "Select Payment" }}
        />
      </Stack>
      <StatusBar backgroundColor="#161622" style="light" />
    </>
  );
};

export default ScreenLayout;
