// src/components/promoted_collection_list.tsx

import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Collection } from '../data/types';

const collections: Collection[] = [
    { key: 'funko_pops', name: 'Funko Pops' },
    { key: 'pre_orders', name: 'Pre-Orders' },
    { key: 'on_sale', name: 'On Sale' },
    { key: 'all_collections', name: 'All Collections' },
];

const PromotedCollectionList = () => {
    return (
        <View className="py-2" accessible={true}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 10 }}
                accessible={true}
                accessibilityRole="menubar"
                accessibilityLabel="Promoted Collections"
                accessibilityHint="Select a promoted collection to view its products"
            >
                {collections.map(({ key, name }) => (
                    <TouchableOpacity
                        key={key}
                        className="mr-4 py-2 px-4 bg-gray-200 dark:bg-gray-700 rounded-full"
                        accessible={true}
                        accessibilityRole="button"
                        accessibilityLabel={name}
                        accessibilityHint={`Navigate to ${name} collection`}
                    >
                        <Text className="text-base text-gray-900 dark:text-gray-100">{name}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

export default React.memo(PromotedCollectionList);
