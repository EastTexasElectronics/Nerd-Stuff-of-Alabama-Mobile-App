// src/components/search_bar.tsx
import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, FlatList, Text, Image, ActivityIndicator, TouchableOpacity, TouchableWithoutFeedback, Keyboard, Platform, Animated } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { searchShopify } from '../services/shopify_queries';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState(''); // State to hold the search query
  const [results, setResults] = useState([]); // State to hold the search results
  const [loading, setLoading] = useState(false); // State to indicate if results are being loaded
  const [error, setError] = useState(''); // State to hold any error messages
  const [noResults, setNoResults] = useState(false); // State to indicate if no results were found
  const [recentSearches, setRecentSearches] = useState<string[]>([]); // State to hold recent searches
  const [isFocused, setIsFocused] = useState(false); // State to track if the search bar is focused
  const [resultsHeight] = useState(new Animated.Value(0)); // Animated value for results container height

  const textInputRef = useRef(null); // Ref for the TextInput component

  useEffect(() => {
    // Fetch search results when searchQuery changes
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
          saveRecentSearch(searchQuery);
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

    const debounceFetch = setTimeout(fetchResults, 300); // Debounce the search to limit API calls
    return () => clearTimeout(debounceFetch); // Clear timeout on component unmount or query change
  }, [searchQuery]);

  useEffect(() => {
    // Load recent searches when component mounts
    loadRecentSearches();
  }, []);

  const loadRecentSearches = async () => {
    // Load recent searches from AsyncStorage
    try {
      const searches = await AsyncStorage.getItem('recentSearches');
      if (searches) {
        setRecentSearches(JSON.parse(searches));
      }
    } catch (error) {
      console.error('Error loading recent searches:', error);
    }
  };

  const saveRecentSearch = async (query: string) => {
    // Save the current search query to recent searches in AsyncStorage
    try {
      let searches = await AsyncStorage.getItem('recentSearches');
      searches = searches ? JSON.parse(searches) : [];
      if (Array.isArray(searches) && !searches.includes(query)) {
        searches.unshift(query);
        if (searches.length > 5) searches.pop(); // Keep only the latest 5 searches
        await AsyncStorage.setItem('recentSearches', JSON.stringify(searches));
        setRecentSearches(searches);
      }
    } catch (error) {
      console.error('Error saving recent search:', error);
    }
  };

  const handleSearch = (query: string) => {
    // Update the search query state
    setSearchQuery(query);
    if (query.length === 0) {
      setResults([]);
      setNoResults(false);
    }
  };

  const handleClear = () => {
    // Clear the search query and results
    setSearchQuery('');
    setResults([]);
    setNoResults(false);
  };

  const handleOutsideClick = () => {
    // Handle clicking outside the search bar
    setSearchQuery('');
    setResults([]);
    setNoResults(false);
    Keyboard.dismiss();
    setIsFocused(false);
  };

  const handleRecentSearchClick = (query: string) => {
    // Handle clicking on a recent search
    setSearchQuery(query);
    textInputRef.current.focus();
  };

  const handleClearRecentSearches = async () => {
    // Clear recent searches from AsyncStorage
    try {
      await AsyncStorage.removeItem('recentSearches');
      setRecentSearches([]);
    } catch (error) {
      console.error('Error clearing recent searches:', error);
    }
  };

  const truncateTitle = (title: string, maxLength: number) => {
    // Truncate a title if it exceeds the specified length
    return title.length > maxLength ? title.substring(0, maxLength) + '...' : title;
  };

  useEffect(() => {
    // Animate the height of the results container based on results presence
    Animated.timing(resultsHeight, {
      toValue: results.length > 0 || noResults ? 200 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [results, noResults]);

  return (
    <TouchableWithoutFeedback onPress={handleOutsideClick} accessible={false}>
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
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Search products..."
            placeholderTextColor="#000"
            className="flex-1 pl-10 pr-4 py-2 text-black bg-gray-200 rounded-md"
            accessibilityLabel="Search products"
            accessibilityHint="Enter at least 2 characters to search for products"
            accessibilityRole="search"
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
        {noResults && !loading && searchQuery.length >= 2 && (
          <View className="mt-4 px-4 items-center">
            <Text className="text-gray-500">No results found.</Text>
          </View>
        )}
        <Animated.View style={{ height: resultsHeight, overflow: 'hidden' }}>
          {searchQuery.length >= 2 && (
            <FlatList
              data={results}
              keyExtractor={(item) => item.node.id}
              renderItem={({ item }) => (
                <View className="flex flex-row items-center p-4">
                  <Image
                    source={{ uri: item.node.images?.edges[0]?.node.src || item.node.image?.src }}
                    style={{ width: 50, height: 50, marginRight: 10 }}
                    accessibilityLabel={item.node.title}
                  />
                  <View className="flex flex-col">
                    <Text className="text-lg font-bold text-black dark:text-white">
                      {truncateTitle(item.node.title, 30)}
                    </Text>
                  </View>
                </View>
              )}
              contentContainerStyle={{ paddingBottom: Platform.OS === 'ios' ? 20 : 0 }} // Adjust for iOS safe area
            />
          )}
        </Animated.View>
        {isFocused && searchQuery.length < 2 && recentSearches.length > 0 && (
          <View className="mt-4 px-4">
            <Text className="text-gray-500 mb-2">Recent Searches:</Text>
            {recentSearches.map((search, index) => (
              <TouchableOpacity key={index} onPress={() => handleRecentSearchClick(search)}>
                <Text className="text-black dark:text-white">{search}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={handleClearRecentSearches}>
              <Text className="text-red-500 mt-2">Clear Recent Searches</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

export default SearchBar;
