import { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing } from '@/constants/theme';

import { useActiveOrders } from './api';
import { OrderListItem } from './types';

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending: { bg: '#fef3c7', text: '#92400e' },
  preparing: { bg: '#dbeafe', text: '#1e40af' },
  ready: { bg: '#d1fae5', text: '#065f46' },
};

const STATUS_ACTIONS: Record<string, string[]> = {
  pending: ['Start'],
  preparing: ['Ready'],
  ready: ['Complete'],
};

export function ActiveOrdersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data, isLoading, error, refetch } = useActiveOrders();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const orders = data?.data ?? [];

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  }, [refetch]);

  const handleStatusPress = useCallback((orderId: string, action: string) => {
    router.push(`/order/${orderId}`);
  }, [router]);

  const renderItem = ({ item }: { item: OrderListItem }) => {
    const statusColor = STATUS_COLORS[item.status] ?? STATUS_COLORS.pending;
    const actions = STATUS_ACTIONS[item.status] ?? [];
    const lowStockWarnings = item.lowStockWarnings ?? [];

    const handleWarningPress = () => {
      if (lowStockWarnings.length === 0) return;
      const lines = lowStockWarnings.map(
        (warning) =>
          `• ${warning.ingredientName}: ${warning.currentStock} left (min ${warning.minimumStockLevel})`,
      );
      Alert.alert("Low Stock Warning", lines.join("\n"), [
        { text: "Got it", style: "default" },
      ]);
    };

    return (
      <Pressable
        style={({ pressed }) => [
          styles.orderCard,
          {
            backgroundColor: Colors.light.card,
            borderColor: Colors.light.border,
          },
          pressed && { opacity: 0.85 },
        ]}>
        <View style={styles.orderHeader}>
          <View>
            <ThemedText type="smallBold">Order #{item.id.slice(-6)}</ThemedText>
            <ThemedText
              type="small"
              style={{ color: Colors.light.textSecondary }}
            >
              {new Date(item.createdAt).toLocaleDateString('en-PH', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </ThemedText>
          </View>

          <View
            style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}
          >
            <ThemedText type="smallBold" style={{ color: statusColor.text }}>
              {item.status.toUpperCase()}
            </ThemedText>
          </View>
        </View>

        {lowStockWarnings.length > 0 && (
          <Pressable
            style={({ pressed }) => [
              styles.warningRow,
              { backgroundColor: '#fef2f2', borderColor: '#fecaca' },
              pressed && { opacity: 0.85 },
            ]}
            onPress={handleWarningPress}>
            <Text style={styles.warningIcon}>⚠️</Text>
            <View style={styles.warningTextWrap}>
              <ThemedText type="smallBold" style={{ color: '#b91c1c' }}>
                Low stock warning
              </ThemedText>
              <ThemedText
                type="small"
                style={{ color: '#991b1b' }}
                numberOfLines={1}
              >
                {lowStockWarnings
                  .map((w) => `${w.ingredientName} (${w.currentStock} left)`)
                  .join(', ')}
              </ThemedText>
            </View>
            <Text style={[styles.warningChevron, { color: '#991b1b' }]}>›</Text>
          </Pressable>
        )}

        <View
          style={[styles.divider, { backgroundColor: Colors.light.border }]}
        />

        <View style={styles.orderBody}>
          <View style={styles.orderMeta}>
            <View style={styles.metaItem}>
              <Text
                style={[
                  styles.metaLabel,
                  { color: Colors.light.textSecondary },
                ]}
              >
                Items
              </Text>
              <ThemedText type="smallBold">{item.itemCount}</ThemedText>
            </View>

            <View style={styles.metaItem}>
              <Text
                style={[
                  styles.metaLabel,
                  { color: Colors.light.textSecondary },
                ]}
              >
                Total
              </Text>
              <ThemedText type="smallBold" style={{ color: Colors.light.primary }}>
                ₱{item.total.toFixed(2)}
              </ThemedText>
            </View>
          </View>
        </View>

        {actions.length > 0 && (
          <View style={styles.actionsRow}>
            {actions.map((action) => (
              <Pressable
                key={action}
                style={[
                  styles.actionButton,
                  { backgroundColor: Colors.light.primary },
                ]}
                onPress={() => handleStatusPress(item.id, action)}>
                <Text
                  style={[
                    styles.actionButtonText,
                    { color: Colors.light.primaryForeground },
                  ]}>
                  {action}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </Pressable>
    );
  };

  if (isLoading && !data) {
    return (
      <ThemedView style={styles.center}>
        <ThemedText>Loading active orders...</ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.center}>
        <ThemedText style={{ color: Colors.light.destructive }}>
          Failed to load active orders.
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { paddingTop: Math.max(insets.top, Spacing.three) }]}>
      <FlatList
        style={{ flex: 1 }}
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshing={isRefreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View
              style={[
                styles.emptyIcon,
                {
                  backgroundColor: Colors.light.backgroundElement,
                },
              ]}
            >
              <Text style={styles.emptyEmoji}>☕</Text>
            </View>

            <ThemedText type="smallBold" style={styles.emptyTitle}>
              No active orders
            </ThemedText>

            <ThemedText
              type="small"
              style={[
                styles.emptySubtitle,
                {
                  color: Colors.light.textSecondary,
                },
              ]}
            >
              New orders will appear here for fulfillment.
            </ThemedText>
          </View>
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  listContent: {
    padding: Spacing.three,
    gap: Spacing.three,
  },

  orderCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: Spacing.four,
    gap: Spacing.three,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },

  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  statusBadge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: 8,
  },

  divider: {
    height: 1,
  },

  orderBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  orderMeta: {
    flexDirection: 'row',
    gap: Spacing.four,
  },

  metaItem: {
    gap: 2,
  },

  metaLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },

  actionButton: {
    flex: 1,
    paddingVertical: Spacing.two,
    borderRadius: 12,
    alignItems: 'center',
  },

  actionButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
  warningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: 12,
    borderWidth: 1,
  },
  warningIcon: {
    fontSize: 18,
  },
  warningTextWrap: {
    flex: 1,
  },
  warningChevron: {
    fontSize: 20,
    fontWeight: '700',
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.six,
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
});
