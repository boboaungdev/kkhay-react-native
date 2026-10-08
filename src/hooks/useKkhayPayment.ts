/**
 * @fileoverview Headless payment hook for @kkhay/react-native
 * @license MIT
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useKkhay } from "../components/KkhayProvider.js";
import type { CreateInvoiceOptions, InvoiceData, PaymentStatus } from "../types/index.js";

export interface UseKkhayPaymentOptions {
  pollingInterval?: number;
  onSuccess?: (invoice: InvoiceData) => void;
  onError?: (error: Error) => void;
}

export function useKkhayPayment(options: UseKkhayPaymentOptions = {}) {
  const { createInvoice: apiCreate, getInvoice: apiGet } = useKkhay();
  const [status, setStatus] = useState<PaymentStatus>("idle");
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>("15:00");

  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const pollingInterval = options.pollingInterval || 3000;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  const checkStatus = useCallback(async () => {
    if (!invoice?.id) return;
    try {
      const updated = await apiGet(invoice.id);
      const newStatus = (updated.status || "").toLowerCase() as PaymentStatus;

      setInvoice(updated);

      if (newStatus === "paid" || newStatus === "confirmed") {
        setStatus("paid");
        if (pollingRef.current) clearInterval(pollingRef.current);
        if (countdownRef.current) clearInterval(countdownRef.current);
        options.onSuccess?.(updated);
      } else if (newStatus === "expired" || newStatus === "cancelled") {
        setStatus("expired");
        if (pollingRef.current) clearInterval(pollingRef.current);
      } else if (newStatus === "partial") {
        setStatus("partial");
      }
    } catch (err: any) {
      console.warn("K Khay status poll error:", err.message);
    }
  }, [invoice?.id, apiGet, options]);

  // Polling loop
  useEffect(() => {
    if (status === "pending" || status === "confirming") {
      pollingRef.current = setInterval(checkStatus, pollingInterval);
      return () => {
        if (pollingRef.current) clearInterval(pollingRef.current);
      };
    }
  }, [status, pollingInterval, checkStatus]);

  // Expiry countdown timer
  useEffect(() => {
    if (!invoice) return;

    const expiresAt = invoice.expiresAt
      ? new Date(invoice.expiresAt).getTime()
      : new Date(invoice.createdAt || Date.now()).getTime() + 15 * 60 * 1000;

    const updateTimer = () => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((expiresAt - now) / 1000));

      if (diff <= 0) {
        setTimeLeft("00:00");
        setStatus("expired");
        if (countdownRef.current) clearInterval(countdownRef.current);
        return;
      }

      const m = Math.floor(diff / 60)
        .toString()
        .padStart(2, "0");
      const s = (diff % 60).toString().padStart(2, "0");
      setTimeLeft(`${m}:${s}`);
    };

    updateTimer();
    countdownRef.current = setInterval(updateTimer, 1000);

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [invoice]);

  const startPayment = useCallback(
    async (createOptions: CreateInvoiceOptions): Promise<InvoiceData> => {
      setStatus("creating");
      setError(null);

      try {
        const inv = await apiCreate(createOptions);
        setInvoice(inv);
        setStatus("pending");
        return inv;
      } catch (err: any) {
        const errorObj = err instanceof Error ? err : new Error(String(err));
        setError(errorObj);
        setStatus("failed");
        options.onError?.(errorObj);
        throw errorObj;
      }
    },
    [apiCreate, options]
  );

  const reset = useCallback(() => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    setStatus("idle");
    setInvoice(null);
    setError(null);
    setTimeLeft("15:00");
  }, []);

  return {
    status,
    invoice,
    error,
    timeLeft,
    isPaid: status === "paid",
    isExpired: status === "expired",
    isLoading: status === "creating",
    startPayment,
    checkStatus,
    reset,
  };
}

