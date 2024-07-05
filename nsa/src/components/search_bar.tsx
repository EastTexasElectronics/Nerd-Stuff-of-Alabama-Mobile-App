import React from 'react';
import { View, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const SearchBar = () => {
  return (
    <View className="flex flex-row items-center p-4 mx-4 mt-4 rounded-md bg-gray-200">
      <MaterialCommunityIcons name="store-search" size={24} color="black" style={{ marginRight: 8 }} />
      <TextInput
        placeholder="Search products..."
        placeholderTextColor="#000"
        className="flex-1 p-2 text-black bg-white rounded-md"
      />
    </View>
  );
};

export default SearchBar;
