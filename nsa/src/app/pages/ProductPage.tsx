// src/app/pages/ProductPage.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';

const ProductPage = () => {
  const router = useRouter();
  const { productId } = router.query;

  return (
    <View>
      <Text>Product ID: {productId}</Text>
    </View>
  );
};

export default ProductPage;
