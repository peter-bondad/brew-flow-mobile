import { Stack } from "expo-router";
import { ThemedView } from "@/components/themed-view";
import { LoginScreen } from "@/features/auth/login-screen";

export default function LoginRoute() {
  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen options={{ title: "Login", headerShown: false }} />
      <LoginScreen />
    </ThemedView>
  );
}
