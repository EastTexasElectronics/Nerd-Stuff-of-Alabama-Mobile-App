import React, { useCallback } from 'react';
import { View, Dimensions } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import Animated, { interpolate, AnimatedStyle } from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const scale = 0.8;
const PAGE_WIDTH = width * scale;
const PAGE_HEIGHT = width * scale;

interface ProductImage {
  node: {
    originalSrc: string;
  }
}

interface ProductCarouselProps {
  images: ProductImage[];
}

const ProductCarousel = ({ images }: ProductCarouselProps) => {
  const animationStyle = useCallback((value: number): AnimatedStyle<any> => {
    'worklet';

    const zIndex = interpolate(value, [-1, 0, 1], [10, 20, 30]);
    const scale = interpolate(value, [-1, 0, 1], [1.25, 1, 0.25]);
    const rotateZ = `${interpolate(value, [-1, 0, 1], [-45, 0, 45])}deg`;
    const translateX = interpolate(value, [-1, 0, 1], [-PAGE_WIDTH, 0, PAGE_WIDTH]);
    const opacity = interpolate(value, [-0.75, 0, 1], [0, 1, 0]);

    return {
      transform: [{ scale }, { rotateZ }, { translateX }],
      zIndex,
      opacity,
    };
  }, []);

  return (
    <View className="justify-center items-center mb-4">
      <Carousel
        loop
        width={PAGE_WIDTH}
        height={PAGE_HEIGHT}
        data={images}
        renderItem={({ item }: { item: ProductImage }) => (
          <View className="justify-center items-center">
            <Animated.Image
              source={{ uri: item.node.originalSrc }}
              className="w-full h-full object-contain shadow-lg"
            />
          </View>
        )}
        customAnimation={animationStyle}
      />
    </View>
  );
};

export default ProductCarousel;