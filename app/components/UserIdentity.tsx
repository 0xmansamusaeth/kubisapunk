"use client";

import { useAccount } from "wagmi";
import { useMiniApp } from "@/app/providers/MiniAppProvider";

export function UserIdentity() {
  const { isReady } = useMiniApp();
  const { address, isConnected } = useAccount();

  const shortenAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Show loading state while mini app initializes
  if (!isReady) {
    return (
      <div className="text-center mb-8">
        <p className="text-gray-400 text-sm">Initializing...</p>
      </div>
    );
  }

  // If wallet not connected
  if (!isConnected || !address) {
    return (
      <div className="text-center mb-8">
        <p className="text-gray-300 text-sm mb-4">Please connect your wallet to continue</p>
        <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-sm">
          Connect Wallet
        </button>
      </div>
    );
  }

  // Wallet connected - display wallet address
  return (
    <div className="text-center mb-8">
      <div className="inline-block bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg p-0.5">
        <div className="bg-slate-900 rounded px-4 py-2">
          <p className="text-gray-300 text-xs mb-1">Wallet Address</p>
          <p className="text-white font-mono text-sm">{shortenAddress(address)}</p>
          <p className="text-gray-500 text-xs mt-1">{address}</p>
        </div>
      </div>
    </div>
  );
}
