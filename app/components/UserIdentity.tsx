"use client";

import { useAccount } from "wagmi";
import { useMiniApp } from "@/app/providers/MiniAppProvider";
import { useIsRegistered, useGetProfile } from "@/app/hooks/useKubisaPunkContract";

export function UserIdentity() {
  const { isReady } = useMiniApp();
  const { address, isConnected } = useAccount();
  const { isRegistered, isLoading: isCheckingReg } = useIsRegistered(
    address as `0x${string}` | undefined
  );
  const { profile, isLoading: isLoadingProfile } = useGetProfile(
    address as `0x${string}` | undefined
  );

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

  // If wallet not connected (should not happen due to WalletGate)
  if (!isConnected || !address) {
    return (
      <div className="text-center mb-8">
        <p className="text-gray-400 text-sm">Initializing wallet...</p>
      </div>
    );
  }

  // Loading registration status and profile
  if (isCheckingReg || isLoadingProfile) {
    return (
      <div className="text-center mb-8">
        <p className="text-gray-400 text-sm">Loading profile...</p>
      </div>
    );
  }

  // User is registered - show profile stats
  if (isRegistered && profile) {
    return (
      <div className="space-y-4 mb-8">
        {/* Wallet Address */}
        <div className="inline-block bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg p-0.5 w-full">
          <div className="bg-slate-900 rounded px-4 py-2">
            <p className="text-gray-300 text-xs mb-1">Wallet Address</p>
            <p className="text-white font-mono text-sm">{shortenAddress(address)}</p>
            <p className="text-gray-500 text-xs mt-1">{address}</p>
          </div>
        </div>

        {/* Reputation Stats */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-lg p-3 border border-blue-700">
            <p className="text-gray-300 text-xs uppercase tracking-wide">Events</p>
            <p className="text-blue-300 text-xl font-bold">{Number(profile.eventsAttended)}</p>
          </div>
          <div className="bg-gradient-to-br from-green-900 to-green-800 rounded-lg p-3 border border-green-700">
            <p className="text-gray-300 text-xs uppercase tracking-wide">Connections</p>
            <p className="text-green-300 text-xl font-bold">{Number(profile.connections)}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-900 to-purple-800 rounded-lg p-3 border border-purple-700">
            <p className="text-gray-300 text-xs uppercase tracking-wide">Badges</p>
            <p className="text-purple-300 text-xl font-bold">{Number(profile.badgesEarned)}</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-900 to-yellow-800 rounded-lg p-3 border border-yellow-700">
            <p className="text-gray-300 text-xs uppercase tracking-wide">Communities</p>
            <p className="text-yellow-300 text-xl font-bold">{Number(profile.communities)}</p>
          </div>
        </div>
      </div>
    );
  }

  // User not registered yet
  return (
    <div className="text-center mb-8">
      <p className="text-gray-300 text-sm mb-4">Register your wallet to view your KubisaPunk profile</p>
      <a href="/profile" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-sm">
        Register Now
      </a>
    </div>
  );
}
