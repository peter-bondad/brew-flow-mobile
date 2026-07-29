import { useState } from "react";
import { View, Text, FlatList, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors, Spacing } from "@/constants/theme";

import { useMyOrders } from "./api";
import { OrderListItem } from "./types";

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending: { bg: "#fef3c7", text: "#92400e" },
  paid: { bg: "#dbeafe", text: "#1e40af" },
  preparing: { bg: "#dbeafe", text: "#1e40af" },
  ready: { bg: "#d1fae5", text: "#065f46" },
  completed: { bg: "#d1fae5", text: "#065f46" },
  cancelled: { bg: "#fee2e2", text: "#991b1b" },
};

export function OrderListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data, isLoading, error, refetch } = useMyOrders();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const orders = data?.data ?? [];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const renderItem = ({ item }: { item: OrderListItem }) => {
    const statusColor = STATUS_COLORS[item.status] ?? STATUS_COLORS.pending;

    return (
      <Pressable
        style={({ pressed }) => [
          styles.orderCard,
          {
            backgroundColor: Colors.light.card,
            borderColor: Colors.light.border,
          },
          pressed && { opacity: 0.85 },
        ]}
        onPress={() => router.push(`/order/${item.id}` as never)}
      >
        <View style={styles.orderHeader}>
          <View>
            <ThemedText type="smallBold">Order #{item.id.slice(-6)}</ThemedText>

            <ThemedText
              type="small"
              style={{ color: Colors.light.textSecondary }}
            >
              {new Date(item.createdAt).toLocaleDateString("en-PH", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
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
                Payment
              </Text>

              <ThemedText type="smallBold">{item.paymentMethod}</ThemedText>
            </View>

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
          </View>

          <ThemedText type="subtitle" style={{ color: Colors.light.primary }}>
            ₱{item.total.toFixed(2)}
          </ThemedText>
        </View>
      </Pressable>
    );
  };

  if (isLoading && !data) {
    return (
      <ThemedView style={styles.center}>
        <ThemedText>Loading orders...</ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.center}>
        <ThemedText style={{ color: Colors.light.destructive }}>
          Failed to load orders.
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
              <Text style={styles.emptyEmoji}>📋</Text>
            </View>

            <ThemedText type="smallBold" style={styles.emptyTitle}>
              No orders yet
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
              Orders will appear here after checkout.
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

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },

  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  orderMeta: {
    flexDirection: "row",
    gap: Spacing.four,
  },

  metaItem: {
    gap: 2,
  },

  metaLabel: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.six,
  },

  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.six,
    gap: Spacing.three,
  },

  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.two,
  },

  emptyEmoji: {
    fontSize: 40,
  },

  emptyTitle: {
    fontSize: 18,
  },

  emptySubtitle: {
    textAlign: "center",
  },
});
