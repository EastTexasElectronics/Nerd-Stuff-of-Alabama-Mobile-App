import React from 'react';
import { Text } from 'react-native';

interface PriceDisplayProps {
  isIncrementDisabled: boolean;
  currencyCode: string;
  amount: string;
  compareAtPrice?: string;
}

const PriceDisplay = ({ isIncrementDisabled, currencyCode, amount, compareAtPrice }: PriceDisplayProps) => {
  return (
    <Text className="text-center mb-4">
      {isIncrementDisabled ? (
        <Text className="text-red-500 text-sm">No more available</Text>
      ) : (
        <>
          <Text className="text-green-500 text-lg font-bold">
            {currencyCode} {amount}
          </Text>
          {compareAtPrice && parseFloat(compareAtPrice) > parseFloat(amount) && (
            <Text className="text-gray-500 text-sm line-through ml-2">
              {currencyCode} {compareAtPrice}
            </Text>
          )}
        </>
      )}
    </Text>
  );
};

export default PriceDisplay;