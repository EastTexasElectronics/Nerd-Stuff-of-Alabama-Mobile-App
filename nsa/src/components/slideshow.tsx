import React, { useState, useEffect, useRef } from 'react';
import { View, FlatList, TouchableOpacity, Dimensions, Text, ActivityIndicator, Linking, Alert, NativeScrollEvent } from 'react-native';
import { Image } from 'expo-image';

const { width } = Dimensions.get('window');
const blurhash = '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

/**
 * Slideshow Component
 * 
 * A component that displays a slideshow of images with automatic scrolling and clickable images.
 * The slideshow loops when reaching the end of the image array.
 */
const Slideshow = () => {
  const [images] = useState([
    { url: 'https://via.placeholder.com/800x300', link: 'https://example.com/page1' },
    { url: 'https://via.placeholder.com/800x300', link: 'https://example.com/page2' },
    { url: 'https://via.placeholder.com/800x300', link: 'https://example.com/page3' },
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Simulate loading data
    const fetchData = async () => {
      // Simulate a delay
      setTimeout(() => {
        setIsLoading(false);
      }, 350); //TODO: Set to 0 for production
    };
    fetchData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 6000); // Controls the time between images
    return () => clearInterval(interval);
  }, [images.length]);

  useEffect(() => {
    if (flatListRef.current && currentIndex >= 0 && currentIndex < images.length) {
      flatListRef.current.scrollToIndex({ index: currentIndex, animated: true });
    }
  }, [currentIndex, images.length]);

  /**
   * Handle the end of the scroll momentum
   * 
   * @param event - The native scroll event
   */
  const handleMomentumScrollEnd = (event: { nativeEvent: NativeScrollEvent }) => {
    const newIndex = Math.floor(event.nativeEvent.contentOffset.x / width);
    if (newIndex >= images.length) {
      setCurrentIndex(0);
      flatListRef.current?.scrollToIndex({ index: 0, animated: false });
    } else if (newIndex < 0) {
      setCurrentIndex(images.length - 1);
      flatListRef.current?.scrollToIndex({ index: images.length - 1, animated: false });
    } else {
      setCurrentIndex(newIndex);
    }
  };

  /**
   * Handle image press
   * 
   * @param link - The URL to navigate to
   */
  const handleImagePress = (link: string) => {
    Linking.canOpenURL(link).then((supported) => {
      if (supported) {
        Linking.openURL(link);
      } else {
        Alert.alert("Can't open this URL");
      }
    });
  };

  /**
   * Render an individual slideshow item
   * 
   * @param item - The image object containing URL and link
   */
  const renderItem = ({ item }: { item: { url: string; link: string } }) => (
    <TouchableOpacity onPress={() => handleImagePress(item.link)} accessible={true} accessibilityLabel="Navigate to link">
      <Image
        source={{ uri: item.url }}
        style={{ width, height: 300 }}
        placeholder={{ blurhash }}
        contentFit="cover"
        transition={1000}
      />
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View className="h-50 w-full bg-gray-200">
      <FlatList
        ref={flatListRef}
        data={images}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleMomentumScrollEnd}
      />
      <View className="absolute bottom-0 w-full flex-row justify-center p-2">
        {images.map((_, index) => (
          <View
            key={index}
            className={`h-2 w-2 mx-1 rounded-full ${index === currentIndex ? 'bg-black' : 'bg-gray-400'}`}
          />
        ))}
      </View>
      {images.length === 0 && (
        <View className="absolute inset-0 justify-center items-center">
          <Text className="text-gray-500">We are experiencing an issue, and there are no images available.</Text>
        </View>
      )}
    </View>
  );
};

export default Slideshow;
