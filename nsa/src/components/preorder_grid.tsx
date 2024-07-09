// src/components/preorder_grid.tsx

import React, { useEffect, useState } from 'react';
import { View, Text, Image, ActivityIndicator, FlatList } from 'react-native';
import { fetchCollectionProducts } from '@/services/shopify_queries';
import { useColorScheme } from 'react-native';

const COLLECTION_ID = 'gid://shopify/Collection/477286105364'; // Pre-Orders collection ID
const ITEMS_PER_PAGE = 20;

interface Product {
  id: string;
  title: string;
  price: string;
  images: {
    edges: Array<{
      node: {
        src: string;
      };
    }>;
  };
}

const PreOrderGrid = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageInfo, setPageInfo] = useState({
    hasNextPage: false,
    hasPreviousPage: false,
    startCursor: '',
    endCursor: '',
  });

  const colorScheme = useColorScheme(); // Get the current color scheme

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async (after?: string, before?: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchCollectionProducts(COLLECTION_ID, ITEMS_PER_PAGE, after, before);
      setProducts(response.edges.map((edge: any) => ({
        ...edge.node,
        price: edge.node.variants.edges[0].node.priceV2.amount,
      })));
      setPageInfo(response.pageInfo);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadNextPage = () => {
    if (pageInfo.hasNextPage) {
      loadProducts(pageInfo.endCursor);
    }
  };

  const loadPreviousPage = () => {
    if (pageInfo.hasPreviousPage) {
      loadProducts(undefined, pageInfo.startCursor);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (error) {
    return <Text>Error: {error}</Text>;
  }

  return (
    <View className="bg-white dark:bg-slate-800 p-4">
      <Text className="text-2xl font-bold text-center text-black dark:text-white">Upcoming Releases</Text>
      <Text className="text-lg text-center text-gray-500 dark:text-gray-400 mb-4">Pre-Order your Pops</Text>
      <FlatList
        data={products}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View className="w-1/2 p-2 mb-4">
            {item.images.edges[0]?.node.src ? (
              <Image
                source={{ uri: item.images.edges[0].node.src }}
                className="w-full h-40 rounded-lg bg-transparent"
                style={{ aspectRatio: 1 }}
                onError={(e) => console.error(`Failed to load image: ${item.images.edges[0].node.src}`, e.nativeEvent.error)}
              />
            ) : (
              <Text className="text-center text-black dark:text-white">No Image Available</Text>
            )}
            <Text className="text-black dark:text-white">${item.price}</Text>
            <Text className="mt-2 text-lg font-bold text-black dark:text-white">{item.title.length > 35 ? `${item.title.substring(0, 35)}...` : item.title}</Text>
          </View>
        )}
        numColumns={2}
        onEndReached={loadNextPage}
        onEndReachedThreshold={0.5}
        contentContainerStyle={{ padding: 10 }}
      />
    </View>
  );
};

export default PreOrderGrid;
