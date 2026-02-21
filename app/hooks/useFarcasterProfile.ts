"use client";

import { useEffect, useState } from "react";

export interface FarcasterProfile {
  username?: string;
  fid?: number;
  displayName?: string;
  pfp?: {
    url?: string;
  };
}

export function useFarcasterProfile(address: string | undefined) {
  const [profile, setProfile] = useState<FarcasterProfile | null>(null);
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
        const apiKey = process.env.NEXT_PUBLIC_NEYNAR_API_KEY;

        if (!apiKey) {
          throw new Error("Neynar API key not configured");
        }

        const response = await fetch(
          `https://api.neynar.com/v2/farcaster/user/bulk-by-address?addresses=${address}&api_key=${apiKey}`
        );

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();

        if (data[address]?.users?.length > 0) {
          const user = data[address].users[0];
          setProfile({
            username: user.username,
            fid: user.fid,
            displayName: user.display_name,
            pfp: user.pfp,
          });
        } else {
          setError("No Farcaster account found for this address");
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unable to fetch profile";
        setError(errorMessage);
        console.error("Error fetching Farcaster profile:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [address]);

  return { profile, isLoading, error };
}
