/**
 * @fileoverview Linear-aesthetic Mobile Checkout Modal for @kkhay/react-native
 * @license MIT
 */

import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Linking,
  useColorScheme,
} from "react-native";
import { useKkhay } from "./KkhayProvider.js";
import { KkhayQRCode } from "./KkhayQRCode.js";
import { useKkhayPayment } from "../hooks/useKkhayPayment.js";
import type { CryptoNetwork, KkhayModalProps } from "../types/index.js";

const NETWORKS: { id: CryptoNetwork; name: string }[] = [
  { id: "bsc", name: "BNB Smart Chain" },
  { id: "polygon", name: "Polygon" },
  { id: "arbitrum", name: "Arbitrum" },
  { id: "base", name: "Base" },
  { id: "ethereum", name: "Ethereum" },
];

export function KkhayModal({
  isOpen,
  onClose,
  invoice: initialInvoice,
  invoiceOptions,
  onSuccess,
  onError,
  theme: themeProp,
}: KkhayModalProps) {
  const { theme: contextTheme } = useKkhay();
  const systemScheme = useColorScheme();

  const isDark =
    (themeProp || contextTheme) === "dark" ||
    ((themeProp || contextTheme) === "system" && systemScheme === "dark");

  const colors = isDark
    ? {
        bg: "#09090b",
        card: "#121215",
        border: "rgba(255, 255, 255, 0.1)",
        text: "#fafafa",
        textMuted: "#a1a1aa",
        primary: "#10b981",
        primarySoft: "rgba(16, 185, 129, 0.15)",
        tileBg: "rgba(255, 255, 255, 0.05)",
      }
    : {
        bg: "#ffffff",
        card: "#ffffff",
        border: "rgba(0, 0, 0, 0.08)",
        text: "#09090b",
        textMuted: "#71717a",
        primary: "#10b981",
        primarySoft: "rgba(16, 185, 129, 0.1)",
        tileBg: "rgba(0, 0, 0, 0.03)",
      };

  const { status, invoice, timeLeft, startPayment, isPaid } = useKkhayPayment({
    onSuccess,
    onError,
  });

  const [selectedNetwork, setSelectedNetwork] = useState<CryptoNetwork>("bsc");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && invoiceOptions && !initialInvoice && status === "idle") {
      startPayment(invoiceOptions).catch(() => {});
    }
  }, [isOpen, invoiceOptions, initialInvoice, status, startPayment]);

  const currentInvoice = invoice || initialInvoice;
  const checkoutUrl = currentInvoice?.checkoutUrl || "https://kkhay.com/pay";
  const amountStr = currentInvoice ? Number(currentInvoice.amount).toFixed(2) : "0.00";
  const currencyStr = currentInvoice?.currency || "USD";

  const handleOpenWallet = async () => {
    try {
      const supported = await Linking.canOpenURL(checkoutUrl);
      if (supported) {
        await Linking.openURL(checkoutUrl);
      }
    } catch (e) {
      console.warn("Could not open wallet link:", e);
    }
  };

  const handleCopyLink = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Top Drag Handle */}
          <View style={styles.dragBarContainer}>
            <View style={[styles.dragBar, { backgroundColor: colors.border }]} />
          </View>

          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={styles.titleRow}>
              <View style={[styles.titleIcon, { backgroundColor: colors.primarySoft }]}>
                <Text style={{ fontSize: 13, color: colors.primary }}>🛡️</Text>
              </View>
              <Text style={[styles.titleText, { color: colors.text }]}>K Khay Crypto Checkout</Text>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeButton, { backgroundColor: colors.tileBg }]}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={{ color: colors.textMuted, fontSize: 14, fontWeight: "600" }}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.body} bounces={false}>
            {isPaid ? (
              /* SUCCESS CONFIRMATION VIEW */
              <View style={styles.successView}>
                <View style={[styles.successCircle, { backgroundColor: colors.primarySoft }]}>
                  <Text style={{ fontSize: 26, color: colors.primary }}>✓</Text>
                </View>

                <Text style={[styles.successTitle, { color: colors.text }]}>Payment Confirmed!</Text>
                <Text style={[styles.successSubtitle, { color: colors.textMuted }]}>
                  Your crypto payment has settled on-chain.
                </Text>

                <View style={[styles.tile, { backgroundColor: colors.tileBg, borderColor: colors.border, width: "100%", marginTop: 12 }]}>
                  <View style={styles.tileRow}>
                    <Text style={{ color: colors.textMuted, fontSize: 13 }}>Amount</Text>
                    <Text style={{ color: colors.text, fontWeight: "600", fontSize: 14 }}>
                      ${amountStr} {currencyStr}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.primaryButton, { backgroundColor: colors.primary, width: "100%", marginTop: 16 }]}
                  onPress={onClose}
                >
                  <Text style={styles.primaryButtonText}>Done</Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* ACTIVE CHECKOUT VIEW */
              <>
                {/* Amount Due and Timer */}
                <View style={styles.amountRow}>
                  <View>
                    <Text style={[styles.amountLabel, { color: colors.textMuted }]}>Amount Due</Text>
                    <Text style={[styles.amountValue, { color: colors.text }]}>
                      ${amountStr}{" "}
                      <Text style={{ fontSize: 14, color: colors.textMuted }}>{currencyStr}</Text>
                    </Text>
                  </View>

                  <View style={[styles.timerPill, { backgroundColor: colors.tileBg, borderColor: colors.border }]}>
                    <Text style={{ fontSize: 12, color: colors.textMuted }}>⏳</Text>
                    <Text style={[styles.timerText, { color: colors.text }]}>{timeLeft}</Text>
                  </View>
                </View>

                {/* Chain Selector Tabs */}
                <View style={{ marginTop: 12 }}>
                  <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Select Chain:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 6 }}>
                    {NETWORKS.map((net) => {
                      const active = selectedNetwork === net.id;
                      return (
                        <TouchableOpacity
                          key={net.id}
                          onPress={() => setSelectedNetwork(net.id)}
                          style={[
                            styles.networkPill,
                            {
                              backgroundColor: active ? colors.primarySoft : "transparent",
                              borderColor: active ? colors.primary : colors.border,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.networkText,
                              { color: active ? colors.primary : colors.textMuted, fontWeight: active ? "600" : "400" },
                            ]}
                          >
                            {net.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>

                {/* Vector QR Code */}
                <View style={styles.qrContainer}>
                  <KkhayQRCode value={checkoutUrl} size={180} centerLogo />
                </View>

                {/* Open in Mobile Wallet Action */}
                <TouchableOpacity
                  style={[styles.primaryButton, { backgroundColor: colors.primary }]}
                  onPress={handleOpenWallet}
                >
                  <Text style={styles.primaryButtonText}>Open in Crypto Wallet 📲</Text>
                </TouchableOpacity>

                {/* Copy Link Option */}
                <TouchableOpacity
                  style={[styles.secondaryButton, { backgroundColor: colors.tileBg, borderColor: colors.border }]}
                  onPress={handleCopyLink}
                >
                  <Text style={[styles.secondaryButtonText, { color: colors.text }]}>
                    {copied ? "✓ Copied to Clipboard" : "Copy Checkout Link"}
                  </Text>
                </TouchableOpacity>

                {/* Live Status Listener Footer */}
                <View style={styles.statusFooter}>
                  <View style={styles.pulseDot} />
                  <Text style={[styles.statusFooterText, { color: colors.textMuted }]}>
                    Waiting for on-chain confirmation...
                  </Text>
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    justifyContent: "flex-end",
  },
  card: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
    maxHeight: "90%",
    paddingBottom: 24,
  },
  dragBarContainer: {
    alignItems: "center",
    paddingTop: 8,
    paddingBottom: 4,
  },
  dragBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  titleIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  titleText: {
    fontSize: 15,
    fontWeight: "600",
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  amountLabel: {
    fontSize: 12,
  },
  amountValue: {
    fontSize: 22,
    fontWeight: "700",
  },
  timerPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
  },
  timerText: {
    fontSize: 12,
    fontWeight: "600",
  },
  sectionLabel: {
    fontSize: 12,
  },
  networkPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
  },
  networkText: {
    fontSize: 12,
  },
  qrContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 16,
  },
  primaryButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
  },
  secondaryButton: {
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: "500",
  },
  statusFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10b981",
  },
  statusFooterText: {
    fontSize: 12,
  },
  successView: {
    alignItems: "center",
    paddingVertical: 20,
  },
  successCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  successSubtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  tile: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  tileRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});

