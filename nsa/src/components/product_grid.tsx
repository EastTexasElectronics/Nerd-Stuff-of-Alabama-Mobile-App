import React, { useEffect, useState } from 'react';
import { View, Text, Image, ActivityIndicator, StyleSheet } from 'react-native';
import { fetchProducts } from '../services/shopify_queries';

const ProductGrid = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const products = await fetchProducts();
        console.log('Products:', products); // Log the products to check the data structure
        setProducts(products);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (error) {
    return <Text>Error: {error}</Text>;
  }

  return (
    <View className="flex flex-wrap justify-between">
      {products.map((product: any) => {
        const imageUrl = product.node.images.edges[0]?.node.src;
        console.log('Image URL:', imageUrl); // Log the image URL to ensure it's correct
        return (
          <View key={product.node.id} className="w-1/2 mb-4 p-2">
            {imageUrl ? (
              <Image
                source={{ uri: imageUrl }}
                style={styles.image}
                onError={(e) => console.error(`Failed to load image: ${imageUrl}`, e.nativeEvent.error)}
              />
            ) : (
              <Text>No Image Available</Text>
            )}
            <Text className="mt-2 text-lg font-bold">{product.node.title}</Text>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: 160, // Adjust height as needed
    borderRadius: 10,
  },
});

export default ProductGrid;
