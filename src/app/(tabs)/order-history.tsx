import { Stack } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { OrderHistoryScreen } from '@/features/orders/order-history-screen';
import { HeaderButton } from '@/components/header-button';

export default function OrderHistoryScreenRoute() {
  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          title: 'Order History',
          headerRight: () => <HeaderButton />,
        }}
      />
      <OrderHistoryScreen />
    </ThemedView>
  );
}
