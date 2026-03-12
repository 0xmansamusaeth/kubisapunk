"use client";
import { ReactNode, useState } from "react";
import { base, baseSepolia } from "wagmi/chains";
import { createConfig, http, WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { coinbaseWallet, injected } from "wagmi/connectors";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import { MiniAppProvider } from "./providers/MiniAppProvider";

// Configure wallet connectors for Base
const config = createConfig({
  chains: [base, baseSepolia],
  connectors: [
    injected(),
    coinbaseWallet({
      appName: "KubisaPunk",
      appLogoUrl: "https://example.com/logo.png",
    }),
  ],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http("https://sepolia.base.org"),
  },
});

export function RootProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <MiniAppProvider>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <OnchainKitProvider
            chain={process.env.NEXT_PUBLIC_NETWORK === "base-sepolia" ? baseSepolia : base}
          >
            {children}
          </OnchainKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </MiniAppProvider>
  );
}

