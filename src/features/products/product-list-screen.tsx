import { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Pressable, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useProducts } from './api';
import { ProductListItem } from './types';
import { Colors, Spacing } from '@/constants/theme';

export function ProductListScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'createdAt' | 'updatedAt'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [limit] = useState(20);
  const [offset, setOffset] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const numColumns = width >= 768 ? 3 : width >= 480 ? 3 : 2;
  const gap = Spacing.three;
  const horizontalPadding = Spacing.three;
  const availableWidth = width - horizontalPadding * 2;
  const itemWidth = (availableWidth - gap * (numColumns - 1)) / numColumns;

  const { data, isLoading, error, refetch } = useProducts({
    search: search || undefined,
    category: selectedCategory ?? undefined,
    sortBy,
    sortOrder,
    limit,
    offset,
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setOffset(0);
    await refetch();
    setIsRefreshing(false);
  };

  const categories = useMemo(() => {
    if (!data?.data) return [];
    const cats = new Set(data.data.map(p => p.category));
    return Array.from(cats).sort();
  }, [data?.data]);

  const renderItem = ({ item }: { item: ProductListItem }) => (
    <Pressable
      style={[styles.gridItem, { width: itemWidth }]}
      onPress={() => router.push(`/product/${item.id}` as any)}
      android_ripple={{ color: Colors.light.backgroundSelected }}>
      <View style={[styles.card, { backgroundColor: Colors.light.card, borderColor: Colors.light.border }]}>
        <View style={[styles.imagePlaceholder, { backgroundColor: Colors.light.secondary }]}>
          <Text style={[styles.imageText, { color: Colors.light.primary }]}>
            {item.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.cardBody}>
          <ThemedText type="smallBold" numberOfLines={1} style={styles.cardTitle}>
            {item.name}
          </ThemedText>
          <ThemedText type="small" numberOfLines={1} style={[styles.cardCategory, { color: Colors.light.textSecondary }]}>
            {item.category}
          </ThemedText>
          <View style={styles.cardFooter}>
            {item.primaryVariant ? (
              <ThemedText type="smallBold" style={[styles.cardPrice, { color: Colors.light.primary }]}>
                ₱{item.primaryVariant.price.toFixed(2)}
              </ThemedText>
            ) : null}
            {!item.isAvailable && (
              <View style={[styles.unavailableBadge, { backgroundColor: Colors.light.destructive + '18' }]}>
                <Text style={[styles.unavailableText, { color: Colors.light.destructive }]}>Unavailable</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </Pressable>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.topBar, { paddingTop: Math.max(insets.top, Spacing.three) }]}>
        <View style={[styles.searchBox, { backgroundColor: Colors.light.card, borderColor: Colors.light.border }]}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={[styles.searchInput, { color: Colors.light.text }]}
            placeholder="Search menu..."
            placeholderTextColor={Colors.light.textSecondary}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 ? (
            <Pressable onPress={() => setSearch('')}>
              <Text style={[styles.clearIcon, { color: Colors.light.textSecondary }]}>✕</Text>
            </Pressable>
          ) : null}
        </View>

        <ScrollRow categories={categories} selected={selectedCategory} onSelect={setSelectedCategory} />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          {Array.from({ length: 4 }).map((_, i) => (
            <View key={i} style={[styles.skeletonCard, { backgroundColor: Colors.light.backgroundElement }]} />
          ))}
        </View>
      ) : error ? (
        <View style={styles.center}>
          <ThemedText style={{ color: Colors.light.destructive }}>Failed to load products.</ThemedText>
        </View>
      ) : (
        <FlatList
          data={data?.data ?? []}
          keyExtractor={item => item.id}
          numColumns={numColumns}
          renderItem={renderItem}
          columnWrapperStyle={[styles.row, { gap }]}
          contentContainerStyle={styles.listContent}
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={
            <View style={styles.center}>
              <ThemedText style={{ color: Colors.light.textSecondary }}>No products found.</ThemedText>
            </View>
          }
          onEndReached={() => {
            if (data && data.data.length >= data.stats.total) return;
            setOffset(prev => prev + limit);
          }}
        />
      )}
    </ThemedView>
  );
}

function ScrollRow({
  categories,
  selected,
  onSelect,
}: {
  categories: string[];
  selected: string | null;
  onSelect: (category: string | null) => void;
}) {
  if (categories.length === 0) return null;

  return (
    <View style={styles.scrollRow}>
      <FlatList
        horizontal
        data={categories}
        keyExtractor={category => category}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item: category }) => {
          const isActive = selected === category;
          return (
            <Pressable
              onPress={() => onSelect(isActive ? null : category)}
              style={[
                styles.chip,
                isActive ? { backgroundColor: Colors.light.primary } : { backgroundColor: Colors.light.card, borderColor: Colors.light.border },
              ]}>
              <ThemedText
                type="small"
                style={{
                  color: isActive ? Colors.light.primaryForeground : Colors.light.text,
                  fontWeight: isActive ? '700' : '500',
                }}>
                {category}
              </ThemedText>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    paddingHorizontal: Spacing.three,
    gap: Spacing.two,
    paddingBottom: Spacing.two,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    gap: Spacing.two,
  },
  searchIcon: {
    fontSize: 16,
    color: Colors.light.textSecondary,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  clearIcon: {
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: Spacing.one,
  },
  scrollRow: {
    marginTop: Spacing.two,
  },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: Spacing.two,
  },
  listContent: {
    paddingHorizontal: Spacing.three,
    paddingBottom: 120,
  },
  row: {
    justifyContent: 'space-between',
  },
  gridItem: {
    marginBottom: Spacing.three,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  imagePlaceholder: {
    width: '100%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageText: {
    fontSize: 36,
    fontWeight: '700',
    opacity: 0.35,
  },
  cardBody: {
    padding: Spacing.three,
    gap: Spacing.one,
  },
  cardTitle: {
    fontSize: 15,
  },
  cardCategory: {
    fontSize: 13,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.one,
  },
  cardPrice: {
    fontSize: 14,
    fontWeight: '700',
  },
  unavailableBadge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
    borderRadius: 6,
  },
  unavailableText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  loadingContainer: {
    flex: 1,
    paddingHorizontal: Spacing.three,
    gap: Spacing.three,
    paddingTop: Spacing.three,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skeletonCard: {
    aspectRatio: 1,
    borderRadius: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
