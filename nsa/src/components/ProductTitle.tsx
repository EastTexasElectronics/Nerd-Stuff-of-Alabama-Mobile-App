// src/components/ProductTitle.tsx
import React from 'react';
import { Text } from 'react-native';

type Props = {
    title: string;
};

const ProductTitle: React.FC<Props> = ({ title }) => {
    return <Text className="text-xl font-bold">{title}</Text>;
};

export default ProductTitle;
