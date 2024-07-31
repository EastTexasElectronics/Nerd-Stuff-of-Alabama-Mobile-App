// src/app/_layout.tsx
import React from 'react';
import { Stack } from 'expo-router';
import "../global.css";

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Home' }} />
      <Stack.Screen name="pages/ProductPage" options={{ title: 'Product Details' }} />
    </Stack>
  );
}
