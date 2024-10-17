import React, { useEffect, useRef, useState } from "react";
import { AppState, StyleSheet } from "react-native";
import { Redirect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

const Index = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Redirect href="/home" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, // Makes sure SafeAreaView takes full screen
    borderWidth: 1,
    borderColor: "red",
  },
});

export default Index;
