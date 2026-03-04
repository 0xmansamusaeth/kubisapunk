"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useGetProfile } from "@/app/hooks/useKubisaPunkContract";

interface ProfileData {
  walletAddress: string;
  connections: bigint;
  communities: bigint;
  eventsAttended: bigint;
  badgesEarned: bigint;
  joinDate: bigint;
}

export default function ProfilePage() {
  const { address, isConnected } = useAccount();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const { profile, isLoading: isProfileLoading } = useGetProfile(
    address as `0x${string}` | undefined
  );

  // Truncate wallet address
  const truncateAddress = (addr: string): string => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Calculate progress percentage
  const calculateProgress = (profile: ProfileData): number => {
    const progress = (Number(profile.eventsAttended) + Number(profile.connections)) * 10;
    return Math.min(progress, 100);
  };

  // Convert timestamp to readable date
  const formatJoinDate = (timestamp: bigint): string => {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  // Populate profile when contract data arrives
  useEffect(() => {
    if (isConnected && address && profile && !isProfileLoading) {
      const formattedProfile: ProfileData = {
        walletAddress: address,
        connections: profile.connections,
        communities: profile.communities,
        eventsAttended: profile.eventsAttended,
        badgesEarned: profile.badgesEarned,
        joinDate: profile.joinDate,
      };
      setProfileData(formattedProfile);
    } else if (!isConnected || !address) {
      setProfileData(null);
    }
  }, [isConnected, address, profile, isProfileLoading]);

  // Disconnected or loading state
  if (!isConnected || !profileData || isProfileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
              {isProfileLoading ? (
                <div className="animate-spin">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
              ) : (
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">
            KubisaPunk Profile
          </h1>
          <p className="text-gray-300 text-lg">
            {isProfileLoading
              ? "Loading your profile from the blockchain..."
              : "Connect your wallet to view your KubisaPunk profile"}
          </p>
        </div>
      </div>
    );
  }

  const progress = calculateProgress(profileData);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4 py-12">
      <div className="w-full max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2">
            KubisaPunk Profile
          </h1>
          <p className="text-gray-400">Your Web3 reputation snapshot</p>
        </div>

        {/* Profile Card */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-2xl shadow-2xl p-8 border border-gray-600 mb-6">
          {/* Wallet Address Section */}
          <div className="mb-8 pb-8 border-b border-gray-600">
            <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">
              Wallet Address
            </p>
            <p className="text-white font-mono text-lg break-all">
              {profileData.walletAddress}
            </p>
            <p className="text-blue-400 font-mono text-sm mt-2">
              {truncateAddress(profileData.walletAddress)}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {/* Connections */}
            <div className="bg-gray-700 rounded-lg p-4">
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">
                Connections
              </p>
              <p className="text-3xl font-bold text-blue-400">
                {Number(profileData.connections)}
              </p>
            </div>

            {/* Communities */}
            <div className="bg-gray-700 rounded-lg p-4">
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">
                Communities
              </p>
              <p className="text-3xl font-bold text-purple-400">
                {Number(profileData.communities)}
              </p>
            </div>

            {/* Events Attended */}
            <div className="bg-gray-700 rounded-lg p-4">
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">
                Events Attended
              </p>
              <p className="text-3xl font-bold text-green-400">
                {Number(profileData.eventsAttended)}
              </p>
            </div>

            {/* Badges Earned */}
            <div className="bg-gray-700 rounded-lg p-4">
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">
                Badges Earned
              </p>
              <p className="text-3xl font-bold text-yellow-400">
                {Number(profileData.badgesEarned)}
              </p>
            </div>
          </div>

          {/* Join Date */}
          <div className="mb-8 pb-8 border-b border-gray-600">
            <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">
              Member Since
            </p>
            <p className="text-white text-lg">{formatJoinDate(profileData.joinDate)}</p>
          </div>

          {/* Progress Section */}
          <div className="mb-2">
            <div className="flex items-center justify-between mb-3">
              <p className="text-gray-300 font-semibold">Reputation Progress</p>
              <p className="text-2xl font-bold text-blue-400">{progress}%</p>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>

            <p className="text-gray-400 text-xs mt-3">
              Complete events and build connections to increase your reputation
            </p>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center text-gray-400 text-sm">
          <p>
            Your reputation data is stored on Base Sepolia blockchain and updates in real-time.
          </p>
        </div>
      </div>
    </div>
  );
}
