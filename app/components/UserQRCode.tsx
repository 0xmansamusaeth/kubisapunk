"use client";

import { useAccount } from "wagmi";
import { QRCodeSVG } from "qrcode.react";

interface EventQRData {
  eventId: string;
  eventName: string;
  timestamp: string;
}

export function UserQRCode() {
  const { address, isConnected } = useAccount();

  // Event QR data - organizers would provide eventId and name
  // For now, this is a template that event organizers could use
  const generateEventQR = (eventId: string, eventName: string): string => {
    const qrData: EventQRData = {
      eventId,
      eventName,
      timestamp: new Date().toISOString(),
    };
    return JSON.stringify(qrData);
  };

  // Generate sample event QR code (organizer would use this)
  const sampleEventQR = generateEventQR("1", "KubisaPunk Meetup");

  // Generate user wallet QR (for user identity)
  const userQrData = isConnected && address
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

  // Show both user QR and sample event QR
  return (
    <div className="space-y-6 mb-8">
      {/* User QR Code */}
      <div>
        <h3 className="text-sm font-semibold text-gray-300 mb-2 text-center">Your Identity QR</h3>
        <div className="flex justify-center">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <QRCodeSVG
              value={userQrData!}
              size={200}
              level="H"
              includeMargin={true}
              fgColor="#000000"
              bgColor="#ffffff"
            />
          </div>
        </div>
        <p className="text-xs text-gray-400 text-center mt-2">Share for connections</p>
      </div>

      {/* Event QR Code (Sample for organizers) */}
      <div>
        <h3 className="text-sm font-semibold text-gray-300 mb-2 text-center">Event Check-In QR (Sample)</h3>
        <div className="flex justify-center">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <QRCodeSVG
              value={sampleEventQR}
              size={200}
              level="H"
              includeMargin={true}
              fgColor="#000000"
              bgColor="#ffffff"
            />
          </div>
        </div>
        <p className="text-xs text-gray-400 text-center mt-2">For event organizers to create event check-ins</p>
      </div>
    </div>
  );
}
