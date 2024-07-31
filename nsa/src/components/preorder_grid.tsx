// src/components/preorder_grid.tsx
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, useColorScheme } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

import { fetchCollectionProducts } from '@/services/shopify_queries';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import Product from '@/data/types';

const COLLECTION_ID = 'gid://shopify/Collection/477286105364'; //Pre-Orders collection ID
const ITEMS_PER_PAGE = 10; //Number of products per page
const blurhash = 'LEHV6nWB2yk8pyo0adR*.7kCMdnj'; //Blurhash for loading images

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
  const [currentPage, setCurrentPage] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const colorScheme = useColorScheme();
  const productsPerPageRef = useRef<Product[][]>([]);
  const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const router = useRouter(); // Add this line to use router for navigation

  useEffect(() => {
    loadInitialProducts();
  }, []);

  const loadInitialProducts = async () => {
    setLoading(true);
    try {
      const productsData = await fetchProductsUntilLimit();
      updateProductsState(productsData, false);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
      keepIconsActive();
    }
  };

  const fetchProductsUntilLimit = async (after?: string, before?: string) => {
    let fetchedProducts: Product[] = [];
    let endCursor = after;
    let hasNextPage = true;

    while (fetchedProducts.length < ITEMS_PER_PAGE && hasNextPage) {
      const response = await fetchCollectionProducts(COLLECTION_ID, ITEMS_PER_PAGE, endCursor, before);

      if (!response || !response.edges) {
        throw new Error("Invalid response structure");
      }

      const newProducts = formatProducts(response.edges);
      fetchedProducts = [...fetchedProducts, ...newProducts];
      endCursor = response.pageInfo.endCursor;
      hasNextPage = response.pageInfo.hasNextPage;
    }

    setPageInfo({ ...pageInfo, endCursor, hasNextPage });
    return fetchedProducts.slice(0, ITEMS_PER_PAGE);
  };

  const formatProducts = useCallback((edges: any[]) => {
    return edges
      .filter(edge => edge.node.variants.edges[0].node.availableForSale)
      .map((edge: any) => ({
        ...edge.node,
        price: edge.node.variants.edges[0].node.priceV2.amount,
        createdAt: edge.node.createdAt,
      }))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, []);

  const updateProductsState = useCallback((newProducts: Product[], prepend: boolean) => {
    if (prepend) {
      productsPerPageRef.current = [newProducts, ...productsPerPageRef.current];
      setCurrentPage((prev) => Math.max(prev - 1, 0));
    } else {
      productsPerPageRef.current = [...productsPerPageRef.current, newProducts];
      setCurrentPage((prev) => prev + 1);
    }
    setProducts(newProducts);
  }, []);

  const handleError = useCallback((error: any) => {
    setError(error.message);
    console.error("Error fetching collection products:", error);
  }, []);

  const handleSwipeLeft = async () => {
    setIsScrolling(true);
    clearScrollTimeout();
    const nextPage = currentPage + 1;
    if (nextPage < productsPerPageRef.current.length) {
      setCurrentPage(nextPage);
      setProducts(productsPerPageRef.current[nextPage] || []);
    } else if (pageInfo.hasNextPage) {
      await loadNextPageProducts();
    } else {
      setCurrentPage(0);
      setProducts(productsPerPageRef.current[0] || []);
    }
  };

  const handleSwipeRight = () => {
    setIsScrolling(true);
    clearScrollTimeout();
    const previousPage = currentPage - 1;
    if (previousPage >= 0) {
      setCurrentPage(previousPage);
      setProducts(productsPerPageRef.current[previousPage] || []);
    } else {
      setCurrentPage(0);
      setProducts(productsPerPageRef.current[0] || []);
    }
  };

  const loadNextPageProducts = async () => {
    setLoading(true);
    try {
      const productsData = await fetchProductsUntilLimit(pageInfo.endCursor);
      updateProductsState(productsData, false);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
      keepIconsActive();
    }
  };

  const handleGestureEvent = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      if (event.nativeEvent.translationX < -50) {
        handleSwipeLeft();
      } else if (event.nativeEvent.translationX > 50) {
        handleSwipeRight();
      }
      clearScrollTimeout();
    } else if (event.nativeEvent.state === State.BEGAN || event.nativeEvent.state === State.ACTIVE) {
      setIsScrolling(true);
      clearScrollTimeout();
      keepIconsActive();
    }
  };

  const keepIconsActive = useCallback(() => {
    scrollTimeout.current = setTimeout(() => {
      setIsScrolling(false);
    }, 2500);
  }, []);

  const clearScrollTimeout = useCallback(() => {
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
      scrollTimeout.current = null;
    }
  }, []);

  const renderProduct = useCallback(({ item }: { item: Product }) => (
    <TouchableOpacity
      key={item.id}
      className="w-1/2 p-2 mb-4 items-center"
      onPress={() => router.push(`/pages/ProductPage?productId=${item.id}`)}
    >
      {item.images.edges[0]?.node.src ? (
        <Image
          source={{ uri: item.images.edges[0].node.src }}
          style={{ aspectRatio: 1, width: '100%', height: 180 }}
          onError={(error) => console.error(`Failed to load product image: ${item.images.edges[0].node.src}`, error)}
          placeholder={{ blurhash }}
          contentFit="cover"
          transition={1000}
        />
      ) : (
        <Text className="text-center text-black dark:text-white">No Image Available</Text>
      )}
      <Text className="text-black dark:text-white">${item.price}</Text>
      <Text className="mt-2 text-lg font-bold text-left text-black dark:text-white">
        {item.title.length > 35 ? `${item.title.substring(0, 35)}...` : item.title}
      </Text>
    </TouchableOpacity>
  ), []);

  return (
    <View className="relative bg-white dark:bg-slate-800 flex-1 border border-gray-300 dark:border-gray-600 rounded-lg">
      <Text className="text-2xl font-bold text-center text-black dark:text-white mt-4">Upcoming Releases</Text>
      <Text className="text-lg text-center text-gray-500 dark:text-gray-400 mb-4">Pre-Order your Pops</Text>
      <PanGestureHandler onHandlerStateChange={handleGestureEvent}>
        <FlatList
          data={products}
          keyExtractor={item => item.id}
          renderItem={renderProduct}
          numColumns={2}
          onEndReachedThreshold={0.5}
          contentContainerStyle={{ padding: 10 }}
          className="flex-1"
        />
      </PanGestureHandler>
      {isScrolling && (
        <View className="absolute top-1/2 left-0 right-0 flex-row justify-between items-center z-10 px-2 -translate-y-1/2">
          <TouchableOpacity onPress={handleSwipeRight} className="ml-1">
            <MaterialCommunityIcons name="chevron-left-circle-outline" size={32} color={colorScheme === 'dark' ? 'white' : 'black'} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSwipeLeft} className="mr-1">
            <MaterialCommunityIcons name="chevron-right-circle-outline" size={32} color={colorScheme === 'dark' ? 'white' : 'black'} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default PreOrderGrid;
