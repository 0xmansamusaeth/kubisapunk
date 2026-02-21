"use client";

import { useAccount } from "wagmi";
import { QRCodeSVG } from "qrcode.react";

export function UserQRCode() {
  const { address, isConnected } = useAccount();

  // Generate QR data only if user is connected
  const qrData = isConnected && address
    ? JSON.stringify({
        wallet: address,
        timestamp: new Date().toISOString(),
      })
    : null;

  // Not connected state
  if (!isConnected || !address) {
    return (
      <div className="flex justify-center mb-8">
        <div className="text-center">
          <p className="text-gray-400 text-sm">Connect wallet to generate your KubisaPunk code.</p>
        </div>
      </div>
    );
  }

  // Render QR code
  return (
    <div className="flex justify-center mb-8">
      <div className="bg-white p-4 rounded-lg shadow-lg">
        <QRCodeSVG
          value={qrData!}
          size={256}
          level="H"
          includeMargin={true}
          fgColor="#000000"
          bgColor="#ffffff"
        />
      </div>
    </div>
  );
}
