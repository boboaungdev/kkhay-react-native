/**
 * @fileoverview Pure React Native SVG QR Code Component with Center Logo Excavation
 * @license MIT
 */

import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Rect, Circle, Path, G } from "react-native-svg";
import QRCode from "qrcode";

export interface KkhayQRCodeProps {
  /**
   * The value (URL or deposit address) to encode.
   */
  value: string;

  /**
   * Width and height of QR code in points.
   * @default 200
   */
  size?: number;

  /**
   * Whether to embed center K Khay emblem with module excavation.
   * @default true
   */
  centerLogo?: boolean;
}

export function KkhayQRCode({ value, size = 200, centerLogo = true }: KkhayQRCodeProps) {
  const qr = useMemo(() => {
    if (!value) return null;
    try {
      return QRCode.create(value, { errorCorrectionLevel: "H" });
    } catch (e) {
      console.warn("K Khay QR code generation error:", e);
      return null;
    }
  }, [value]);

  if (!qr) {
    return (
      <View style={[styles.placeholder, { width: size, height: size }]} />
    );
  }

  const moduleCount = qr.modules.size;
  const cellSize = size / moduleCount;

  // Center logo excavation area
  const centerCell = moduleCount / 2;
  const logoRadiusCells = centerLogo ? moduleCount * 0.16 : 0;

  const rects: React.ReactElement[] = [];

  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (qr.modules.get(row, col)) {
        // Calculate distance from center cell for circular excavation
        const distFromCenter = Math.hypot(row - centerCell, col - centerCell);
        if (centerLogo && distFromCenter < logoRadiusCells) {
          continue; // Excavate module for center logo
        }

        rects.push(
          <Rect
            key={`${row}-${col}`}
            x={col * cellSize}
            y={row * cellSize}
            width={cellSize + 0.3} // small overlap to prevent subpixel antialiasing gaps
            height={cellSize + 0.3}
            fill="#09090b"
          />
        );
      }
    }
  }

  const logoSize = size * 0.28;
  const logoCenter = size / 2;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Rect width={size} height={size} fill="#ffffff" />
        {rects}

        {centerLogo && (
          <G>
            {/* Emerald circular background with white border */}
            <Circle
              cx={logoCenter}
              cy={logoCenter}
              r={logoSize / 2}
              fill="#10b981"
              stroke="#ffffff"
              strokeWidth={3}
            />
            {/* K Khay Monogram (K) */}
            <Path
              d={`
                M ${logoCenter - logoSize * 0.22} ${logoCenter - logoSize * 0.24}
                L ${logoCenter - logoSize * 0.22} ${logoCenter + logoSize * 0.24}
                M ${logoCenter - logoSize * 0.22} ${logoCenter}
                L ${logoCenter + logoSize * 0.22} ${logoCenter - logoSize * 0.24}
                M ${logoCenter - logoSize * 0.22} ${logoCenter}
                L ${logoCenter + logoSize * 0.22} ${logoCenter + logoSize * 0.24}
              `}
              stroke="#ffffff"
              strokeWidth={3.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </G>
        )}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    padding: 6,
  },
  placeholder: {
    backgroundColor: "#f4f4f5",
    borderRadius: 12,
  },
});

