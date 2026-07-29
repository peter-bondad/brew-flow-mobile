import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Animated, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useLogin } from './api';
import { Colors, Spacing } from '@/constants/theme';

export function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const loginMutation = useLogin();
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(24))[0];
  const insets = useSafeAreaInsets();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    try {
      await loginMutation.mutateAsync({
        email: email.trim(),
        password,
      });
    } catch (error) {
      Alert.alert('Login Failed', error instanceof Error ? error.message : 'Invalid credentials.');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            paddingTop: Math.max(insets.top, Spacing.five),
            paddingBottom: Math.max(insets.bottom, Spacing.five),
          },
        ]}>
        <View style={styles.header}>
          <View style={[styles.logoCircle, { backgroundColor: Colors.light.primary }]}>
            <Text style={styles.logoText}>B</Text>
          </View>
          <ThemedText type="title" style={styles.title}>
            BrewFlow
          </ThemedText>
          <ThemedText type="small" style={styles.subtitle}>
            Staff POS
          </ThemedText>
          <ThemedText type="small" style={styles.tagline}>
            Order smarter, serve better.
          </ThemedText>
        </View>

        <View
          style={[
            styles.formCard,
            { backgroundColor: Colors.light.card, borderColor: Colors.light.border },
          ]}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={[styles.input, { color: Colors.light.text }]}
              placeholder="Email"
              placeholderTextColor={Colors.light.textSecondary}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: Colors.light.border }]} />

          <View style={styles.inputWrapper}>
            <TextInput
              style={[styles.input, { color: Colors.light.text }]}
              placeholder="Password"
              placeholderTextColor={Colors.light.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: Colors.light.primary }]}
            onPress={handleLogin}
            disabled={loginMutation.isPending}
            activeOpacity={0.85}>
            <Text style={[styles.buttonText, { color: Colors.light.primaryForeground }]}>
              {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
            </Text>
          </TouchableOpacity>
        </View>

        <ThemedText type="small" style={styles.footerText}>
          BrewFlow Staff POS
        </ThemedText>
      </Animated.View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.five,
  },
  logoCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.four,
    shadowColor: '#6f3e1d',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  logoText: {
    color: Colors.light.primaryForeground,
    fontSize: 40,
    fontWeight: '700',
    letterSpacing: 1,
  },
  title: {
    textAlign: 'center',
    marginBottom: Spacing.one,
  },
  subtitle: {
    textAlign: 'center',
    color: Colors.light.textSecondary,
    marginBottom: Spacing.one,
  },
  tagline: {
    textAlign: 'center',
    color: Colors.light.textSecondary,
    fontStyle: 'italic',
  },
  formCard: {
    borderRadius: 24,
    padding: Spacing.four,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    marginVertical: Spacing.two,
  },
  input: {
    height: 48,
    fontSize: 16,
    paddingHorizontal: Spacing.three,
  },
  button: {
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.three,
    shadowColor: '#6f3e1d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  footerText: {
    textAlign: 'center',
    marginTop: Spacing.five,
    color: Colors.light.textSecondary,
  },
});
