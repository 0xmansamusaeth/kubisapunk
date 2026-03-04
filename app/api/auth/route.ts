import { NextRequest, NextResponse } from "next/server";

/**
 * Health Check Endpoint
 * This endpoint verifies that the KubisaPunk Base app is running.
 * For wallet authentication, use OnchainKit's built-in wallet components.
 */
export async function GET(_request: NextRequest) {
  return NextResponse.json({
    success: true,
    app: "KubisaPunk",
    status: "running",
    chain: "Base",
    message: "Use OnchainKit wallet components for authentication",
  });
}

/**
 * POST endpoint for custom Base app logic
 * Add your custom authentication or transaction signing logic here
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Example: Validate wallet signature on Base chain
    // You can implement custom signing logic here if needed
    
    return NextResponse.json({
      success: true,
      message: "Request processed",
      data: body,
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : "Processing error" 
      },
      { status: 400 }
    );
  }
}