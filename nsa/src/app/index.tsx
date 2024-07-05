import React, { useCallback, useEffect, useState } from 'react';
import { View, ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { Entypo } from '@expo/vector-icons';
// import ProductGrid from '../components/product_grid';
import SearchBar from '../components/search_bar';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts, make any API calls you need to do here
        await Font.loadAsync({
          ...Entypo.font,
        });
        // Artificially delay for two seconds to simulate a slow loading experience.
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      // Hide the splash screen once the root view has performed layout
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <SafeAreaView style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <ScrollView>
        <SearchBar />
        {/* <View className="p-4 my-4 mx-4 rounded-md">
          <Text>List of Collections</Text>
        </View>
        <View className="p-4 my-4 mx-4 rounded-md">
          <Text>Promo Banner</Text>
        </View> */}
        {/* <View className="p-4 my-4 mx-4 rounded-md">
          <ProductGrid />
        </View> */}
      </ScrollView>
    </SafeAreaView>
  );
}
