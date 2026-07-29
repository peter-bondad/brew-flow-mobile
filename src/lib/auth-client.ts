import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";

// @ts-ignore - plugin type mismatch between @better-auth/expo and better-auth/react
const expoPlugin = expoClient({
  scheme: "mobile",
  storagePrefix: "mobile",
  storage: SecureStore,
});

// @ts-ignore - expo plugin type mismatch
export const authClient = createAuthClient({
  baseURL: "http://localhost:3000",
  plugins: [expoPlugin] as any,
});
