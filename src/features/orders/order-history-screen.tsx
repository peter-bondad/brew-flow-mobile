import { useState } from "react";
import { View, Text, FlatList, StyleSheet, Pressable, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors, Spacing } from "@/constants/theme";

import { useMyOrders } from "./api";
import { OrderListItem, OrderStatus } from "./types";

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending: { bg: "#fef3c7", text: "#92400e" },
  preparing: { bg: "#dbeafe", text: "#1e40af" },
  ready: { bg: "#d1fae5", text: "#065f46" },
  completed: { bg: "#d1fae5", text: "#065f46" },
  cancelled: { bg: "#fee2e2", text: "#991b1b" },
};

type OrderFilter = OrderStatus | "all";
type DateFilter = "today" | "week" | "month" | "all";

const STATUS_OPTIONS: { value: OrderFilter; label: string }[] = [
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "all", label: "All" },
];

const DATE_OPTIONS: { value: DateFilter; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "all", label: "All" },
];

function getDateRange(filter: DateFilter) {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);

  if (filter === "today") {
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
  } else if (filter === "week") {
    const day = start.getDay() || 7;
    start.setDate(start.getDate() - day + 1);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
  } else if (filter === "month") {
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
  }

  if (filter !== "all") {
    return {
      dateFrom: start.toISOString(),
      dateTo: end.toISOString(),
    };
  }

  return {};
}

export function OrderHistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [statusFilter, setStatusFilter] = useState<OrderFilter>("completed");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [search, setSearch] = useState("");
  const { data, isLoading, error, refetch } = useMyOrders(
    20,
    0,
    statusFilter === "all" ? undefined : statusFilter,
    search || undefined,
    ...(dateFilter === "all" ? [] : [getDateRange(dateFilter).dateFrom]),
    ...(dateFilter === "all" ? [] : [getDateRange(dateFilter).dateTo]),
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

  const orders = data?.data ?? [];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const renderStatusChip = (option: { value: OrderFilter; label: string }) => {
    const isActive = statusFilter === option.value;
    return (
      <Pressable
        key={option.value}
        style={[
          styles.filterChip,
          isActive
            ? { backgroundColor: Colors.light.primary }
            : { backgroundColor: Colors.light.card, borderColor: Colors.light.border },
        ]}
        onPress={() => setStatusFilter(option.value)}>
        <ThemedText
          type="small"
          style={{
            color: isActive ? Colors.light.primaryForeground : Colors.light.text,
            fontWeight: isActive ? "700" : "500",
          }}>
          {option.label}
        </ThemedText>
      </Pressable>
    );
  };

  const renderDateChip = (option: { value: DateFilter; label: string }) => {
    const isActive = dateFilter === option.value;
    return (
      <Pressable
        key={option.value}
        style={[
          styles.filterChip,
          isActive
            ? { backgroundColor: Colors.light.primary }
            : { backgroundColor: Colors.light.card, borderColor: Colors.light.border },
        ]}
        onPress={() => setDateFilter(option.value)}>
        <ThemedText
          type="small"
          style={{
            color: isActive ? Colors.light.primaryForeground : Colors.light.text,
            fontWeight: isActive ? "700" : "500",
          }}>
          {option.label}
        </ThemedText>
      </Pressable>
    );
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
        onPress={() => router.push(`/order/${item.id}` as never)}>
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
                year: "numeric",
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
        <ThemedText>Loading order history...</ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.center}>
        <ThemedText style={{ color: Colors.light.destructive }}>
          Failed to load order history.
        </ThemedText>
      </ThemedView>
    );
  }

  const emptyTitle =
    statusFilter === "completed"
      ? "No completed orders yet"
      : statusFilter === "cancelled"
        ? "No cancelled orders"
        : "No orders found";

  return (
    <ThemedView style={[styles.container, { paddingTop: Math.max(insets.top, Spacing.three) }]}>
      <View style={styles.searchRow}>
        <View
          style={[
            styles.searchBox,
            { backgroundColor: Colors.light.card, borderColor: Colors.light.border },
          ]}>
          <Text style={[styles.searchIcon, { color: Colors.light.textSecondary }]}>
            🔍
          </Text>
          <TextInput
            style={[styles.searchInput, { color: Colors.light.text }]}
            placeholder="Search orders..."
            placeholderTextColor={Colors.light.textSecondary}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <View style={styles.filterSection}>
        <ThemedText type="smallBold" style={styles.filterLabel}>
          Status
        </ThemedText>
        <View style={styles.filterRow}>
          {STATUS_OPTIONS.map(renderStatusChip)}
        </View>
      </View>

      <View style={styles.filterSection}>
        <ThemedText type="smallBold" style={styles.filterLabel}>
          Date Range
        </ThemedText>
        <View style={styles.filterRow}>
          {DATE_OPTIONS.map(renderDateChip)}
        </View>
      </View>

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
                { backgroundColor: Colors.light.backgroundElement },
              ]}
            >
              <Text style={styles.emptyEmoji}>📋</Text>
            </View>
            <ThemedText type="smallBold" style={styles.emptyTitle}>
              {emptyTitle}
            </ThemedText>
            <ThemedText
              type="small"
              style={[styles.emptySubtitle, { color: Colors.light.textSecondary }]}
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
  searchRow: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.two,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    gap: Spacing.two,
  },
  searchIcon: {
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  filterSection: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.two,
    gap: Spacing.one,
  },
  filterLabel: {
    marginBottom: Spacing.one,
  },
  filterRow: {
    flexDirection: "row",
    gap: Spacing.two,
    flexWrap: "wrap",
  },
  filterChip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 20,
    borderWidth: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.three,
    gap: Spacing.three,
    paddingBottom: 120,
  },
  orderCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: Spacing.four,
    gap: Spacing.three,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
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
