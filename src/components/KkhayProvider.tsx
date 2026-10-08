/**
 * @fileoverview React Native Context Provider for K Khay Gateway
 * @license MIT
 */

import React, { createContext, useContext, useMemo } from "react";
import { KkhayApiClient } from "../client.js";
import type {
  CreateInvoiceOptions,
  InvoiceData,
  KkhayConfig,
  KkhayContextValue,
} from "../types/index.js";

const KkhayContext = createContext<KkhayContextValue | null>(null);

export interface KkhayProviderProps extends KkhayConfig {
  children: React.ReactNode;
}

export function KkhayProvider({
  apiKey,
  baseUrl = "https://api.kkhay.com",
  defaultCurrency = "USD",
  theme = "system",
  children,
}: KkhayProviderProps) {
  const client = useMemo(() => new KkhayApiClient(apiKey, baseUrl), [apiKey, baseUrl]);

  const value = useMemo<KkhayContextValue>(
    () => ({
      apiKey,
      baseUrl,
      defaultCurrency,
      theme,
      createInvoice: (options: CreateInvoiceOptions) => client.createInvoice(options),
      getInvoice: (id: string) => client.getInvoice(id),
    }),
    [apiKey, baseUrl, defaultCurrency, theme, client]
  );

  return <KkhayContext.Provider value={value}>{children}</KkhayContext.Provider>;
}

export function useKkhay(): KkhayContextValue {
  const ctx = useContext(KkhayContext);
  if (!ctx) {
    throw new Error("useKkhay must be used within a <KkhayProvider>.");
  }
  return ctx;
}

