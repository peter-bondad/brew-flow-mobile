import { Stack } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { OrderListScreen } from '@/features/orders/order-list-screen';
import { HeaderButton } from '@/components/header-button';

export default function OrdersScreen() {
  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          title: 'Orders',
          headerRight: () => <HeaderButton />,
        }}
      />
      <OrderListScreen />
    </ThemedView>
  );
}
