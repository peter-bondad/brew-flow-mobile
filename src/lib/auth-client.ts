import { createAuthClient } from "better-auth/react";
import type { BetterAuthClientPlugin, ClientStore } from "@better-auth/core";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";

const expoPlugin = expoClient({
  scheme: "mobile",
  storagePrefix: "mobile",
  storage: SecureStore,
});

const typedExpoPlugin: BetterAuthClientPlugin = {
  id: expoPlugin.id,
  version: expoPlugin.version,
  fetchPlugins: expoPlugin.fetchPlugins,
  getActions: ($fetch, $store, options) => {
    return (expoPlugin as unknown as { getActions: ($fetch: unknown, $store: ClientStore, options?: unknown) => Record<string, unknown> }).getActions($fetch, $store, options);
  },
};

export const authClient = createAuthClient({
  baseURL: "http://localhost:3000",
  plugins: [typedExpoPlugin],
});
