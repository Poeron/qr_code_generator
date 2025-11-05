import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";

import QrCodeHistoryItem from "./QrCodeHistoryItem";
import QrCodeScanner from "./QrCodeScanner";

interface QrCodeHistoryItem {
  url: string;
  text: string;
  size: string;
  errorCorrectionLevel: string;
  timestamp: number;
}

const QR_HISTORY_KEY = 'qrCodeHistory';

const QrCodeGenerator: React.FC = () => {
  const [inputText, setInputText] = useState<string>("");
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [size, setSize] = useState<string>("300x300");
  const [errorCorrectionLevel, setErrorCorrectionLevel] = useState<string>("M");
  const [history, setHistory] = useState<QrCodeHistoryItem[]>(() => {
    // Initialize history from localStorage directly in the state initializer
    try {
      const savedHistory = localStorage.getItem(QR_HISTORY_KEY);
      return savedHistory ? JSON.parse(savedHistory) : [];
    } catch (error) {
      console.error('Error loading history from localStorage:', error);
      return [];
    }
  });
  const [showScanner, setShowScanner] = useState<boolean>(false);
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [showShareOptions, setShowShareOptions] = useState<boolean>(false);

  // Initialize darkMode state from localStorage
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const savedPreference = localStorage.getItem('darkModePreference');
      return savedPreference === 'true';
    } catch (error) {
      console.error('Error loading dark mode preference:', error);
      return false;
    }
  });

  // Save history to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(QR_HISTORY_KEY, JSON.stringify(history));
      console.log('History saved to localStorage:', history);
    } catch (error) {
      console.error('Error saving history to localStorage:', error);
    }
  }, [history]);

  // Update document class and localStorage when darkMode changes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkModePreference', String(darkMode));
  }, [darkMode]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setInputText(e.target.value);
  };

  const handleSizeChange = (e: ChangeEvent<HTMLSelectElement>): void => {
    setSize(e.target.value);
  };

  const handleErrorCorrectionChange = (e: ChangeEvent<HTMLSelectElement>): void => {
    setErrorCorrectionLevel(e.target.value);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (inputText.trim()) {
      const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}&data=${encodeURIComponent(
        inputText
      )}&ecc=${errorCorrectionLevel}`;
      setQrCodeUrl(qrCodeApiUrl);

      // Add to history
      const newHistoryItem: QrCodeHistoryItem = {
        url: qrCodeApiUrl,
        text: inputText,
        size,
        errorCorrectionLevel,
        timestamp: Date.now()
      };

      // Remove duplicates and keep only the 10 most recent
      const updatedHistory = [
        newHistoryItem,
        ...history.filter(item => item.text !== inputText)
      ].slice(0, 10);
      
      setHistory(updatedHistory);
    }
  };

  const handleDownload = async () => {
    if (!qrCodeUrl) return;
    
    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `qrcode-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error downloading QR code:', error);
      alert('Failed to download QR code. Please try again.');
    }
  };

  const handleShare = async () => {
    if (!qrCodeUrl || !navigator.share) return;
    
    try {
      // First, fetch the image and convert to blob
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const file = new File([blob], 'qrcode.png', { type: 'image/png' });
      
      // Create share data
      const shareData = {
        title: 'QR Code',
        text: `QR Code for: ${inputText}`,
        files: [file]
      };
      
      // Try to use the Web Share API
      if (navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback to just sharing the text and URL
        await navigator.share({
          title: 'QR Code',
          text: `QR Code for: ${inputText}`,
          url: qrCodeUrl
        });
      }
    } catch (error) {
      console.error('Error sharing QR code:', error);
      // If sharing fails, show the share options menu
      setShowShareOptions(true);
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(qrCodeUrl)
      .then(() => {
        alert('QR Code URL copied to clipboard!');
        setShowShareOptions(false);
      })
      .catch(err => {
        console.error('Failed to copy URL: ', err);
      });
  };

  const selectFromHistory = (historyItem: QrCodeHistoryItem) => {
    setInputText(historyItem.text);
    setSize(historyItem.size);
    setErrorCorrectionLevel(historyItem.errorCorrectionLevel);
    setQrCodeUrl(historyItem.url);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(QR_HISTORY_KEY);
  };

  const toggleDarkMode = () => {
    setDarkMode(prevMode => !prevMode);
  };

  const handleScanSuccess = (decodedText: string) => {
    setInputText(decodedText);
    setScannedResult(decodedText);
    setShowScanner(false);
    
    // Automatically generate QR code for the scanned text
    const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}&data=${encodeURIComponent(
      decodedText
    )}&ecc=${errorCorrectionLevel}`;
    setQrCodeUrl(qrCodeApiUrl);
    
    // Add to history
    const newHistoryItem: QrCodeHistoryItem = {
      url: qrCodeApiUrl,
      text: decodedText,
      size,
      errorCorrectionLevel,
      timestamp: Date.now()
    };
    
    const updatedHistory = [
      newHistoryItem,
      ...history.filter(item => item.text !== decodedText)
    ].slice(0, 10);
    
    setHistory(updatedHistory);
  };

  const handleScanError = (error: string) => {
    console.error('QR Code scanning error:', error);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-100 to-purple-100'} p-4`}>
      <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} p-8 rounded-xl shadow-lg w-full max-w-4xl mx-auto`}>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">QR Code Generator</h1>
          <button 
            onClick={toggleDarkMode}
            className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 text-yellow-300' : 'bg-gray-200 text-gray-700'}`}
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>

        {showScanner ? (
          <div className="mb-6">
            <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              Scan QR Code
            </h2>
            <QrCodeScanner 
              onScanSuccess={handleScanSuccess}
              onScanError={handleScanError}
              onCancel={() => setShowScanner(false)}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter URL or text..."
                    value={inputText}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-700'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowScanner(true)}
                    className="absolute right-3 top-3 text-blue-500 hover:text-blue-700"
                    title="Scan QR Code"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="size" className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Size
                    </label>
                    <select
                      id="size"
                      value={size}
                      onChange={handleSizeChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-700'
                      }`}
                    >
                      <option value="100x100">Small (100x100)</option>
                      <option value="200x200">Medium (200x200)</option>
                      <option value="300x300">Large (300x300)</option>
                      <option value="400x400">Extra Large (400x400)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="errorCorrection" className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Error Correction
                    </label>
                    <select
                      id="errorCorrection"
                      value={errorCorrectionLevel}
                      onChange={handleErrorCorrectionChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-700'
                      }`}
                    >
                      <option value="L">Low (7%)</option>
                      <option value="M">Medium (15%)</option>
                      <option value="Q">Quartile (25%)</option>
                      <option value="H">High (30%)</option>
                    </select>
                  </div>
                </div>
                
                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                >
                  Generate QR Code
                </button>
              </form>
              
              {scannedResult && (
                <div className={`mt-4 p-3 rounded-lg ${darkMode ? 'bg-blue-900 text-blue-100' : 'bg-blue-50 text-blue-800'}`}>
                  <div className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="font-medium">Scanned QR Code:</p>
                      <p className="text-sm break-all">{scannedResult}</p>
                    </div>
                    <button 
                      onClick={() => setScannedResult(null)}
                      className={`ml-auto p-1 rounded-full ${darkMode ? 'hover:bg-blue-800' : 'hover:bg-blue-100'}`}
                      aria-label="Dismiss"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
              
              {qrCodeUrl && (
                <div className="mt-8 flex flex-col items-center">
                  <div className={`p-4 rounded-lg shadow-inner ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <img 
                      src={qrCodeUrl} 
                      alt="Generated QR Code" 
                      className={`mx-auto border-4 rounded-lg shadow-md ${darkMode ? 'border-gray-600' : 'border-white'}`}
                    />
                  </div>
                  <div className="mt-4 flex flex-col w-full">
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <button
                        onClick={handleDownload}
                        className="py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 flex items-center justify-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        Download
                      </button>
                      
                      <div className="relative">
                        <button
                          onClick={handleShare}
                          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 flex items-center justify-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                          </svg>
                          Share
                        </button>
                        
                        {showShareOptions && (
                          <div className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 ${darkMode ? 'bg-gray-700' : 'bg-white'} ring-1 ring-black ring-opacity-5 z-10`}>
                            <button
                              onClick={handleCopyToClipboard}
                              className={`block px-4 py-2 text-sm w-full text-left ${darkMode ? 'text-gray-200 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-100'}`}
                            >
                              Copy link to clipboard
                            </button>
                            <a 
                              href={`mailto:?subject=QR Code&body=Here's a QR code for: ${inputText}%0A${qrCodeUrl}`}
                              className={`block px-4 py-2 text-sm w-full text-left ${darkMode ? 'text-gray-200 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-100'}`}
                            >
                              Email
                            </a>
                            <a 
                              href={`https://twitter.com/intent/tweet?text=Check out this QR code&url=${encodeURIComponent(qrCodeUrl)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`block px-4 py-2 text-sm w-full text-left ${darkMode ? 'text-gray-200 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-100'}`}
                            >
                              Twitter
                            </a>
                            <button
                              onClick={() => setShowShareOptions(false)}
                              className={`block px-4 py-2 text-sm w-full text-left ${darkMode ? 'text-gray-200 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-100'}`}
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <p className={`text-sm text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Scan with any QR code reader
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            <div className={`${history.length > 0 ? 'block' : 'hidden'} border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-4 mt-4 md:mt-0 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold">History</h2>
                <button 
                  onClick={clearHistory}
                  className={`text-xs py-1 px-2 rounded ${darkMode ? 'bg-red-900 hover:bg-red-800 text-red-100' : 'bg-red-100 hover:bg-red-200 text-red-700'}`}
                >
                  Clear All
                </button>
              </div>
              <div className="overflow-y-auto max-h-80">
                {history.map((item) => (
                  <QrCodeHistoryItem 
                    key={item.timestamp}
                    url={item.url}
                    text={item.text}
                    onSelect={() => selectFromHistory(item)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QrCodeGenerator;
