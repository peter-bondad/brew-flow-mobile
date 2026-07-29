import { Stack, useLocalSearchParams } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { OrderDetailScreen } from '@/features/orders/order-detail-screen';

export default function OrderDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen options={{ title: 'Order' }} />
      <OrderDetailScreen orderId={id} />
    </ThemedView>
  );
}
