import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface QuantitySelectorProps {
  quantity: number;
  onDecrement: () => void;
  onIncrement: () => void;
  isDecrementDisabled: boolean;
  isIncrementDisabled: boolean;
}

const QuantitySelector = ({
  quantity,
  onDecrement,
  onIncrement,
  isDecrementDisabled,
  isIncrementDisabled,
}: QuantitySelectorProps) => {
  return (
    <View className="flex-row items-center justify-center mb-4">
      <TouchableOpacity
        onPress={onDecrement}
        disabled={isDecrementDisabled}
        className={`p-2 rounded-l-lg ${isDecrementDisabled
            ? 'bg-gray-300 dark:bg-gray-700'
            : 'bg-gray-200 dark:bg-gray-600'
          }`}
      >
        <Text className={`text-lg ${isDecrementDisabled
            ? 'text-gray-500 dark:text-gray-400'
            : 'text-black dark:text-white'
          }`}>-</Text>
      </TouchableOpacity>
      <Text className="text-base mx-4 text-black dark:text-white min-w-[30px] text-center">
        {quantity}
      </Text>
      <TouchableOpacity
        onPress={onIncrement}
        disabled={isIncrementDisabled}
        className={`p-2 rounded-r-lg ${isIncrementDisabled
            ? 'bg-gray-300 dark:bg-gray-700'
            : 'bg-gray-200 dark:bg-gray-600'
          }`}
      >
        <Text className={`text-lg ${isIncrementDisabled
            ? 'text-gray-500 dark:text-gray-400'
            : 'text-black dark:text-white'
          }`}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

export default QuantitySelector;