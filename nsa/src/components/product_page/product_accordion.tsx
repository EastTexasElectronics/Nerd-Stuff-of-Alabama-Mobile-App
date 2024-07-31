import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface ProductAccordionProps {
  title: string;
  content: React.ReactNode;
  isActive: boolean;
  onToggle: () => void;
}

const ProductAccordion = ({ title, content, isActive, onToggle }: ProductAccordionProps) => {
  return (
    <>
      <TouchableOpacity onPress={onToggle} className="mb-2">
        <View className="flex-row justify-between items-center bg-gray-100 dark:bg-gray-700 p-3 rounded">
          <Text className="font-semibold text-black dark:text-white">{title}</Text>
          <Text>{isActive ? '▲' : '▼'}</Text>
        </View>
      </TouchableOpacity>
      {isActive && (
        <View className="mb-4 p-3">
          {content}
        </View>
      )}
    </>
  );
};

export default ProductAccordion;