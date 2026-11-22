import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from '@/hooks/use-color-scheme';
import '@/global.css';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { DemoStoreProvider } from '@/contexts/demo-store';
import { AuthProvider } from '@/contexts/auth-context';
import { initializeDatabase } from '@/database';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const colorScheme = useColorScheme();
  useEffect(() => {
    initializeDatabase().catch((error: unknown) => {
      console.error('Database initialization failed', error);
    });
  }, []);
  return (
    <AuthProvider>
      <DemoStoreProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <AnimatedSplashOverlay />
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#EDDEFF' } }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="explore" />
            <Stack.Screen name="favorites" />
            <Stack.Screen name="cart" />
            <Stack.Screen name="profile" />
            <Stack.Screen name="login" />
            <Stack.Screen name="register" />
            <Stack.Screen name="admin" />
            <Stack.Screen name="admin-orders" />
            <Stack.Screen name="admin-users" />
            <Stack.Screen name="addresses" />
            <Stack.Screen name="checkout" />
            <Stack.Screen name="orders" />
            <Stack.Screen name="info" />
            <Stack.Screen name="store-address" />
            <Stack.Screen name="categories" />
            <Stack.Screen name="sync-status" />
            <Stack.Screen name="product/[id]" options={{ animation: 'slide_from_right' }} />
          </Stack>
        </ThemeProvider>
      </DemoStoreProvider>
    </AuthProvider>
  );
}
