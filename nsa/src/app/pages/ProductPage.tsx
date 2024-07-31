import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { fetchProduct, Product } from '@/services/shopify_queries';
import ProductCarousel from '@/components/product_page/product_carousel';
import ProductAccordion from '@/components/product_page/product_accordion';
import QuantitySelector from '@/components/product_page/quantity_selector';
import PriceDisplay from '@/components/product_page/price_display';
import ActionButtons from '@/components/product_page/action_buttons';

const ProductPage = () => {
  const { productId } = useLocalSearchParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(0);

  useEffect(() => {
    if (productId) {
      fetchProductDetails(productId as string);
    }
  }, [productId]);

  useEffect(() => {
    if (product && product.variants.edges[0]?.node.quantityAvailable > 0) {
      setQuantity(1);
    } else {
      setQuantity(0);
    }
  }, [product]);

  const fetchProductDetails = async (id: string) => {
    console.log(`Attempting to fetch product details for ID: ${id}`);
    try {
      setLoading(true);
      const productData = await fetchProduct(id);
      console.log('Product data received:', JSON.stringify(productData, null, 2));
      setProduct(productData);
    } catch (err) {
      console.error('Error in fetchProductDetails:', err);
      setError((err as Error).message || 'An error occurred while fetching the product.');
    } finally {
      setLoading(false);
    }
  };

  const toggleAccordion = useCallback((section: string) => {
    setActiveAccordion(prev => prev === section ? null : section);
  }, []);

  const decrementQuantity = useCallback(() => {
    setQuantity(prev => Math.max(prev - 1, 1));
  }, []);

  const incrementQuantity = useCallback(() => {
    if (product) {
      setQuantity(prev => Math.min(prev + 1, product.variants.edges[0]?.node.quantityAvailable || 0));
    }
  }, [product]);

  const handleBuyNow = useCallback(() => {
    // Implement buy now functionality
    console.log('Buy Now pressed');
  }, []);

  const handleAddToCart = useCallback(() => {
    // Implement add to cart functionality
    console.log('Add to Cart pressed');
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (error) {
    return <Text className="text-red-500">Error: {error}</Text>;
  }

  if (!product) {
    return <Text className="text-gray-500">No product found</Text>;
  }

  const isDecrementDisabled = quantity <= 1;
  const isIncrementDisabled = quantity >= (product.totalInventory || 0);

  return (
    <ScrollView className="bg-white dark:bg-slate-800 p-5">
      <ProductCarousel images={product.images.edges} />
      <Text className="text-2xl font-bold my-4 text-center text-black dark:text-white">{product.title}</Text>

      <ProductAccordion
        title="Product Description"
        content={<Text className="text-base text-black dark:text-white">{product.descriptionHtml}</Text>}
        isActive={activeAccordion === 'description'}
        onToggle={() => toggleAccordion('description')}
      />

      <ProductAccordion
        title="Product Information"
        content={
          <View>
            <View className="flex-row items-center mb-2">
              <Text className="text-base text-gray-600 dark:text-gray-400 mr-2">Vendor:</Text>
              <Text className="text-base text-black dark:text-white">{product.vendor}</Text>
            </View>
            <View className="flex-row items-center mb-2">
              <Text className="text-base text-gray-600 dark:text-gray-400 mr-2">Product Type:</Text>
              <Text className="text-base text-black dark:text-white">{product.productType}</Text>
            </View>
            <View className="flex-row items-center mb-2">
              <Text className="text-base text-gray-600 dark:text-gray-400 mr-2">Total Inventory:</Text>
              <Text className="text-base text-black dark:text-white">
                {product.totalInventory > 0 ? product.totalInventory : 'Out of Stock'}
              </Text>
            </View>
            <View className="flex-row items-center mb-2">
              <Text className="text-base text-gray-600 dark:text-gray-400 mr-2">Available:</Text>
              <Text className="text-base text-black dark:text-white">
                {product.availableForSale ? 'Yes' : 'No'}
              </Text>
            </View>
            <View className="flex-row items-center mb-2">
              <Text className="text-base text-gray-600 dark:text-gray-400 mr-2">Published:</Text>
              <Text className="text-base text-black dark:text-white">{product.publishedAt}</Text>
            </View>
            <View className="flex-row items-center mb-2">
              <Text className="text-base text-gray-600 dark:text-gray-400 mr-2">Tags:</Text>
              <Text className="text-base text-black dark:text-white">{product.tags.join(', ')}</Text>
            </View>
          </View>
        }
        isActive={activeAccordion === 'information'}
        onToggle={() => toggleAccordion('information')}
      />

      <View className="mt-4">
        <QuantitySelector
          quantity={quantity}
          onDecrement={decrementQuantity}
          onIncrement={incrementQuantity}
          isDecrementDisabled={isDecrementDisabled}
          isIncrementDisabled={isIncrementDisabled}
        />
        
        <PriceDisplay
          isIncrementDisabled={isIncrementDisabled}
          currencyCode={product.priceRange.minVariantPrice.currencyCode}
          amount={product.priceRange.minVariantPrice.amount}
          compareAtPrice={product.compareAtPriceRange.minVariantPrice.amount}
        />

        <ActionButtons
          onBuyNow={handleBuyNow}
          onAddToCart={handleAddToCart}
          isDisabled={!product.availableForSale || product.totalInventory === 0}
        />
      </View>
    </ScrollView>
  );
};

export default ProductPage;