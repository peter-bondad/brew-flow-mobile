import { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Pressable, Animated, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useCart } from './cart-context';
import { useCreateOrder } from '@/features/orders/api';
import { useToast } from '@/features/toast/toast-context';
import { Colors, Spacing } from '@/constants/theme';

const PAYMENT_METHODS = ['Cash', 'GCash', 'Maya'] as const;
type PaymentMethod = typeof PAYMENT_METHODS[number];

export function CartScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { items, removeItem, updateQuantity, total, clearCart } = useCart();
  const { showToast } = useToast();
  const createOrder = useCreateOrder();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleClear = () => {
    clearCart();
    showToast('Order cleared', 'info');
  };

  const handlePlaceOrder = async () => {
    if (items.length === 0 || submitting) return;

    try {
      setSubmitting(true);
      const result = await createOrder.mutateAsync({
        items: items.map(item => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
        })),
        paymentMethod,
        note: note.trim() || undefined,
      });

      clearCart();
      setNote('');
      showToast('Order placed successfully', 'success');

      router.push({
        pathname: '/order-confirmation',
        params: {
          orderId: result.data.id,
          total: String(result.data.total),
        },
      });
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to place order', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const renderItem = ({ item }: { item: ReturnType<typeof useCart>['items'][0] }) => (
    <View style={[styles.itemCard, { backgroundColor: Colors.light.card, borderColor: Colors.light.border }]}>
      <View style={styles.itemHeader}>
        <View style={[styles.itemIcon, { backgroundColor: Colors.light.secondary }]}>
          <Text style={[styles.itemIconText, { color: Colors.light.primary }]}>
            {item.productName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.itemInfo}>
          <ThemedText type="smallBold" numberOfLines={1}>
            {item.productName}
          </ThemedText>
          <ThemedText type="small" style={{ color: Colors.light.textSecondary }}>
            {item.variantName}
          </ThemedText>
        </View>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => removeItem(item.variantId)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={[styles.removeIcon, { color: Colors.light.destructive }]}>✕</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.itemFooter}>
        <View style={styles.quantityRow}>
          <Pressable
            style={({ pressed }) => [
              styles.qtyButton,
              { borderColor: Colors.light.border, opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={() => updateQuantity(item.variantId, item.quantity - 1)}>
            <ThemedText type="smallBold">−</ThemedText>
          </Pressable>
          <ThemedText type="default" style={styles.qtyValue}>
            {item.quantity}
          </ThemedText>
          <Pressable
            style={({ pressed }) => [
              styles.qtyButton,
              { borderColor: Colors.light.border, opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={() => updateQuantity(item.variantId, item.quantity + 1)}>
            <ThemedText type="smallBold">+</ThemedText>
          </Pressable>
        </View>
        <ThemedText type="smallBold" style={[styles.lineTotal, { color: Colors.light.primary }]}>
          ₱{item.lineTotal.toFixed(2)}
        </ThemedText>
      </View>
    </View>
  );

  return (
    <ThemedView style={[styles.container, { paddingTop: Math.max(insets.top, Spacing.three) }]}>
      {items.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={[styles.emptyIcon, { backgroundColor: Colors.light.backgroundElement }]}>
            <Text style={styles.emptyEmoji}>📋</Text>
          </View>
          <ThemedText type="smallBold" style={styles.emptyTitle}>
            No active order
          </ThemedText>
          <ThemedText type="small" style={[styles.emptySubtitle, { color: Colors.light.textSecondary }]}>
            Start a new order from the catalog.
          </ThemedText>
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={item => item.variantId}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            ListFooterComponent={<View style={{ height: Spacing.four }} />}
          />
          <View style={[styles.footer, { backgroundColor: Colors.light.background, borderTopColor: Colors.light.border }]}>
            <View style={[styles.summaryCard, { backgroundColor: Colors.light.card, borderColor: Colors.light.border }]}>
              <View style={styles.summaryRow}>
                <ThemedText type="small" style={{ color: Colors.light.textSecondary }}>
                  Order total ({items.reduce((s, i) => s + i.quantity, 0)} items)
                </ThemedText>
                <ThemedText type="smallBold">₱{total.toFixed(2)}</ThemedText>
              </View>
              <View style={[styles.summaryDivider, { backgroundColor: Colors.light.border }]} />

              <View style={styles.paymentSection}>
                <ThemedText type="smallBold" style={styles.paymentLabel}>
                  Payment Method
                </ThemedText>
                <View style={styles.paymentRow}>
                  {PAYMENT_METHODS.map(method => (
                    <Pressable
                      key={method}
                      style={[
                        styles.paymentChip,
                        paymentMethod === method
                          ? { backgroundColor: Colors.light.primary }
                          : { backgroundColor: Colors.light.card, borderColor: Colors.light.border },
                      ]}
                      onPress={() => setPaymentMethod(method)}>
                      <ThemedText
                        type="small"
                        style={{
                          color: paymentMethod === method ? Colors.light.primaryForeground : Colors.light.text,
                          fontWeight: paymentMethod === method ? '700' : '500',
                        }}>
                        {method}
                      </ThemedText>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={styles.noteSection}>
                <ThemedText type="smallBold" style={styles.paymentLabel}>
                  Note (optional)
                </ThemedText>
                <TextInput
                  style={[styles.noteInput, { backgroundColor: Colors.light.card, borderColor: Colors.light.border }]}
                  placeholder="Add a note..."
                  placeholderTextColor={Colors.light.textSecondary}
                  value={note}
                  onChangeText={setNote}
                  maxLength={500}
                />
              </View>

              <View style={styles.summaryRow}>
                <ThemedText type="subtitle">Total</ThemedText>
                <ThemedText type="subtitle" style={{ color: Colors.light.primary }}>
                  ₱{total.toFixed(2)}
                </ThemedText>
              </View>
            </View>
            <View style={styles.footerActions}>
              <Pressable
                style={[styles.secondaryButton, { borderColor: Colors.light.border }]}
                onPress={handleClear}>
                <ThemedText type="smallBold">Clear Order</ThemedText>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.primaryButton,
                  { backgroundColor: Colors.light.primary, opacity: pressed || submitting ? 0.85 : 1 },
                ]}
                onPress={handlePlaceOrder}
                disabled={submitting}>
                <Text style={[styles.primaryButtonText, { color: Colors.light.primaryForeground }]}>
                  {submitting ? 'Placing...' : 'Place Order'}
                </Text>
              </Pressable>
            </View>
          </View>
        </>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.six,
    gap: Spacing.three,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  emptyEmoji: {
    fontSize: 40,
  },
  emptyTitle: {
    fontSize: 18,
  },
  emptySubtitle: {
    textAlign: 'center',
  },
  listContent: {
    padding: Spacing.three,
    gap: Spacing.three,
  },
  itemCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: Spacing.three,
    gap: Spacing.three,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  itemIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemIconText: {
    fontSize: 18,
    fontWeight: '700',
  },
  itemInfo: {
    flex: 1,
  },
  removeButton: {
    padding: Spacing.one,
  },
  removeIcon: {
    fontSize: 18,
    fontWeight: '700',
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  qtyButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyValue: {
    minWidth: 28,
    textAlign: 'center',
  },
  lineTotal: {
    fontSize: 15,
    fontWeight: '700',
  },
  footer: {
    padding: Spacing.four,
    borderTopWidth: 1,
    gap: Spacing.three,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryDivider: {
    height: 1,
    marginVertical: Spacing.two,
  },
  paymentSection: {
    gap: Spacing.two,
  },
  paymentLabel: {
    marginBottom: Spacing.one,
  },
  paymentRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  paymentChip: {
    flex: 1,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  noteSection: {
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  noteInput: {
    padding: Spacing.three,
    borderRadius: 10,
    borderWidth: 1,
  },
  footerActions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  secondaryButton: {
    flex: 1,
    padding: Spacing.three,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
  },
  primaryButton: {
    flex: 2,
    padding: Spacing.three,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#6f3e1d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
