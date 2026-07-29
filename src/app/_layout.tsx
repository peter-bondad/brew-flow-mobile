import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { useColorScheme } from 'react-native';
import { useEffect } from 'react';
import { Slot, useSegments, useRouter } from 'expo-router';
import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { QueryProvider } from '@/providers/query-provider';
import { CartProvider } from '@/features/cart/cart-context';
import { ToastProvider } from '@/features/toast/toast-context';
import { useAuth } from '@/features/auth/api';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <QueryProvider>
        <CartProvider>
          <ToastProvider>
            <RootLayoutContent />
          </ToastProvider>
        </CartProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}

function RootLayoutContent() {
  const { data: session, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = (segments[0] as string) === 'login';
    const inTabsGroup = (segments[0] as string) === '(tabs)';

    if (!session && !inAuthGroup) {
      router.replace('/login' as any);
    } else if (session && inAuthGroup) {
      router.replace('/' as any);
    }
  }, [session, isLoading, segments]);

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  if (isLoading) {
    return <AnimatedSplashOverlay />;
  }

  return <Slot />;
}
