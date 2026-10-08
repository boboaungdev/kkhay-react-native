import { describe, it, expect } from "vitest";
import { KkhayApiClient } from "../src/client.js";
import QRCode from "qrcode";

describe("KkhayApiClient for React Native", () => {
  it("should initialize with API key", () => {
    const client = new KkhayApiClient("test_pk_123");
    expect(client).toBeDefined();
  });

  it("should strip trailing slashes in baseUrl", () => {
    const client = new KkhayApiClient("test_pk_123", "https://api.kkhay.com/");
    expect((client as any).baseUrl).toBe("https://api.kkhay.com");
  });

  it("should compute QR code modules for vector rendering", () => {
    const qr = QRCode.create("https://kkhay.com/pay/inv_123", { errorCorrectionLevel: "H" });
    expect(qr.modules.size).toBeGreaterThan(20);
  });
});

