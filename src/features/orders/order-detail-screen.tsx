import { View, Text, FlatList, StyleSheet, Alert, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useOrder, useUpdateOrderStatus, useCancelOrder } from './api';
import { OrderItem, OrderStatus } from './types';
import { Colors, Spacing } from '@/constants/theme';

const NEXT_STATUS: Record<string, OrderStatus[]> = {
  pending: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending: { bg: '#fef3c7', text: '#92400e' },
  preparing: { bg: '#dbeafe', text: '#1e40af' },
  ready: { bg: '#d1fae5', text: '#065f46' },
  completed: { bg: '#d1fae5', text: '#065f46' },
  cancelled: { bg: '#fee2e2', text: '#991b1b' },
};

interface OrderDetailScreenProps {
  orderId: string;
}

export function OrderDetailScreen({ orderId }: OrderDetailScreenProps) {
  const { data, isLoading, error } = useOrder(orderId);
  const updateStatusMutation = useUpdateOrderStatus();
  const cancelMutation = useCancelOrder();
  const insets = useSafeAreaInsets();

  if (isLoading) {
    return (
      <ThemedView style={styles.center}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  if (error || !data?.data) {
    return (
      <ThemedView style={styles.center}>
        <ThemedText style={{ color: Colors.light.destructive }}>
          Order not found.
        </ThemedText>
      </ThemedView>
    );
  }

  const order = data.data;
  const availableTransitions = NEXT_STATUS[order.status] ?? [];
  const statusColor = STATUS_COLORS[order.status] ?? STATUS_COLORS.pending;

  const handleStatusUpdate = (newStatus: OrderStatus) => {
    Alert.alert(
      'Update Status',
      `Change order status to "${newStatus}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Update',
          onPress: async () => {
            try {
              await updateStatusMutation.mutateAsync({
                id: order.id,
                status: newStatus,
              });
            } catch (err) {
              Alert.alert('Error', err instanceof Error ? err.message : 'Failed to update status.');
            }
          },
        },
      ]
    );
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order? Inventory will be restored.',
      [
        { text: 'Keep Order', style: 'cancel' },
        {
          text: 'Cancel Order',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelMutation.mutateAsync(order.id);
            } catch (err) {
              Alert.alert('Error', err instanceof Error ? err.message : 'Failed to cancel order.');
            }
          },
        },
      ]
    );
  };

  const canCancel = order.status === 'pending';

  const renderItem = ({ item }: { item: OrderItem }) => (
    <View style={[styles.itemCard, { backgroundColor: Colors.light.card, borderColor: Colors.light.border }]}>
      <View style={styles.itemHeader}>
        <View style={styles.itemIconWrap}>
          <Text style={[styles.itemIcon, { color: Colors.light.primary }]}>
            {item.productName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.itemInfo}>
          <ThemedText type="smallBold" numberOfLines={1}>
            {item.productName}
          </ThemedText>
          <ThemedText type="small" style={{ color: Colors.light.textSecondary }}>
            {item.variantName} × {item.quantity}
          </ThemedText>
        </View>
        <ThemedText type="smallBold" style={{ color: Colors.light.primary }}>
          ₱{item.lineTotal.toFixed(2)}
        </ThemedText>
      </View>
    </View>
  );

  return (
    <ThemedView style={[styles.container, { paddingTop: Math.max(insets.top, Spacing.three) }]}>
      <FlatList
        data={order.items}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.headerSection}>
            <View style={styles.headerRow}>
              <View>
                <ThemedText type="subtitle">Order #{order.id.slice(-6)}</ThemedText>
                <ThemedText type="small" style={{ color: Colors.light.textSecondary }}>
                  {order.paymentMethod} • {new Date(order.createdAt).toLocaleString()}
                </ThemedText>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
                <ThemedText type="smallBold" style={{ color: statusColor.text }}>
                  {order.status.toUpperCase()}
                </ThemedText>
              </View>
            </View>

            <View style={[styles.summaryCard, { backgroundColor: Colors.light.card, borderColor: Colors.light.border }]}>
              <View style={styles.summaryRow}>
                <ThemedText type="small" style={{ color: Colors.light.textSecondary }}>
                  Total ({order.items.length} items)
                </ThemedText>
                <ThemedText type="subtitle" style={{ color: Colors.light.primary }}>
                  ₱{order.total.toFixed(2)}
                </ThemedText>
              </View>
            </View>
          </View>
        }
        ListFooterComponent={
          <>
            {canCancel && (
              <View style={styles.footerSection}>
                <Pressable
                  style={({ pressed }) => [
                    styles.cancelButton,
                    { backgroundColor: Colors.light.destructive, opacity: pressed || cancelMutation.isPending ? 0.85 : 1 },
                  ]}
                  onPress={handleCancel}
                  disabled={cancelMutation.isPending}>
                  <Text style={[styles.cancelButtonText, { color: Colors.light.primaryForeground }]}>
                    {cancelMutation.isPending ? 'Cancelling...' : 'Cancel Order'}
                  </Text>
                </Pressable>
              </View>
            )}
            {availableTransitions.length > 0 || canCancel ? (
              <View style={[styles.footerSection, canCancel && availableTransitions.length > 0 && { marginTop: Spacing.two }]}>
                <ThemedText type="smallBold" style={styles.footerTitle}>
                  Update Status
                </ThemedText>
                <View style={styles.statusActions}>
                  {availableTransitions.map(status => (
                    <Pressable
                      key={status}
                      style={({ pressed }) => [
                        styles.statusButton,
                        { backgroundColor: Colors.light.primary, opacity: pressed || updateStatusMutation.isPending ? 0.85 : 1 },
                      ]}
                      onPress={() => handleStatusUpdate(status)}
                      disabled={updateStatusMutation.isPending}>
                      <Text style={[styles.statusButtonText, { color: Colors.light.primaryForeground }]}>
                        Mark as {status}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            ) : (
              <View style={{ height: Spacing.six }} />
            )}
          </>
        }
      />
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
  listContent: {
    padding: Spacing.three,
    gap: Spacing.three,
  },
  headerSection: {
    gap: Spacing.three,
    marginBottom: Spacing.one,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statusBadge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: 8,
  },
  summaryCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: Spacing.three,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  itemIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemIcon: {
    fontSize: 16,
    fontWeight: '700',
  },
  itemInfo: {
    flex: 1,
  },
  footerSection: {
    gap: Spacing.two,
  },
  footerTitle: {
    marginBottom: Spacing.one,
  },
  statusActions: {
    flexDirection: 'row',
    gap: Spacing.two,
    flexWrap: 'wrap',
  },
  cancelButton: {
    padding: Spacing.three,
    borderRadius: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  statusButton: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: 12,
    shadowColor: '#6f3e1d',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  statusButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
