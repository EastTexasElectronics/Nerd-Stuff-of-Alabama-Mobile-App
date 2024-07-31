// src/components/ProductImageCarousel.tsx
import React from 'react';
import { ScrollView, Image, StyleSheet } from 'react-native';

type Props = {
  images: { node: { originalSrc: string } }[];
};

const ProductImageCarousel: React.FC<Props> = ({ images }) => {
  return (
    <ScrollView horizontal pagingEnabled>
      {images.map((img, index) => (
        <Image key={index} source={{ uri: img.node.originalSrc }} style={styles.image} />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  image: {
    width: 300,
    height: 300,
  },
});

export default ProductImageCarousel;
