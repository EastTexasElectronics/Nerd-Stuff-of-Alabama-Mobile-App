import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, FlatList, Text, Image, ActivityIndicator, TouchableOpacity, TouchableWithoutFeedback, Keyboard } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { searchShopify } from '../services/shopify_queries';

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [noResults, setNoResults] = useState(false);

  const textInputRef = useRef(null);

  useEffect(() => {
    const fetchResults = async () => {
      if (searchQuery.length >= 2) {
        setLoading(true);
        setError('');
        setNoResults(false);
        try {
          const response = await searchShopify(searchQuery);
          const combinedResults = [...response.products, ...response.collections];
          setResults(combinedResults);
          if (combinedResults.length === 0) {
            setNoResults(true);
          }
        } catch (error) {
          setError('Error fetching search results. Please try again.');
          console.error('Error fetching search results:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
        setNoResults(false);
      }
    };

    const debounceFetch = setTimeout(fetchResults, 300); // Wait 0.3 seconds before fetching results
    return () => clearTimeout(debounceFetch);
  }, [searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleClear = () => {
    setSearchQuery('');
    setResults([]);
    setNoResults(false);
  };

  const handleOutsideClick = () => {
    setSearchQuery('');
    setResults([]);
    setNoResults(false);
    Keyboard.dismiss();
  };

  const truncateTitle = (title: string, maxLength: number) => {
    return title.length > maxLength ? title.substring(0, maxLength) + '...' : title;
  };

  return (
    <TouchableWithoutFeedback onPress={handleOutsideClick}>
      <View className="relative flex flex-col mx-4 mt-4">
        <View className="flex flex-row items-center p-4 bg-gray-200 rounded-md relative">
          <MaterialCommunityIcons
            name="store-search"
            size={24}
            color="black"
            style={{ position: 'absolute', left: 16, zIndex: 1 }}
          />
          <TextInput
            ref={textInputRef}
            value={searchQuery}
            onChangeText={handleSearch}
            placeholder="Search products..."
            placeholderTextColor="#000"
            className="flex-1 pl-10 pr-4 py-2 text-black bg-gray-200 rounded-md h-5"
          />
          {loading ? (
            <ActivityIndicator
              size="small"
              color="#000"
              style={{ position: 'absolute', right: 40, zIndex: 1 }}
            />
          ) : (
            searchQuery.length > 0 && (
              <TouchableOpacity onPress={handleClear} style={{ position: 'absolute', right: 16, zIndex: 1 }}>
                <MaterialCommunityIcons name="close-circle" size={24} color="black" />
              </TouchableOpacity>
            )
          )}
        </View>
        {error && <Text className="text-red-500 mt-2">{error}</Text>}
        {noResults && !loading && searchQuery.length > 0 && (
          <View className="absolute top-16 left-0 right-0 px-4 items-center">
            <Text className="text-gray-500">No results found.</Text>
          </View>
        )}
        {searchQuery.length > 0 && (
          <FlatList
            data={results}
            keyExtractor={(item) => item.node.id}
            renderItem={({ item }) => (
              <View className="flex flex-row items-center p-4">
                <Image
                  source={{ uri: item.node.images?.edges[0]?.node.src || item.node.image?.src }}
                  style={{ width: 50, height: 50, marginRight: 10 }}
                />
                <View className="flex flex-col">
                  <Text className="text-lg font-bold text-black dark:text-white">
                    {/* Shorten the title to 30 characters */}
                    {truncateTitle(item.node.title, 30)} 
                  </Text>
                </View>
              </View>
            )}
          />
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

export default SearchBar;
