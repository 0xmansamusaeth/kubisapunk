"use client";

import { useAccount } from "wagmi";
import { useMiniApp } from "@/app/providers/MiniAppProvider";
import { useFarcasterProfile } from "@/app/hooks/useFarcasterProfile";

export function UserIdentity() {
  const { isReady } = useMiniApp();
  const { address, isConnected } = useAccount();
  const { profile, isLoading, error } = useFarcasterProfile(address);

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

  // Loading Farcaster profile
  if (isLoading) {
    return (
      <div className="text-center mb-8">
        <p className="text-gray-300 font-semibold">{shortenAddress(address)}</p>
        <p className="text-xs text-gray-500 mt-2">Resolving Farcaster profile...</p>
      </div>
    );
  }

  // Connected but no Farcaster account found
  if (error) {
    return (
      <div className="text-center mb-8">
        <p className="text-gray-300 font-semibold">{shortenAddress(address)}</p>
        <p className="text-sm text-amber-500 mt-2">{error}</p>
        <p className="text-xs text-gray-400 mt-2">
          <a href="https://warpcast.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
            Create a Farcaster account
          </a>
        </p>
      </div>
    );
  }

  // Farcaster profile successfully resolved
  return (
    <div className="text-center mb-8">
      {profile?.displayName && (
        <p className="text-lg font-semibold text-white">{profile.displayName}</p>
      )}
      {profile?.username && (
        <p className="text-sm text-gray-300">@{profile.username}</p>
      )}
      {profile?.fid && (
        <p className="text-xs text-gray-500 mt-1">FID: {profile.fid}</p>
      )}
      {address && (
        <p className="text-xs text-gray-400 mt-2">{shortenAddress(address)}</p>
      )}
    </div>
  );
}
