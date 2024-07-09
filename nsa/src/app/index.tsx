// src/app/index.tsx

import 'react-native-gesture-handler'; // Make sure this is at the top of your entry file
import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { Entypo } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import SearchBar from '@/components/search_bar';
import PromotedCollectionList from '@/components/promoted_collection_list';
import Slideshow from '@/components/slideshow';
import PreOrderGrid from '@/components/preorder_grid';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const colorScheme = useColorScheme(); // Get the current color scheme (light or dark)

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts, make any API calls you need to do here
        await Font.loadAsync({
          ...Entypo.font,
        });
        // Artificial delay to simulate slow loading experience
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        // Set app as ready to render
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  // Return null while the app is loading
  if (!appIsReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView
        style={[
          styles.container,
          colorScheme === 'dark' ? styles.darkContainer : styles.lightContainer,
        ]}
        onLayout={onLayoutRootView}
      >
        <View className="bg-white dark:bg-slate-800">
          <SearchBar />
        </View>
        <View className="bg-white dark:bg-slate-800">
          <PromotedCollectionList />
          <Slideshow />
          <PreOrderGrid />
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  lightContainer: {
    backgroundColor: '#FFFFFF',
  },
  darkContainer: {
    backgroundColor: '#1E293B',
  },
});
