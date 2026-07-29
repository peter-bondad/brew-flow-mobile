import { Stack } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ActiveOrdersScreen } from '@/features/orders/active-orders-screen';
import { HeaderButton } from '@/components/header-button';

export default function ActiveOrdersScreenRoute() {
  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          title: 'Active Orders',
          headerRight: () => <HeaderButton />,
        }}
      />
      <ActiveOrdersScreen />
    </ThemedView>
  );
}
