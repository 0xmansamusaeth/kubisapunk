"use client";

import { useEffect, useRef, useState } from "react";
import { useAccount } from "wagmi";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useCheckIn } from "@/app/hooks/useKubisaPunkContract";

interface EventPayload {
  eventId: string;
  eventName: string;
  timestamp: string;
}

interface CheckInData {
  event: EventPayload;
  walletAddress: string;
  scannedAt: string;
}

type PageState =
  | "idle"
  | "scanning"
  | "preview"
  | "success"
  | "error";

export default function CheckInPage() {
  const { address, isConnected } = useAccount();
  const { checkIn, isLoading: isCheckInLoading } = useCheckIn();

  const [pageState, setPageState] = useState<PageState>("idle");
  const [checkInData, setCheckInData] = useState<CheckInData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const truncateAddress = (addr: string): string => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const validateEventPayload = (payload: unknown): payload is EventPayload => {
    if (typeof payload !== "object" || payload === null) return false;

    const obj = payload as Record<string, unknown>;
    return (
      typeof obj.eventId === "string" &&
      typeof obj.eventName === "string" &&
      typeof obj.timestamp === "string"
    );
  };

  const startScanning = () => {
    if (!isConnected) {
      setError("Please connect your wallet to check in to events");
      setPageState("error");
      return;
    }

    setError(null);
    setPageState("scanning");
    setIsScanning(true);
  };

  const stopScanning = () => {
    if (scannerRef.current) {
      try {
        scannerRef.current.clear();
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
    setCameraReady(false);
    setPageState("idle");
  };

  const handleCameraPermission = () => {
    setCameraReady(true);
  };

  // Initialize scanner when cameraReady becomes true
  useEffect(() => {
    if (!isScanning || !cameraReady) return;

    try {
      const scanner = new Html5QrcodeScanner(
        "qr-reader-checkin",
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1,
        },
        false
      );

      scannerRef.current = scanner;

      scanner.render(
        (decodedText) => {
          try {
            const payload = JSON.parse(decodedText);

            if (!validateEventPayload(payload)) {
              setError(
                "Invalid QR code. Expected: eventId, eventName, timestamp"
              );
              setPageState("error");
              return;
            }

            // Stop scanner and show preview
            scanner.pause(true);

            if (!address) {
              setError("Wallet not connected. Please connect your wallet.");
              setPageState("error");
              return;
            }

            const newCheckInData: CheckInData = {
              event: payload,
              walletAddress: address,
              scannedAt: new Date().toISOString(),
            };

            setCheckInData(newCheckInData);
            setPageState("preview");
            setIsScanning(false);
            setCameraReady(false);
          } catch {
            setError("Invalid QR code format. Please scan a valid event code.");
            setPageState("error");
          }
        },
        () => {
          // Error handler for scanner - intentionally empty
        }
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to start camera";
      setError(errorMessage);
      setPageState("error");
      setIsScanning(false);
    }
  }, [isScanning, cameraReady, address]);

  const handleConfirmAttendance = async () => {
    if (!checkInData) return;

    try {
      // Convert eventId to bigint and call contract
      const eventIdBigInt = BigInt(checkInData.event.eventId);
      await checkIn(eventIdBigInt);
      setPageState("success");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to check in to event";
      setError(errorMessage);
      setPageState("error");
    }
  };

  const handleResetAndScanAgain = () => {
    setCheckInData(null);
    setError(null);
    setPageState("idle");
  };

  // Disconnected state
  if (!isConnected) {
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
          <h1 className="text-3xl font-bold text-white mb-4">Event Check-In</h1>
          <p className="text-gray-300 text-lg">
            Connect your wallet to check in to events
          </p>
        </div>
      </div>
    );
  }

  // Idle state - show scan button
  if (pageState === "idle") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4 py-12">
        <div className="w-full max-w-2xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-white mb-2">
              Event Check-In
            </h1>
            <p className="text-gray-400">Scan a QR code to register attendance</p>
          </div>

          <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-2xl shadow-2xl p-8 border border-gray-600 text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-full mb-4">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white mb-3">
              Ready to Check In?
            </h2>

            <p className="text-gray-300 mb-8">
              Scan the event QR code to register your attendance and earn
              reputation points.
            </p>

            <div className="space-y-3 mb-8 bg-gray-700 rounded-lg p-4">
              <div className="flex items-start gap-3 text-left">
                <span className="text-blue-400 font-bold flex-shrink-0">✓</span>
                <span className="text-gray-200 text-sm">
                  Position camera at event QR code
                </span>
              </div>
              <div className="flex items-start gap-3 text-left">
                <span className="text-blue-400 font-bold flex-shrink-0">✓</span>
                <span className="text-gray-200 text-sm">
                  Keep code in view
                </span>
              </div>
              <div className="flex items-start gap-3 text-left">
                <span className="text-blue-400 font-bold flex-shrink-0">✓</span>
                <span className="text-gray-200 text-sm">
                  We&apos;ll detect it automatically
                </span>
              </div>
            </div>

            <button
              onClick={startScanning}
              className="w-full px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-md text-lg"
            >
              Start Scanning
            </button>
          </div>

          <div className="mt-6 text-center text-gray-400 text-sm">
            <p>Connected as: {address && truncateAddress(address)}</p>
          </div>
        </div>
      </div>
    );
  }

  // Camera permission request
  if (isScanning && !cameraReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4 py-12">
        <div className="w-full max-w-md mx-auto">
          <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-2xl p-8 shadow-lg border border-blue-700">
            <div className="text-center">
              <div className="mb-6 flex justify-center">
                <div className="bg-blue-500 rounded-full p-4">
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
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-white mb-3">
                Camera Permission Required
              </h2>

              <p className="text-blue-100 mb-6 text-sm leading-relaxed">
                We need access to your camera to scan event QR codes. Your
                camera feed is only used for scanning and is not recorded.
              </p>

              <div className="space-y-3 mb-8 bg-blue-950 rounded-lg p-4">
                <div className="flex items-start gap-3 text-left">
                  <span className="text-blue-400 font-bold flex-shrink-0">
                    ✓
                  </span>
                  <span className="text-blue-100 text-xs">
                    Point camera at event QR code
                  </span>
                </div>
                <div className="flex items-start gap-3 text-left">
                  <span className="text-blue-400 font-bold flex-shrink-0">
                    ✓
                  </span>
                  <span className="text-blue-100 text-xs">Keep code in view</span>
                </div>
                <div className="flex items-start gap-3 text-left">
                  <span className="text-blue-400 font-bold flex-shrink-0">
                    ✓
                  </span>
                  <span className="text-blue-100 text-xs">
                    We&apos;ll detect it automatically
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={stopScanning}
                className="flex-1 px-4 py-3 bg-blue-700 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCameraPermission}
                className="flex-1 px-4 py-3 bg-blue-500 hover:bg-blue-400 text-white font-semibold rounded-lg transition-colors"
              >
                Allow Camera
              </button>
            </div>

            <p className="text-blue-200 text-xs text-center mt-4">
              Your browser may show an additional permission dialog
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Scanning state - show camera feed
  if (isScanning && cameraReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4 py-12">
        <div className="w-full max-w-md mx-auto">
          <div className="bg-black rounded-2xl overflow-hidden shadow-xl border-2 border-blue-600 mb-4">
            <div ref={containerRef} className="relative bg-gray-900">
              <div id="qr-reader-checkin" style={{ width: "100%" }} />
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="border-2 border-blue-500 w-56 h-56 rounded-lg opacity-30" />
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-900 border border-red-700 rounded-lg shadow-md">
              <p className="text-red-200 text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="text-center mb-4">
            <p className="text-gray-400 text-sm">Position event QR code to scan</p>
          </div>

          <button
            onClick={stopScanning}
            className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors shadow-md"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // Preview state - show scanned event details
  if (pageState === "preview" && checkInData) {
    const scanDate = new Date(checkInData.scannedAt);

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4 py-12">
        <div className="w-full max-w-2xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-white mb-2">
              Confirm Your Check-In
            </h1>
            <p className="text-gray-400">Review event details before confirming</p>
          </div>

          {/* Event Preview Card */}
          <div className="bg-gradient-to-br from-purple-900 to-purple-800 rounded-2xl shadow-2xl p-6 mb-6 border-2 border-purple-500">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-purple-500 rounded-full p-2">
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white">Event Details</h2>
            </div>

            <div className="space-y-5 bg-purple-950 rounded-lg p-5">
              <div>
                <p className="text-xs font-semibold text-purple-300 uppercase tracking-wide mb-1">
                  Event Name
                </p>
                <p className="text-white text-lg font-semibold">
                  {checkInData.event.eventName}
                </p>
              </div>

              <div className="pt-3 border-t border-purple-800">
                <p className="text-xs font-semibold text-purple-300 uppercase tracking-wide mb-1">
                  Event ID
                </p>
                <p className="text-purple-200 font-mono text-sm">
                  {checkInData.event.eventId}
                </p>
              </div>

              <div className="pt-3 border-t border-purple-800">
                <p className="text-xs font-semibold text-purple-300 uppercase tracking-wide mb-1">
                  Wallet Address
                </p>
                <p className="text-white font-mono text-sm break-all">
                  {checkInData.walletAddress}
                </p>
                <p className="text-purple-200 font-mono text-xs mt-2">
                  {truncateAddress(checkInData.walletAddress)}
                </p>
              </div>

              <div className="pt-3 border-t border-purple-800">
                <p className="text-xs font-semibold text-purple-300 uppercase tracking-wide mb-1">
                  Scanned At
                </p>
                <p className="text-purple-100 text-sm">
                  {scanDate.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setCheckInData(null);
                setPageState("idle");
              }}
              disabled={isCheckInLoading}
              className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-500 text-white font-semibold rounded-lg transition-colors shadow-md"
            >
              Cancel
            </button>

            <button
              onClick={handleConfirmAttendance}
              disabled={isCheckInLoading}
              className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-500 text-white font-semibold rounded-lg transition-colors shadow-md disabled:cursor-not-allowed"
            >
              {isCheckInLoading ? "Processing..." : "Confirm Attendance"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (pageState === "success" && checkInData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="bg-gradient-to-br from-green-900 to-green-800 rounded-2xl shadow-2xl p-8 border-2 border-green-500 text-center">
            {/* Animated Checkmark */}
            <div className="mb-8 flex justify-center">
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 bg-green-500 rounded-full animate-pulse opacity-30" />
                <div className="relative flex items-center justify-center w-24 h-24 bg-green-500 rounded-full">
                  <svg
                    className="w-12 h-12 text-white animate-bounce"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <h1 className="text-4xl font-bold text-white mb-2">Check-In Confirmed!</h1>

            <div className="bg-green-950 rounded-lg p-6 mb-8 mt-6">
              <p className="text-green-100 text-xl font-semibold mb-4">
                You have checked in to:
              </p>
              <p className="text-white text-2xl font-bold mb-4">
                {checkInData.event.eventName}
              </p>

              <div className="space-y-3 pt-4 border-t border-green-800 text-left">
                <div>
                  <p className="text-green-300 text-sm uppercase tracking-wide mb-1">
                    Event ID
                  </p>
                  <p className="text-green-100 font-mono">
                    {checkInData.event.eventId}
                  </p>
                </div>
                <div>
                  <p className="text-green-300 text-sm uppercase tracking-wide mb-1">
                    Check-In Time
                  </p>
                  <p className="text-green-100">
                    {new Date(checkInData.scannedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <p className="text-green-200 mb-8 text-sm">
              Your attendance has been recorded on the Base Sepolia blockchain!
            </p>

            <button
              onClick={handleResetAndScanAgain}
              className="w-full px-6 py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors shadow-md text-lg"
            >
              Scan Another Event
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (pageState === "error") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="bg-gradient-to-br from-red-900 to-red-800 rounded-2xl shadow-2xl p-8 border-2 border-red-500 text-center">
            <div className="mb-6 flex justify-center">
              <div className="bg-red-500 rounded-full p-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>

            <h1 className="text-3xl font-bold text-white mb-4">Error</h1>

            {error && (
              <div className="bg-red-950 rounded-lg p-4 mb-8">
                <p className="text-red-100">{error}</p>
              </div>
            )}

            <button
              onClick={handleResetAndScanAgain}
              className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors shadow-md"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
