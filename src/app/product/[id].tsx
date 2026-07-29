import { Stack, useLocalSearchParams } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ProductDetailScreen } from '@/features/products/product-detail-screen';

export default function ProductDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen options={{ title: 'Product' }} />
      <ProductDetailScreen productId={id} />
    </ThemedView>
  );
}
