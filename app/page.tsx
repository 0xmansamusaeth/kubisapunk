"use client";
import { UserIdentity } from "./components/UserIdentity";
import { UserQRCode } from "./components/UserQRCode";
import { ScanButton } from "./components/ScanButton";

export default function Home() {
  const handleScan = () => {
    console.log("Scan button clicked");
    // TODO: Implement scan logic
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">KubisaPunk</h1>
          <p className="text-gray-300 text-lg">Onchain Identity for Builders</p>
        </div>

        {/* User Identity Section */}
        <div className="mb-12">
          <UserIdentity />
        </div>

        {/* QR Code Section */}
        <div className="mb-8">
          <UserQRCode />
        </div>

        {/* Scan Button */}
        <div className="flex justify-center">
          <ScanButton onClick={handleScan} />
        </div>
      </div>
    </div>
  );
}
