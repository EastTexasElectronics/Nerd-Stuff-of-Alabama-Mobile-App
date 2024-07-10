// src/components/preorder_grid.tsx

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, useColorScheme } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { Image } from 'expo-image';

import { fetchCollectionProducts } from '@/services/shopify_queries';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import Product from '@/data/types';

const COLLECTION_ID = 'gid://shopify/Collection/477286105364'; //Pre-Orders collection ID
const ITEMS_PER_PAGE = 10; //Number of products per page
const blurhash = 'LEHV6nWB2yk8pyo0adR*.7kCMdnj'; //Blurhash for loading images

/**
 * PreOrderGrid component displays a grid of pre-order products.
 */
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

    // Load initial products when the component mounts
    useEffect(() => {
        loadInitialProducts();
    }, []);

    /**
     * Loads the initial set of products.
     */
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

    /**
     * Fetches products until the specified limit (ITEMS_PER_PAGE) is reached.
     * @param after - The cursor for fetching the next set of products.
     * @param before - The cursor for fetching the previous set of products.
     * @returns A list of products up to the specified limit.
     */
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

    /**
     * Formats the product data and sorts them by creation date.
     * @param edges - The raw product data from the API.
     * @returns The formatted and sorted product data.
     */
    const formatProducts = useCallback((edges: any[]) => {
        return edges
            .filter(edge => edge.node.variants.edges[0].node.availableForSale)
            .map((edge: any) => ({
                ...edge.node,
                price: edge.node.variants.edges[0].node.priceV2.amount,
                createdAt: edge.node.createdAt,
            }))
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); // Sort by creation date
    }, []);

    /**
     * Updates the state with new products.
     * @param newProducts - The new products to update the state with.
     * @param prepend - Whether to prepend the new products to the existing list.
     */
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

    /**
     * Handles errors during data fetching.
     * @param error - The error object.
     */
    const handleError = useCallback((error: any) => {
        setError(error.message);
        console.error("Error fetching collection products:", error);
    }, []);

    /**
     * Handles the left swipe gesture to load the next page of products.
     */
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

    /**
     * Handles the right swipe gesture to load the previous page of products.
     */
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

    /**
     * Loads the next page of products.
     */
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

    /**
     * Handles gesture events for swiping left or right.
     * @param event - The gesture event.
     */
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

    /**
     * Keeps the swipe icons active.
     */
    const keepIconsActive = useCallback(() => {
        scrollTimeout.current = setTimeout(() => {
            setIsScrolling(false);
        }, 2500); // Set the timeout to 2.5 seconds
    }, []);

    /**
     * Clears the scroll timeout.
     */
    const clearScrollTimeout = useCallback(() => {
        if (scrollTimeout.current) {
            clearTimeout(scrollTimeout.current);
            scrollTimeout.current = null;
        }
    }, []);

    /**
     * Renders a single product item.
     * @param item - The product item to render.
     * @returns The product item component.
     */
    const renderProduct = useCallback(({ item }: { item: Product }) => (
        <View key={item.id} className="w-1/2 p-2 mb-4 items-center" aria-label={`Product: ${item.title}`}>
            {item.images.edges[0]?.node.src ? (
                <Image
                    source={{ uri: item.images.edges[0].node.src }}
                    style={{ aspectRatio: 1, width: '100%', height: 180 }}
                    onError={(error) => console.error(`Failed to load product image: ${item.images.edges[0].node.src}`, error)}
                    placeholder={{ blurhash }}
                    contentFit="cover"
                    transition={1000}
                    aria-label={`Image of ${item.title}`}
                />
            ) : (
                <Text className="text-center text-black dark:text-white" aria-label="No image available">No Image Available</Text>
            )}
            <Text className="text-black dark:text-white" aria-label={`Price: ${item.price}`}>${item.price}</Text>
            <Text className="mt-2 text-lg font-bold text-left text-black dark:text-white" aria-label={`Title: ${item.title}`}>
                {item.title.length > 35 ? `${item.title.substring(0, 35)}...` : item.title}
            </Text>
        </View>
    ), []);

    return (
        <View className="relative bg-white dark:bg-slate-800 flex-1 border border-gray-300 dark:border-gray-600 rounded-lg">
            <Text className="text-2xl font-bold text-center text-black dark:text-white mt-4" aria-label="Upcoming Releases">Upcoming Releases</Text>
            <Text className="text-lg text-center text-gray-500 dark:text-gray-400 mb-4" aria-label="Pre-Order your Pops">Pre-Order your Pops</Text>
            <PanGestureHandler onHandlerStateChange={handleGestureEvent}>
                <FlatList
                    data={products}
                    keyExtractor={item => item.id}
                    renderItem={renderProduct}
                    numColumns={2}
                    onEndReachedThreshold={0.5}
                    contentContainerStyle={{ padding: 10 }}
                    className="flex-1"
                    accessibilityRole="list"
                    accessibilityLabel="Pre-Order Product List"
                />
            </PanGestureHandler>
            {isScrolling && (
                <View className="absolute top-1/2 left-0 right-0 flex-row justify-between items-center z-10 px-2 -translate-y-1/2" aria-live="polite">
                    <TouchableOpacity onPress={handleSwipeRight} className="ml-1" accessibilityLabel="Previous page">
                        <MaterialCommunityIcons name="chevron-left-circle-outline" size={32} color={colorScheme === 'dark' ? 'white' : 'black'} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleSwipeLeft} className="mr-1" accessibilityLabel="Next page">
                        <MaterialCommunityIcons name="chevron-right-circle-outline" size={32} color={colorScheme === 'dark' ? 'white' : 'black'} />
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

export default PreOrderGrid;
