"use client";

import { useEffect, useRef, useState } from "react";
import { useAccount } from "wagmi";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useIsRegistered, useRegisterUser } from "@/app/hooks/useKubisaPunkContract";

interface ScannedData {
  wallet: string;
  timestamp: string;
  source?: "qr" | "manual";
  inputType?: "address" | "ens";
}

export function ScanButton() {
  const { address, isConnected } = useAccount();
  const { isRegistered, isLoading: isCheckingRegistration } = useIsRegistered(
    address as `0x${string}` | undefined
  );
  const { registerUser, isLoading: isRegistering } = useRegisterUser();

  const [activeTab, setActiveTab] = useState<"scan" | "manual">("scan");
  const [isScanning, setIsScanning] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [scannedData, setScannedData] = useState<ScannedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const startScanning = () => {
    // Check if user is registered before allowing scan
    if (!isConnected) {
      setError("Please connect your wallet first");
      return;
    }

    if (!isRegistered && !isCheckingRegistration) {
      setShowRegisterModal(true);
      return;
    }

    setError(null);
    setScannedData(null);
    setIsScanning(true);
  };

  const handleRegister = async () => {
    try {
      if (!registerUser) return;
      await registerUser();
      setShowRegisterModal(false);
      // After registration, allow scanning
      setError(null);
      setScannedData(null);
      setIsScanning(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to register user"
      );
    }
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
    setScannedData(null);
  };

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const isValidEthereumAddress = (address: string): boolean => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  const resolveEnsOrAddress = async (input: string): Promise<{ wallet: string; inputType: "address" | "ens" } | null> => {
    const trimmedInput = input.trim();

    // Check if it's an Ethereum address
    if (trimmedInput.toLowerCase().startsWith("0x")) {
      if (isValidEthereumAddress(trimmedInput.toLowerCase())) {
        return {
          wallet: trimmedInput.toLowerCase(),
          inputType: "address",
        };
      } else {
        return null;
      }
    }

    // Treat as ENS name - validate format (basic check)
    if (trimmedInput.includes(".") && trimmedInput.length > 3) {
      // In a real implementation, you would call ENS resolution here
      // For now, we'll accept the ENS name format and use it as-is
      // Production: use ethers.js or viem to resolve ENS to address
      return {
        wallet: trimmedInput.toLowerCase(),
        inputType: "ens",
      };
    }

    return null;
  };

  const handleManualValidation = async () => {
    if (!manualInput.trim()) {
      setError("Please enter a wallet address or ENS name");
      return;
    }

    setIsValidating(true);
    setError(null);

    try {
      const result = await resolveEnsOrAddress(manualInput);

      if (!result) {
        setError(
          "Invalid address. Please enter a valid Ethereum address (0x...) or ENS name (e.g., vitalik.eth)"
        );
        setIsValidating(false);
        return;
      }

      // Create scanned data object
      const newData: ScannedData = {
        wallet: result.wallet,
        timestamp: new Date().toISOString(),
        source: "manual",
        inputType: result.inputType,
      };

      setScannedData(newData);
      setManualInput("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to validate input"
      );
    } finally {
      setIsValidating(false);
    }
  };

  // Clean up scanner on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.clear();
        } catch (err) {
          console.error("Error cleaning up scanner:", err);
        }
      }
    };
  }, []);

  // Initialize scanner when cameraReady becomes true
  useEffect(() => {
    if (!isScanning || !cameraReady) return;

    try {
      const scanner = new Html5QrcodeScanner(
        "qr-reader",
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
          // Parse and validate scanned QR data
          try {
            const data = JSON.parse(decodedText);

            // Validate required fields
            if (!data.wallet || !data.timestamp) {
              setError("Invalid QR code: missing wallet or timestamp");
              return;
            }

            // Validate field types
            if (
              typeof data.wallet !== "string" ||
              typeof data.timestamp !== "string"
            ) {
              setError("Invalid QR code: incorrect data types");
              return;
            }

            // Stop scanner and show preview
            scanner.pause(true);
            setScannedData({
              ...data,
              source: "qr",
            });
            setIsScanning(false);
            setCameraReady(false);
          } catch {
            setError("Invalid QR code: could not parse JSON");
          }
        },
        (err) => {
          // Ignore "QR code not detected" errors during scanning
          if (!err.toString().includes("Unknown error")) {
            console.debug("Scanner error:", err);
          }
        }
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to start camera";
      setError(errorMessage);
      setIsScanning(false);
      setCameraReady(false);
    }
  }, [isScanning, cameraReady]);

  // If scanning but camera not ready, show permission request
  if (isScanning && !cameraReady) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-2xl p-8 shadow-lg border border-blue-700">
          <div className="text-center">
            {/* Camera Icon */}
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
              We need access to your camera to scan the QR code. Your camera feed is only used for scanning and is not recorded or stored.
            </p>

            <div className="space-y-3 mb-8 bg-blue-950 rounded-lg p-4">
              <div className="flex items-start gap-3 text-left">
                <span className="text-blue-400 font-bold flex-shrink-0">✓</span>
                <span className="text-blue-100 text-xs">Point camera at QR code</span>
              </div>
              <div className="flex items-start gap-3 text-left">
                <span className="text-blue-400 font-bold flex-shrink-0">✓</span>
                <span className="text-blue-100 text-xs">Keep code in view</span>
              </div>
              <div className="flex items-start gap-3 text-left">
                <span className="text-blue-400 font-bold flex-shrink-0">✓</span>
                <span className="text-blue-100 text-xs">We&apos;ll detect it automatically</span>
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
              onClick={() => setCameraReady(true)}
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
    );
  }

  // If scanning and camera is ready, show camera feed
  if (isScanning && cameraReady) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-black rounded-2xl overflow-hidden shadow-xl border-2 border-blue-600 mb-4">
          <div
            ref={containerRef}
            className="relative bg-gray-900"
          >
            <div id="qr-reader" style={{ width: "100%" }} />
            {/* Scan Guide Overlay */}
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
          <p className="text-gray-400 text-sm">Position QR code in frame to scan</p>
        </div>

        <button
          onClick={stopScanning}
          className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors shadow-md"
        >
          Cancel
        </button>
      </div>
    );
  }

  // If scanned data, show preview/confirmation
  if (scannedData) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-gradient-to-br from-green-900 to-green-800 rounded-2xl p-6 mb-4 shadow-lg border-2 border-green-500">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-green-500 rounded-full p-2">
              <svg
                className="w-6 h-6 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white">
              Connection Verified
            </h3>
          </div>

          <div className="space-y-4 bg-green-950 rounded-lg p-4 mb-6">
            <div>
              <p className="text-xs font-semibold text-green-300 uppercase tracking-wide">
                Wallet Address
              </p>
              <p className="text-white font-mono text-sm mt-1 break-all">
                {scannedData.wallet}
              </p>
              <p className="text-green-200 font-mono text-xs mt-2">
                {shortenAddress(scannedData.wallet)}
              </p>
            </div>

            <div className="pt-2 border-t border-green-800">
              <p className="text-xs font-semibold text-green-300 uppercase tracking-wide">
                Source
              </p>
              <p className="text-green-100 text-sm mt-1">
                {scannedData.source === "manual"
                  ? `Manual Entry - ${scannedData.inputType === "ens" ? "ENS Name" : "Ethereum Address"}`
                  : "QR Code Scan"}
              </p>
            </div>

            <div className="pt-2 border-t border-green-800">
              <p className="text-xs font-semibold text-green-300 uppercase tracking-wide">
                Verified
              </p>
              <p className="text-green-100 text-sm mt-1">
                {new Date(scannedData.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => {
              setScannedData(null);
              setError(null);
              setActiveTab("scan");
              setManualInput("");
            }}
            className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors shadow-md"
          >
            Try Again
          </button>

          <button
            onClick={() => {
              // TODO: Implement blockchain connection logic
              console.log("Confirm connection:", scannedData);
            }}
            className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors shadow-md"
          >
            Confirm
          </button>
        </div>
      </div>
    );
  }

  // Registration modal
  if (showRegisterModal) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-gradient-to-br from-purple-900 to-purple-800 rounded-2xl p-6 shadow-lg border border-purple-700">
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <div className="bg-purple-500 rounded-full p-4">
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
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                </svg>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white mb-3">
              Welcome to KubisaPunk
            </h2>

            <p className="text-purple-100 mb-6 text-sm leading-relaxed">
              You need to register your wallet to start earning reputation and attending events.
            </p>

            <div className="space-y-3 mb-8 bg-purple-950 rounded-lg p-4 text-left">
              <div className="flex items-start gap-3">
                <span className="text-purple-400 font-bold flex-shrink-0">✓</span>
                <span className="text-purple-100 text-xs">Create your on-chain profile</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-purple-400 font-bold flex-shrink-0">✓</span>
                <span className="text-purple-100 text-xs">Start building reputation</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-purple-400 font-bold flex-shrink-0">✓</span>
                <span className="text-purple-100 text-xs">Check in to events and earn badges</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowRegisterModal(false)}
              className="flex-1 px-4 py-3 bg-purple-700 hover:bg-purple-600 text-white font-semibold rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleRegister}
              disabled={isRegistering}
              className={`flex-1 px-4 py-3 font-semibold rounded-lg transition-colors ${
                isRegistering
                  ? "bg-purple-500 text-gray-300 cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-500 text-white"
              }`}
            >
              {isRegistering ? "Registering..." : "Register"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Default state: show tabs for scan or manual entry
  return (
    <div className="w-full max-w-md mx-auto">
      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 bg-gray-800 p-1 rounded-lg">
        <button
          onClick={() => {
            setActiveTab("scan");
            setError(null);
            setManualInput("");
          }}
          className={`flex-1 py-2 px-4 rounded-md font-semibold transition-colors ${
            activeTab === "scan"
              ? "bg-blue-600 text-white"
              : "bg-gray-800 text-gray-300 hover:text-white"
          }`}
        >
          Scan QR
        </button>
        <button
          onClick={() => {
            setActiveTab("manual");
            setError(null);
          }}
          className={`flex-1 py-2 px-4 rounded-md font-semibold transition-colors ${
            activeTab === "manual"
              ? "bg-blue-600 text-white"
              : "bg-gray-800 text-gray-300 hover:text-white"
          }`}
        >
          Enter Manually
        </button>
      </div>

      {/* Scan Tab */}
      {activeTab === "scan" && (
        <button
          onClick={startScanning}
          disabled={isCheckingRegistration}
          className={`w-full px-8 py-3 font-semibold rounded-lg transition-colors shadow-md ${
            isCheckingRegistration
              ? "bg-gray-600 text-gray-300 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {isCheckingRegistration ? "Loading..." : "Start QR Scan"}
        </button>
      )}

      {/* Manual Entry Tab */}
      {activeTab === "manual" && (
        <div className="bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-700">
          <h3 className="text-lg font-bold text-white mb-4">
            Enter Wallet Address or ENS Name
          </h3>

          <div className="mb-4">
            <input
              type="text"
              value={manualInput}
              onChange={(e) => {
                setManualInput(e.target.value);
                setError(null);
              }}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleManualValidation();
                }
              }}
              placeholder="0x... or vitalik.eth"
              className="w-full px-4 py-3 bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-900 border border-red-700 rounded-lg">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          <div className="mb-6 text-xs text-gray-400 space-y-1">
            <p>✓ Ethereum address: 0x...</p>
            <p>✓ ENS name: .eth domain</p>
          </div>

          <button
            onClick={handleManualValidation}
            disabled={isValidating || !manualInput.trim()}
            className={`w-full px-6 py-3 font-semibold rounded-lg transition-colors shadow-md ${
              isValidating || !manualInput.trim()
                ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {isValidating ? "Validating..." : "Validate Address"}
          </button>
        </div>
      )}
    </div>
  );
}
