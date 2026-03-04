'use client';

import { useContractRead, useContractWrite } from 'wagmi';
import { KUBISAPUNK_ADDRESS, KUBISAPUNK_ABI } from '@/app/utils/contracts';

export interface Profile {
  joinDate: bigint;
  connections: bigint;
  communities: bigint;
  eventsAttended: bigint;
  badgesEarned: bigint;
}

export interface Event {
  name: string;
  organizer: `0x${string}`;
  date: bigint;
}

// Hook to get the contract reference
export function useKubisaPunkContract() {
  return {
    address: KUBISAPUNK_ADDRESS as `0x${string}`,
    abi: KUBISAPUNK_ABI,
  };
}

// Hook to get user profile
export function useGetProfile(userAddress?: `0x${string}`) {
  const contract = useKubisaPunkContract();
  
  const { data: profile, isLoading, error } = useContractRead({
    address: contract.address,
    abi: contract.abi,
    functionName: 'getProfile',
    args: userAddress ? [userAddress] : undefined,
    query: userAddress ? {} : { enabled: false },
  });

  return {
    profile: profile as Profile | undefined,
    isLoading,
    error,
  };
}

// Hook to register a user
export function useRegisterUser() {
  const contract = useKubisaPunkContract();
  const { writeContract, isPending } = useContractWrite();

  return {
    registerUser: () => writeContract({
      address: contract.address,
      abi: contract.abi,
      functionName: 'registerUser',
    }),
    isLoading: isPending,
  };
}

// Hook to check in to an event
export function useCheckIn() {
  const contract = useKubisaPunkContract();
  const { writeContract, isPending } = useContractWrite();

  return {
    checkIn: (eventId: bigint) => writeContract({
      address: contract.address,
      abi: contract.abi,
      functionName: 'checkIn',
      args: [eventId],
    }),
    isLoading: isPending,
  };
}

// Hook to create an event
export function useCreateEvent() {
  const contract = useKubisaPunkContract();
  const { writeContract, isPending } = useContractWrite();

  return {
    createEvent: (name: string) => writeContract({
      address: contract.address,
      abi: contract.abi,
      functionName: 'createEvent',
      args: [name],
    }),
    isLoading: isPending,
  };
}

// Hook to add a connection
export function useAddConnection() {
  const contract = useKubisaPunkContract();
  const { writeContract, isPending } = useContractWrite();

  return {
    addConnection: (otherUser: `0x${string}`) => writeContract({
      address: contract.address,
      abi: contract.abi,
      functionName: 'addConnection',
      args: [otherUser],
    }),
    isLoading: isPending,
  };
}

// Hook to check if user is registered
export function useIsRegistered(userAddress?: `0x${string}`) {
  const contract = useKubisaPunkContract();
  
  const { data: isRegistered, isLoading } = useContractRead({
    address: contract.address,
    abi: contract.abi,
    functionName: 'isRegistered',
    args: userAddress ? [userAddress] : undefined,
    query: userAddress ? {} : { enabled: false },
  });

  return {
    isRegistered: isRegistered as boolean | undefined,
    isLoading,
  };
}

// Hook to get event details
export function useGetEvent(eventId?: bigint) {
  const contract = useKubisaPunkContract();
  
  const { data: event, isLoading } = useContractRead({
    address: contract.address,
    abi: contract.abi,
    functionName: 'getEvent',
    args: eventId ? [eventId] : undefined,
    query: eventId !== undefined ? {} : { enabled: false },
  });

  return {
    event: event as Event | undefined,
    isLoading,
  };
}

// Hook to check if user has checked in to event
export function useHasCheckedIn(eventId?: bigint, userAddress?: `0x${string}`) {
  const contract = useKubisaPunkContract();
  
  const { data: hasCheckedIn, isLoading } = useContractRead({
    address: contract.address,
    abi: contract.abi,
    functionName: 'hasCheckedIn',
    args: eventId && userAddress ? [eventId, userAddress] : undefined,
    query: eventId && userAddress ? {} : { enabled: false },
  });

  return {
    hasCheckedIn: hasCheckedIn as boolean | undefined,
    isLoading,
  };
}
