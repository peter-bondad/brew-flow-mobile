import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { useColorScheme } from 'react-native';
import { useEffect } from 'react';
import { Slot, useSegments, useRouter } from 'expo-router';
import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { QueryProvider } from '@/providers/query-provider';
import { CartProvider } from '@/features/cart/cart-context';
import { ToastProvider } from '@/features/toast/toast-context';
import { authClient } from '@/lib/auth-client';
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
  const { data: session, isPending } = authClient.useSession();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isPending) return;

    const inAuthGroup = (segments[0] as string) === 'login';

    if (!session && !inAuthGroup) {
      router.replace('/login' as any);
    } else if (session && inAuthGroup) {
      router.replace('/' as any);
    }
  }, [session, isPending, segments]);

  useEffect(() => {
    if (!isPending) {
      SplashScreen.hideAsync();
    }
  }, [isPending]);

  if (isPending) {
    return <AnimatedSplashOverlay />;
  }

  return <Slot />;
}
