# @kkhay/react-native

[![npm version](https://img.shields.io/npm/v/@kkhay/react-native.svg?style=flat-square&color=10b981)](https://www.npmjs.com/package/@kkhay/react-native)
[![npm downloads](https://img.shields.io/npm/dm/@kkhay/react-native.svg?style=flat-square&color=6366f1)](https://www.npmjs.com/package/@kkhay/react-native)
[![license](https://img.shields.io/npm/l/@kkhay/react-native.svg?style=flat-square)](./LICENSE)
[![CI Status](https://img.shields.io/github/actions/workflow/status/boboaungdev/kkhay-react-native/ci.yml?branch=main&style=flat-square&label=CI)](https://github.com/boboaungdev/kkhay-react-native/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg?style=flat-square)](https://www.typescriptlang.org/)
[![Expo](https://img.shields.io/badge/Expo-Compatible-black?style=flat-square&logo=expo)](https://expo.dev)

Official React Native & Expo mobile payment gateway SDK for **K Khay** — the non-custodial, sovereign cryptocurrency payment gateway. Accept **USDT, USDC, BNB, and ETH** natively on iOS and Android across BNB Smart Chain, Polygon, Arbitrum, Base, and Ethereum with instant mobile wallet deep linking.

---

## ⚡ Highlights

- 📱 **Expo & Bare React Native**: 100% compatible with Expo Go and Bare React Native CLI. Zero native C++/CocoaPods compilation required.
- 🎨 **Modern SaaS / Native Design**: Sleek dark and light mode checkout modals and bottom sheets.
- 📐 **Vector SVG QR Code**: Pure SVG QR code powered by `react-native-svg` with mathematically excavated center emblem. Razor-sharp on Retina and high-DPI Android screens.
- 🔗 **One-Tap Wallet Deep Linking**: Automatically detects and opens MetaMask, Trust Wallet, Phantom, Coinbase Wallet, or Rainbow via standard EIP-681 URLs.
- 🔄 **Reactive Headless Hook**: `useKkhayPayment` handles automatic status polling, countdown timer, and state transitions.
- 🛡️ **End-to-End TypeScript**: Complete type definitions for invoices, network configurations, and callbacks.

---

## 📦 Installation

```bash
# npm
npm install @kkhay/react-native react-native-svg

# yarn
yarn add @kkhay/react-native react-native-svg

# pnpm
pnpm add @kkhay/react-native react-native-svg

# Expo
npx expo install @kkhay/react-native react-native-svg
```

> **Note:** `react-native-svg` is a peer dependency for high-resolution vector QR code rendering. In Expo projects, using `npx expo install react-native-svg` ensures the matched version is installed.

---

## 🚀 Quick Start

### 1. Wrap your app with `KkhayProvider`

```tsx
import React from 'react';
import { SafeAreaView, View, Text } from 'react-native';
import { KkhayProvider, KkhayPayButton } from '@kkhay/react-native';

export default function App() {
  return (
    <KkhayProvider
      apiKey="your_publishable_api_key"
      merchantId="merchant_12345"
      theme="dark" // 'dark' | 'light' | 'system'
    >
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 20, marginBottom: 20 }}>Order Summary: $49.00</Text>

        <KkhayPayButton
          amount={49.0}
          currency="USD"
          token="USDT"
          network="bsc"
          onSuccess={(invoice) => {
            console.log('Payment complete!', invoice.txHash);
          }}
          onFailure={(error) => {
            console.error('Payment failed or cancelled', error);
          }}
        />
      </SafeAreaView>
    </KkhayProvider>
  );
}
```

---

## 🛠️ Usage Patterns

### Pattern A: Direct Checkout Modal (`KkhayModal`)

Use `KkhayModal` if you create invoices on your backend server and want to present the mobile checkout sheet:

```tsx
import React, { useState } from 'react';
import { View, Button } from 'react-native';
import { KkhayModal, InvoiceData } from '@kkhay/react-native';

export function CheckoutScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);

  const startCheckout = async () => {
    // Fetch invoice from your secure backend API
    const res = await fetch('https://api.yourstore.com/create-kkhay-invoice', {
      method: 'POST',
      body: JSON.stringify({ amount: 99.0, currency: 'USD' }),
    });
    const data = await res.json();
    setInvoice(data.invoice);
    setModalVisible(true);
  };

  return (
    <View>
      <Button title="Pay with Crypto" onPress={startCheckout} />

      <KkhayModal
        visible={modalVisible}
        invoice={invoice}
        theme="dark"
        onClose={() => setModalVisible(false)}
        onSuccess={(completedInvoice) => {
          setModalVisible(false);
          alert(`Paid! Tx: ${completedInvoice.txHash}`);
        }}
      />
    </View>
  );
}
```

---

### Pattern B: Headless Hook (`useKkhayPayment`)

Build completely custom payment screens using the headless hook:

```tsx
import React from 'react';
import { View, Text, Button, Linking } from 'react-native';
import { useKkhayPayment, KkhayQRCode } from '@kkhay/react-native';

export function CustomPaymentView({ invoiceId }: { invoiceId: string }) {
  const { status, invoice, remainingSeconds, isExpired, isPending, isSuccess } = useKkhayPayment({
    invoiceId,
    pollInterval: 3000,
    onSuccess: (data) => console.log('Payment confirmed:', data.txHash),
  });

  if (!invoice) return <Text>Loading payment details...</Text>;

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  return (
    <View style={{ alignItems: 'center', padding: 24 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
        Pay {invoice.payAmount} {invoice.token} ({invoice.network.toUpperCase()})
      </Text>

      {/* Pure SVG QR Code */}
      <View style={{ marginVertical: 20 }}>
        <KkhayQRCode
          value={invoice.payAddress}
          size={220}
          logoSize={44}
          theme="dark"
        />
      </View>

      <Text>Expires in: {minutes}:{seconds < 10 ? `0${seconds}` : seconds}</Text>
      <Text>Status: {status}</Text>

      {/* Deep Link to Wallet */}
      <Button
        title="Open Mobile Wallet"
        onPress={() => Linking.openURL(`ethereum:${invoice.payAddress}`)}
      />
    </View>
  );
}
```

---

### Pattern C: Vector QR Code Component (`KkhayQRCode`)

Render standalone SVG vector QR codes with high-contrast borders and excavated center branding:

```tsx
import React from 'react';
import { View } from 'react-native';
import { KkhayQRCode } from '@kkhay/react-native';

export function WalletQR({ address }: { address: string }) {
  return (
    <View style={{ padding: 16, backgroundColor: '#0d1117', borderRadius: 16 }}>
      <KkhayQRCode
        value={address}
        size={240}
        theme="dark"
        quietZone={16}
        logoSize={48}
      />
    </View>
  );
}
```

---

## ⚙️ Component Props

### `<KkhayPayButton />`

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `amount` | `number` | **Required** | Fiat or crypto payment amount. |
| `currency` | `string` | `'USD'` | Invoice currency code (USD, EUR, GBP, MMK, THB, etc.). |
| `token` | `CryptoToken` | `'USDT'` | Crypto token (`USDT`, `USDC`, `BNB`, `ETH`). |
| `network` | `CryptoNetwork` | `'bsc'` | Blockchain network (`bsc`, `polygon`, `arbitrum`, `base`, `ethereum`). |
| `variant` | `'primary' \| 'secondary' \| 'outline' \| 'gradient'` | `'primary'` | Visual button styling. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Button sizing. |
| `label` | `string` | `'Pay with Crypto'` | Custom button text. |
| `onSuccess` | `(invoice: InvoiceData) => void` | `undefined` | Callback fired on payment confirmation. |
| `onFailure` | `(err: Error) => void` | `undefined` | Callback fired on error or expiration. |

---

### `<KkhayModal />`

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `visible` | `boolean` | **Required** | Whether the modal is presented. |
| `invoice` | `InvoiceData \| null` | `null` | Active invoice data. |
| `onClose` | `() => void` | **Required** | Callback when user dismisses the modal. |
| `onSuccess` | `(invoice: InvoiceData) => void` | `undefined` | Callback on payment confirmation. |
| `theme` | `'dark' \| 'light'` | `'dark'` | Visual theme. |

---

### `<KkhayQRCode />`

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `value` | `string` | **Required** | Crypto address or payment URI. |
| `size` | `number` | `200` | Width and height in density-independent pixels. |
| `theme` | `'dark' \| 'light'` | `'dark'` | Color scheme. |
| `quietZone` | `number` | `12` | White/dark space padding around the QR code. |
| `logoSize` | `number` | `40` | Center emblem size. |

---

## 🌐 Supported Cryptocurrencies & Networks

| Network | Chain ID | Supported Tokens |
| :--- | :--- | :--- |
| **BNB Smart Chain (BSC)** | 56 | USDT, USDC, BNB |
| **Polygon (PoS)** | 137 | USDT, USDC |
| **Arbitrum One** | 42161 | USDT, USDC, ETH |
| **Base** | 8453 | USDC, ETH |
| **Ethereum Mainnet** | 1 | USDT, USDC, ETH |

---

## 🔒 Security & Best Practices

1. **Non-Custodial Architecture**: K Khay never holds private keys. Funds settle directly into your sovereign on-chain merchant wallet.
2. **API Keys**: Use your **Publishable API Key** in mobile client applications. Keep your Secret API Keys strictly on your backend servers.
3. **Idempotency**: All invoice creations use deterministic reference IDs to prevent duplicate payments.

---

## 📄 License

MIT © [K Khay](https://kkhay.com)

