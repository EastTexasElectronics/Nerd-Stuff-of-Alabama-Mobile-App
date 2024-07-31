import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

// src/components/product_page/action_buttons.tsx

interface ActionButtonsProps {
  onBuyNow: () => void;
  onAddToCart: () => void;
  isDisabled: boolean;
}

const ActionButtons = ({ onBuyNow, onAddToCart, isDisabled }: ActionButtonsProps) => {
  return (
    <View className="flex-row justify-center space-x-4">
      <TouchableOpacity 
        onPress={onBuyNow} 
        className={`px-6 py-3 rounded-full shadow-md ${isDisabled ? 'bg-gray-400' : 'bg-blue-500'}`}
        disabled={isDisabled}
      >
        <Text className="text-white font-semibold text-center">Buy Now</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        onPress={onAddToCart} 
        className={`px-6 py-3 rounded-full shadow-md ${isDisabled ? 'bg-gray-400' : 'bg-green-500'}`}
        disabled={isDisabled}
      >
        <Text className="text-white font-semibold text-center">Add to Cart</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ActionButtons;