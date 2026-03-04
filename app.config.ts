/**
 * KubisaPunk Base App Configuration
 * Built with OnchainKit for Base blockchain
 */

const ROOT_URL =
  process.env.NEXT_PUBLIC_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000');

export const appConfig = {
  app: {
    name: "KubisaPunk",
    subtitle: "Web3 Reputation & Event Platform",
    description: "Build your onchain reputation through community events and connections",
    version: "1.0.0",
    homeUrl: ROOT_URL,
  },
  branding: {
    iconUrl: `${ROOT_URL}/icon.png`,
    splashImageUrl: `${ROOT_URL}/splash.png`,
    splashBackgroundColor: "#000000",
    primaryColor: "#0052FF",
  },
  seo: {
    ogTitle: "KubisaPunk - Your Onchain Reputation",
    ogDescription: "Build your Web3 reputation through community engagement on Base",
    ogImageUrl: `${ROOT_URL}/og-image.png`,
  },
  chain: {
    name: "Base",
    chainId: 8453,
    rpcUrl: "https://mainnet.base.org",
    testnet: {
      chainId: 84532,
      rpcUrl: "https://sepolia.base.org",
    },
  },
} as const;
