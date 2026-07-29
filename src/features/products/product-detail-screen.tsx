import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Animated, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useProduct } from './api';
import { ProductVariant } from './types';
import { useCart } from '@/features/cart/cart-context';
import { useToast } from '@/features/toast/toast-context';
import { Colors, Spacing } from '@/constants/theme';

interface ProductDetailScreenProps {
  productId: string;
}

export function ProductDetailScreen({ productId }: ProductDetailScreenProps) {
  const { data, isLoading, error } = useProduct(productId);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const { showToast } = useToast();
  const addedAnim = useState(new Animated.Value(0))[0];
  const insets = useSafeAreaInsets();

  const product = data?.data;

  const handleAddToCart = () => {
    if (!selectedVariant || !product) {
      Alert.alert('Error', 'Please select a variant.');
      return;
    }

    addItem({
      productId: product.id,
      variantId: selectedVariant.id,
      productName: product.name,
      variantName: selectedVariant.name,
      unitPrice: selectedVariant.price,
      quantity,
    });

    showToast(`Added ${quantity}x ${product.name} to order`, 'success');

    Animated.sequence([
      Animated.timing(addedAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(addedAnim, {
        toValue: 0,
        duration: 400,
        delay: 800,
        useNativeDriver: true,
      }),
    ]).start();
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.center}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  if (error || !product) {
    return (
      <ThemedView style={styles.center}>
        <ThemedText style={{ color: Colors.light.destructive }}>
          Product not found.
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { paddingTop: Math.max(insets.top, Spacing.three) }]}>
      <View style={styles.scrollContent}>
        <View style={[styles.hero, { backgroundColor: Colors.light.secondary }]}>
          <View style={styles.heroInitialWrap}>
            <Text style={[styles.heroInitial, { color: Colors.light.primary }]}>
              {product.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.heroMeta}>
            <ThemedText type="title" style={styles.heroTitle}>
              {product.name}
            </ThemedText>
            <View style={[styles.categoryPill, { backgroundColor: Colors.light.primary + '18' }]}>
              <Text style={[styles.categoryPillText, { color: Colors.light.primary }]}>
                {product.category}
              </Text>
            </View>
            {product.description ? (
              <ThemedText type="small" style={[styles.heroDesc, { color: Colors.light.textSecondary }]}>
                {product.description}
              </ThemedText>
            ) : null}
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="smallBold" style={styles.sectionTitle}>
            Select Variant
          </ThemedText>
          <View style={styles.variantList}>
            {product.variants.map(variant => {
              const isActive = selectedVariant?.id === variant.id;
              return (
                <Pressable
                  key={variant.id}
                  style={[
                    styles.variantCard,
                    isActive ? { backgroundColor: Colors.light.primary, borderColor: Colors.light.primary } : { backgroundColor: Colors.light.card, borderColor: Colors.light.border },
                    !variant.isAvailable && styles.variantDisabled,
                  ]}
                  onPress={() => variant.isAvailable && setSelectedVariant(variant)}
                  disabled={!variant.isAvailable}>
                  <View style={styles.variantContent}>
                    <ThemedText
                      type="smallBold"
                      style={{
                        color: isActive ? Colors.light.primaryForeground : Colors.light.text,
                      }}>
                      {variant.name}
                    </ThemedText>
                    <ThemedText
                      type="small"
                      style={{
                        color: isActive ? Colors.light.primaryForeground : Colors.light.textSecondary,
                      }}>
                      ₱{variant.price.toFixed(2)}
                    </ThemedText>
                  </View>
                  {isActive && (
                    <View style={[styles.checkBadge, { backgroundColor: Colors.light.primaryForeground + '25' }]}>
                      <Text style={[styles.checkBadgeText, { color: isActive ? Colors.light.primaryForeground : Colors.light.primary }]}>✓</Text>
                    </View>
                  )}
                  {!variant.isAvailable && (
                    <Text style={[styles.unavailableLabel, { color: Colors.light.destructive }]}>
                      Unavailable
                    </Text>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="smallBold" style={styles.sectionTitle}>
            Quantity
          </ThemedText>
          <View style={styles.quantityRow}>
            <Pressable
              style={[styles.qtyButton, { borderColor: Colors.light.border }]}
              onPress={() => setQuantity(q => Math.max(1, q - 1))}>
              <ThemedText type="smallBold">−</ThemedText>
            </Pressable>
            <ThemedText type="default" style={styles.qtyValue}>
              {quantity}
            </ThemedText>
            <Pressable
              style={[styles.qtyButton, { borderColor: Colors.light.border }]}
              onPress={() => setQuantity(q => q + 1)}>
              <ThemedText type="smallBold">+</ThemedText>
            </Pressable>
          </View>
        </View>

        <View style={{ height: Spacing.six }} />
      </View>

      <View style={[styles.footer, { backgroundColor: Colors.light.background, borderTopColor: Colors.light.border }]}>
        <View style={styles.footerRow}>
          <View>
            <ThemedText type="small" style={{ color: Colors.light.textSecondary }}>
              Total
            </ThemedText>
            {selectedVariant ? (
              <ThemedText type="subtitle" style={{ color: Colors.light.primary }}>
                ₱{(selectedVariant.price * quantity).toFixed(2)}
              </ThemedText>
            ) : (
              <ThemedText type="subtitle" style={{ color: Colors.light.textSecondary }}>
                — —
              </ThemedText>
            )}
          </View>
          <Pressable
            onPress={handleAddToCart}
            disabled={!selectedVariant}
            style={({ pressed }) => [
              styles.addButton,
              {
                backgroundColor: selectedVariant ? Colors.light.primary : Colors.light.border,
                opacity: pressed ? 0.85 : 1,
              },
            ]}>
            <Animated.View style={{ transform: [{ scale: addedAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.04] }) }] }}>
              <Text style={[styles.addButtonText, { color: selectedVariant ? Colors.light.primaryForeground : Colors.light.textSecondary }]}>
                {selectedVariant ? 'Add to Order' : 'Select Variant'}
              </Text>
            </Animated.View>
          </Pressable>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flex: 1,
  },
  hero: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  heroInitialWrap: {
    alignSelf: 'center',
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.light.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.one,
  },
  heroInitial: {
    fontSize: 40,
    fontWeight: '700',
  },
  heroMeta: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  heroTitle: {
    textAlign: 'center',
  },
  categoryPill: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: 20,
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroDesc: {
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    padding: Spacing.four,
    gap: Spacing.two,
  },
  sectionTitle: {
    marginBottom: Spacing.one,
  },
  variantList: {
    gap: Spacing.two,
  },
  variantCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: 14,
    borderWidth: 1,
  },
  variantDisabled: {
    opacity: 0.5,
  },
  variantContent: {
    flex: 1,
    gap: 2,
  },
  checkBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkBadgeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  unavailableLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  qtyButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyValue: {
    minWidth: 32,
    textAlign: 'center',
  },
  footer: {
    padding: Spacing.four,
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addButton: {
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.three,
    borderRadius: 14,
    shadowColor: '#6f3e1d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
