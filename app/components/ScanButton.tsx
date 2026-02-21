"use client";

interface ScanButtonProps {
  onClick?: () => void;
}

export function ScanButton({ onClick }: ScanButtonProps) {
  return (
    <button
      onClick={onClick}
      className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
    >
      Scan Connection
    </button>
  );
}
