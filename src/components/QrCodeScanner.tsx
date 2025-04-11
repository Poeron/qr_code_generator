import React, { useEffect, useState } from 'react';

import { Html5Qrcode } from 'html5-qrcode';

interface QrCodeScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanError?: (error: string) => void;
  onCancel: () => void;
}

const QrCodeScanner: React.FC<QrCodeScannerProps> = ({ 
  onScanSuccess, 
  onScanError, 
  onCancel 
}) => {
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [qrScanner, setQrScanner] = useState<Html5Qrcode | null>(null);

  useEffect(() => {
    const scanner = new Html5Qrcode('qr-reader');
    setQrScanner(scanner);

    return () => {
      if (scanner && scanner.isScanning) {
        scanner.stop().catch(err => console.error('Error stopping scanner:', err));
      }
    };
  }, []);

  const startScanner = async () => {
    setError(null);
    if (!qrScanner) return;

    try {
      const qrScannerConfig = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      };

      await qrScanner.start(
        { facingMode: 'environment' },
        qrScannerConfig,
        (decodedText) => {
          onScanSuccess(decodedText);
          stopScanner();
        },
        (errorMessage) => {
          // Don't update state on every frame error
          console.log(errorMessage);
        }
      );
      setIsStarted(true);
    } catch (err) {
      setError('Error accessing camera: ' + (err instanceof Error ? err.message : String(err)));
      if (onScanError) onScanError('Error accessing camera');
    }
  };

  const stopScanner = async () => {
    if (qrScanner && qrScanner.isScanning) {
      try {
        await qrScanner.stop();
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
      setIsStarted(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div id="qr-reader" className="w-full max-w-sm rounded overflow-hidden shadow-md"></div>
      
      {error && (
        <div className="mt-4 px-4 py-3 text-sm text-red-700 bg-red-100 rounded-lg">
          {error}
        </div>
      )}
      
      <div className="mt-4 space-x-4">
        {!isStarted ? (
          <button
            onClick={startScanner}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Start Scanning
          </button>
        ) : (
          <button
            onClick={stopScanner}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          >
            Stop Scanning
          </button>
        )}
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default QrCodeScanner;