"use client";

import { useAccount } from "wagmi";
import { ConnectWallet } from "@coinbase/onchainkit/wallet";

interface WalletGateProps {
  children: React.ReactNode;
}

export function WalletGate({ children }: WalletGateProps) {
  const { isConnected } = useAccount();

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">KubisaPunk</h1>
            <p className="text-gray-300 text-lg">Onchain Identity for Builders</p>
          </div>

          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white text-4xl">🔐</span>
            </div>
          </div>

          {/* Message */}
          <div>
            <p className="text-gray-300 text-base mb-6">
              Connect your wallet to access your KubisaPunk profile and event check-ins
            </p>
          </div>

          {/* Connect Wallet Button */}
          <div className="flex justify-center">
            <ConnectWallet />
          </div>

          {/* Info */}
          <div className="text-gray-400 text-sm pt-4 border-t border-gray-700">
            <p>You need a web3 wallet to continue</p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
