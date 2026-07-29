import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRouter } from 'expo-router';
import { Colors, Spacing } from '@/constants/theme';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface OrderConfirmationScreenProps {
  orderId: string;
  total: number;
}

export function OrderConfirmationScreen({ orderId, total }: OrderConfirmationScreenProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <ThemedView style={[styles.container, { paddingTop: Math.max(insets.top, Spacing.six), paddingBottom: Math.max(insets.bottom, Spacing.six) }]}>
      <Animated.View style={styles.content} entering={FadeInDown.duration(500).springify()}>
        <View style={[styles.iconCircle, { backgroundColor: Colors.light.success + '18' }]}>
          <Text style={[styles.iconText, { color: Colors.light.success }]}>✓</Text>
        </View>

        <ThemedText type="title" style={styles.title}>
          Order Confirmed
        </ThemedText>
        <ThemedText type="small" style={[styles.subtitle, { color: Colors.light.textSecondary }]}>
          Order #{orderId.slice(-6)}
        </ThemedText>

        <View style={[styles.card, { backgroundColor: Colors.light.card, borderColor: Colors.light.border }]}>
          <View style={styles.row}>
            <ThemedText type="small" style={{ color: Colors.light.textSecondary }}>
              Total
            </ThemedText>
            <ThemedText type="subtitle" style={{ color: Colors.light.primary }}>
              ₱{total.toFixed(2)}
            </ThemedText>
          </View>
          <View style={[styles.divider, { backgroundColor: Colors.light.border }]} />
          <View style={styles.row}>
            <ThemedText type="small" style={{ color: Colors.light.textSecondary }}>
              Status
            </ThemedText>
            <View style={[styles.statusBadge, { backgroundColor: Colors.light.success + '18' }]}>
              <Text style={[styles.statusText, { color: Colors.light.success }]}>PENDING</Text>
            </View>
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: Colors.light.primary, opacity: pressed ? 0.85 : 1 },
          ]}
          onPress={() => router.replace('/orders')}>
          <Text style={[styles.buttonText, { color: Colors.light.primaryForeground }]}>
            View Orders
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.secondaryButton,
            { opacity: pressed ? 0.7 : 1 },
          ]}
          onPress={() => router.replace('/')}>
          <ThemedText type="smallBold">Back to Catalog</ThemedText>
        </Pressable>
      </Animated.View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    gap: Spacing.three,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.one,
  },
  iconText: {
    fontSize: 36,
    fontWeight: '700',
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
  },
  card: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    padding: Spacing.four,
    gap: Spacing.three,
    marginVertical: Spacing.three,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  divider: {
    height: 1,
  },
  statusBadge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  button: {
    width: '100%',
    padding: Spacing.three,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#6f3e1d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryButton: {
    padding: Spacing.three,
  },
});
