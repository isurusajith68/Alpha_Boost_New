import { Stack } from "expo-router";
import React from "react";
import { AuthProvider } from "../contexts/AuthContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Authentication screens */}
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />

        {/* Main app screens */}
        <Stack.Screen name="index" />
        <Stack.Screen name="home" />
        <Stack.Screen name="game" />
        <Stack.Screen name="feedback" />
        <Stack.Screen name="modal" />
        <Stack.Screen name="profile" />
      </Stack>
    </AuthProvider>
  );
}
