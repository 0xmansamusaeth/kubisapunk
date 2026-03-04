"use client";

import { useEffect, useState } from "react";

/**
 * Hook for fetching on-chain profile data from Base
 * Replaces previous Farcaster profile fetching
 * Uses direct smart contract calls for profile data
 */
export interface OnchainProfile {
  address: string;
  joined: number;
  chain: "base" | "base-sepolia";
  reputation?: number;
}

export function useFarcasterProfile(address: string | undefined) {
  const [profile, setProfile] = useState<OnchainProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) {
      setProfile(null);
      setError(null);
      return;
    }

    const fetchProfile = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Profile data is now fetched directly from smart contract
        // via useGetProfile() hook in useKubisaPunkContract.ts
        // This function is kept for backwards compatibility
        setProfile({
          address: address,
          joined: Date.now(),
          chain: process.env.NEXT_PUBLIC_NETWORK === "base-sepolia" ? "base-sepolia" : "base",
          reputation: 0,
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unable to fetch profile";
        setError(errorMessage);
        console.error("Error fetching on-chain profile:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [address]);

  return { profile, isLoading, error };
}

