"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

interface ProfileData {
  walletAddress: string;
  connections: number;
  communities: number;
  eventsAttended: number;
  badgesEarned: number;
  joinDate: string;
}

export default function ProfilePage() {
  const { address, isConnected } = useAccount();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);

  // Truncate wallet address
  const truncateAddress = (addr: string): string => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Calculate progress percentage
  const calculateProgress = (profile: ProfileData): number => {
    const progress = (profile.eventsAttended + profile.connections) * 10;
    return Math.min(progress, 100);
  };

  // Get current month/year for join date
  const getCurrentMonthYear = (): string => {
    const now = new Date();
    return now.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  // Populate profile when wallet connects
  useEffect(() => {
    if (isConnected && address) {
      const mockProfile: ProfileData = {
        walletAddress: address,
        connections: 0,
        communities: 0,
        eventsAttended: 0,
        badgesEarned: 0,
        joinDate: getCurrentMonthYear(),
      };
      setProfileData(mockProfile);
    } else {
      setProfileData(null);
    }
  }, [isConnected, address]);

  // Disconnected state
  if (!isConnected || !profileData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
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
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">
            KubisaPunk Profile
          </h1>
          <p className="text-gray-300 text-lg">
            Connect your wallet to view your KubisaPunk profile
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
                {profileData.connections}
              </p>
            </div>

            {/* Communities */}
            <div className="bg-gray-700 rounded-lg p-4">
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">
                Communities
              </p>
              <p className="text-3xl font-bold text-purple-400">
                {profileData.communities}
              </p>
            </div>

            {/* Events Attended */}
            <div className="bg-gray-700 rounded-lg p-4">
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">
                Events Attended
              </p>
              <p className="text-3xl font-bold text-green-400">
                {profileData.eventsAttended}
              </p>
            </div>

            {/* Badges Earned */}
            <div className="bg-gray-700 rounded-lg p-4">
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">
                Badges Earned
              </p>
              <p className="text-3xl font-bold text-yellow-400">
                {profileData.badgesEarned}
              </p>
            </div>
          </div>

          {/* Join Date */}
          <div className="mb-8 pb-8 border-b border-gray-600">
            <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">
              Member Since
            </p>
            <p className="text-white text-lg">{profileData.joinDate}</p>
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
            This profile is powered by your Base wallet and will integrate with
            smart contracts soon.
          </p>
        </div>
      </div>
    </div>
  );
}
