import { Stack, useLocalSearchParams } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { OrderConfirmationScreen } from '@/features/orders/order-confirmation-screen';

export default function OrderConfirmationRoute() {
  const { orderId, total } = useLocalSearchParams<{ orderId: string; total: string }>();

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen options={{ title: 'Order Confirmed', headerShown: false }} />
      <OrderConfirmationScreen
        orderId={orderId}
        total={Number(total)}
      />
    </ThemedView>
  );
}
