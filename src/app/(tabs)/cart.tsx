import { Stack } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { CartScreen } from '@/features/cart/cart-screen';

export default function CartTabScreen() {
  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen options={{ title: 'Current Order' }} />
      <CartScreen />
    </ThemedView>
  );
}
