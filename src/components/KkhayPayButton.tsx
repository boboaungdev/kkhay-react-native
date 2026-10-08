/**
 * @fileoverview Drop-in Linear SaaS Crypto Checkout Button for @kkhay/react-native
 * @license MIT
 */

import React, { useState } from "react";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { KkhayModal } from "./KkhayModal.js";
import type { InvoiceData, KkhayPayButtonProps } from "../types/index.js";

export function KkhayPayButton({
  amount,
  currency = "USD",
  title,
  description,
  orderId,
  customer,
  metadata,
  variant = "default",
  size = "default",
  label,
  children,
  style,
  textStyle,
  disabled = false,
  onSuccess,
  onError,
}: KkhayPayButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formattedAmount = Number(amount).toFixed(2);
  const currencyStr = currency.toUpperCase();

  const handleSuccess = (invoice: InvoiceData) => {
    onSuccess?.(invoice);
  };

  const handleError = (error: Error) => {
    onError?.(error);
  };

  const paddingV = size === "sm" ? 8 : size === "lg" ? 15 : 12;
  const paddingH = size === "sm" ? 14 : size === "lg" ? 22 : 18;
  const fontSize = size === "sm" ? 13 : size === "lg" ? 16 : 14;

  const bgStyle =
    variant === "outline"
      ? styles.btnOutline
      : variant === "ghost"
      ? styles.btnGhost
      : styles.btnDefault;

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.8}
        disabled={disabled}
        onPress={() => setIsModalOpen(true)}
        style={[
          styles.baseButton,
          bgStyle,
          { paddingVertical: paddingV, paddingHorizontal: paddingH, opacity: disabled ? 0.6 : 1 },
          style,
        ]}
      >
        {children ? (
          children
        ) : (
          <View style={styles.contentRow}>
            <Text style={{ fontSize: fontSize - 1 }}>🛡️</Text>
            <Text style={[styles.baseText, { fontSize }, textStyle]}>
              {label || `Pay $${formattedAmount} ${currencyStr} with Crypto`}
            </Text>
            <Text style={[styles.baseText, { fontSize: fontSize - 2, opacity: 0.8 }]}>›</Text>
          </View>
        )}
      </TouchableOpacity>

      <KkhayModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        invoiceOptions={{
          amount,
          currency,
          title,
          description,
          orderId,
          customer,
          metadata,
        }}
        onSuccess={handleSuccess}
        onError={handleError}
      />
    </>
  );
}

const styles = StyleSheet.create({
  baseButton: {
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  btnDefault: {
    backgroundColor: "#10b981",
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  btnOutline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.4)",
  },
  btnGhost: {
    backgroundColor: "rgba(16, 185, 129, 0.1)",
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  baseText: {
    color: "#ffffff",
    fontWeight: "600",
  },
});

