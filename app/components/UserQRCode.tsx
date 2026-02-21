"use client";

import { useAccount } from "wagmi";
import { useFarcasterProfile } from "@/app/hooks/useFarcasterProfile";
import { QRCodeSVG } from "qrcode.react";

export function UserQRCode() {
  const { address, isConnected } = useAccount();
  const { profile, isLoading } = useFarcasterProfile(address);

  // Generate QR data only if user is connected and has Farcaster profile
  const qrData = isConnected && address && profile?.fid && profile?.username
    ? JSON.stringify({
        fid: profile.fid,
        username: profile.username,
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

  // Loading Farcaster profile
  if (isLoading) {
    return (
      <div className="flex justify-center mb-8">
        <div className="w-64 h-64 bg-gray-800 border-2 border-gray-600 rounded-lg flex items-center justify-center">
          <p className="text-gray-400 text-sm">Generating code...</p>
        </div>
      </div>
    );
  }

  // Connected but no QR data available
  if (!qrData) {
    return (
      <div className="flex justify-center mb-8">
        <div className="w-64 h-64 bg-gray-800 border-2 border-gray-600 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-400 text-sm">Create a Farcaster account</p>
            <p className="text-gray-500 text-xs mt-2">to generate your unique code</p>
          </div>
        </div>
      </div>
    );
  }

  // Render QR code
  return (
    <div className="flex justify-center mb-8">
      <div className="bg-white p-4 rounded-lg shadow-lg">
        <QRCodeSVG
          value={qrData}
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
