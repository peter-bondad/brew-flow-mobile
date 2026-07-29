import { Stack } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ProductListScreen } from '@/features/products/product-list-screen';

export default function CatalogScreen() {
  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen options={{ title: 'Catalog' }} />
      <ProductListScreen />
    </ThemedView>
  );
}
