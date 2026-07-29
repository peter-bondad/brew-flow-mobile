import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useLogin } from "./api";
import { Colors, Spacing } from "@/constants/theme";

export function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const loginMutation = useLogin();
  const router = useRouter();
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
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }

    try {
      await loginMutation.mutateAsync({
        email: email.trim(),
        password,
      });
      router.replace("/" as any);
    } catch (error) {
      Alert.alert(
        "Login Failed",
        error instanceof Error ? error.message : "Invalid credentials.",
      );
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
        ]}
      >
        <View style={styles.header}>
          <View
            style={[
              styles.logoCircle,
              { backgroundColor: Colors.light.primary },
            ]}
          >
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
            {
              backgroundColor: Colors.light.card,
              borderColor: Colors.light.border,
            },
          ]}
        >
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={[styles.input, { color: Colors.light.text }]}
              placeholder="Enter your email"
              placeholderTextColor={Colors.light.textSecondary}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              style={[styles.input, { color: Colors.light.text }]}
              placeholder="Enter your password"
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
            activeOpacity={0.85}
          >
            <Text
              style={[
                styles.buttonText,
                { color: Colors.light.primaryForeground },
              ]}
            >
              {loginMutation.isPending ? "Signing in..." : "Sign In"}
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
    justifyContent: "center",
    paddingHorizontal: Spacing.four,
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing.five,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.three,
    shadowColor: "#6f3e1d",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  logoText: {
    color: Colors.light.primaryForeground,
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  title: {
    textAlign: "center",
    marginBottom: Spacing.one,
    fontSize: 28,
    lineHeight: 32,
  },
  subtitle: {
    textAlign: "center",
    color: Colors.light.textSecondary,
    marginBottom: Spacing.one,
    fontSize: 16,
    lineHeight: 22,
  },
  tagline: {
    textAlign: "center",
    color: Colors.light.textSecondary,
    fontStyle: "italic",
    fontSize: 14,
    lineHeight: 20,
  },
  formCard: {
    borderRadius: 20,
    padding: Spacing.four,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  inputWrapper: {
    gap: Spacing.two,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.light.text,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.three,
    backgroundColor: Colors.light.border,
  },
  input: {
    height: 48,
    fontSize: 16,
    paddingHorizontal: Spacing.three,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.background,
  },
  button: {
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginTop: Spacing.four,
    shadowColor: "#6f3e1d",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 3,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  footerText: {
    textAlign: "center",
    marginTop: Spacing.five,
    color: Colors.light.textSecondary,
    fontSize: 12,
    lineHeight: 16,
  },
});
