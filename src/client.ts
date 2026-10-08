/**
 * @fileoverview Lightweight API client for @kkhay/react-native
 * @license MIT
 */

import type { CreateInvoiceOptions, InvoiceData } from "./types/index.js";

export class KkhayApiClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(apiKey: string, baseUrl: string = "https://api.kkhay.com") {
    this.apiKey = apiKey.trim();
    this.baseUrl = baseUrl.replace(/\/+$/, "");
  }

  private buildUrl(path: string): string {
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    if (this.baseUrl.endsWith("/api") || this.baseUrl.includes("api.")) {
      return `${this.baseUrl}${cleanPath}`;
    }
    return `${this.baseUrl}/api${cleanPath}`;
  }

  public async createInvoice(options: CreateInvoiceOptions): Promise<InvoiceData> {
    const payload = {
      orderId: options.orderId || `rn_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      amount: options.amount,
      currency: (options.currency || "USD").toUpperCase(),
      title: options.title || "Mobile Checkout",
      description: options.description,
      customer: options.customer,
      metadata: {
        source: "react-native-sdk",
        ...options.metadata,
      },
      returnUrl: options.returnUrl,
    };

    const res = await fetch(this.buildUrl("/v1/merchant/invoices"), {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
        "User-Agent": "@kkhay/react-native/1.0.0",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.message || data?.error || `Failed to create invoice (${res.status})`);
    }

    const invoice = data.data || data;
    return invoice as InvoiceData;
  }

  public async getInvoice(id: string): Promise<InvoiceData> {
    const res = await fetch(this.buildUrl(`/v1/merchant/invoices/${encodeURIComponent(id.trim())}`), {
      method: "GET",
      headers: {
        Accept: "application/json",
        "x-api-key": this.apiKey,
        "User-Agent": "@kkhay/react-native/1.0.0",
      },
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.message || data?.error || `Failed to fetch invoice (${res.status})`);
    }

    const invoice = data.data || data;
    return invoice as InvoiceData;
  }
}

