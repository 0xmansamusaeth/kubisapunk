"use client";

import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

interface ScannedData {
  fid: number;
  username: string;
  wallet: string;
  timestamp: string;
}

export function ScanButton() {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<ScannedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const startScanning = async () => {
    setError(null);
    setScannedData(null);
    setIsScanning(true);

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
            if (!data.fid || !data.username || !data.wallet || !data.timestamp) {
              setError("Invalid QR code: missing required fields");
              return;
            }

            // Validate field types
            if (
              typeof data.fid !== "number" ||
              typeof data.username !== "string" ||
              typeof data.wallet !== "string" ||
              typeof data.timestamp !== "string"
            ) {
              setError("Invalid QR code: incorrect data types");
              return;
            }

            // Stop scanner and show preview
            scanner.pause(true);
            setScannedData(data);
            setIsScanning(false);
          } catch (err) {
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
    setScannedData(null);
  };

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
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

  // If scanning, show camera
  if (isScanning) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div
          ref={containerRef}
          className="mb-4 rounded-lg overflow-hidden bg-gray-900 border-2 border-blue-600"
        >
          <div id="qr-reader" style={{ width: "100%" }} />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900 border border-red-700 rounded-lg">
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        <button
          onClick={stopScanning}
          className="w-full px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
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
        <div className="bg-gray-800 border-2 border-green-500 rounded-lg p-6 mb-4">
          <h3 className="text-lg font-semibold text-white mb-4">
            Connection Detected
          </h3>

          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-400">Username</p>
              <p className="text-white font-mono">@{scannedData.username}</p>
            </div>

            <div>
              <p className="text-xs text-gray-400">FID</p>
              <p className="text-white font-mono">{scannedData.fid}</p>
            </div>

            <div>
              <p className="text-xs text-gray-400">Wallet</p>
              <p className="text-white font-mono">
                {shortenAddress(scannedData.wallet)}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-400">Scanned</p>
              <p className="text-white font-mono text-xs">
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
            }}
            className="flex-1 px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
          >
            Scan Again
          </button>

          <button
            onClick={() => {
              // TODO: Implement blockchain connection logic
              console.log("Confirm connection:", scannedData);
            }}
            className="flex-1 px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
          >
            Confirm Connection
          </button>
        </div>
      </div>
    );
  }

  // Default state: show scan button
  return (
    <button
      onClick={startScanning}
      className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
    >
      Scan Connection
    </button>
  );
}
