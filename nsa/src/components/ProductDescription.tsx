// src/components/ProductDescription.tsx
import React from 'react';
import { Text } from 'react-native';

type Props = {
    description: string;
};

const ProductDescription: React.FC<Props> = ({ description }) => {
    return <Text className="mt-2">{description}</Text>;
};

export default ProductDescription;
