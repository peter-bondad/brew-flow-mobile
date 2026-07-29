import { createAuthClient } from "better-auth/react";
import type { BetterAuthClientPlugin } from "better-auth";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";

const expoPlugin = expoClient({
  scheme: "mobile",
  storagePrefix: "mobile",
  storage: SecureStore,
});

export const authClient = createAuthClient({
  baseURL: "http://localhost:3000",
  plugins: [expoPlugin as unknown as BetterAuthClientPlugin],
});
