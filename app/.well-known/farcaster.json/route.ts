import { NextResponse } from "next/server";

/**
 * Base App Configuration Endpoint
 * This endpoint provides app metadata for Base-based apps.
 * Previously served Farcaster MiniApp config, now focused on Base chain apps.
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    app: "KubisaPunk",
    chain: "Base",
    description: "Web3 Reputation & Event Platform on Base",
    note: "This app is built with OnchainKit and runs natively on Base",
  });
}

