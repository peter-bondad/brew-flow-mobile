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
  const { data: session, isFetching } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isFetching) return;

    const inAuthGroup = (segments[0] as string) === 'login';

    if (!session && !inAuthGroup) {
      router.replace('/login' as any);
    } else if (session && inAuthGroup) {
      router.replace('/' as any);
    }
  }, [session, isFetching, segments]);

  useEffect(() => {
    if (!isFetching) {
      SplashScreen.hideAsync();
    }
  }, [isFetching]);

  if (isFetching) {
    return <AnimatedSplashOverlay />;
  }

  return <Slot />;
}
