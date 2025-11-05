import React from 'react';

interface QrCodeHistoryItemProps {
  url: string;
  text: string;
  onSelect: () => void;
}

const QrCodeHistoryItem: React.FC<QrCodeHistoryItemProps> = ({ url, text, onSelect }) => {
  return (
    <div 
      className="flex items-center p-2 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer mb-2 dark:bg-gray-800"
      onClick={onSelect}
    >
      <div className="flex-shrink-0 h-12 w-12 mr-3">
        <img src={url} alt="QR Code thumbnail" className="h-full w-full" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
          {text.length > 25 ? text.substring(0, 25) + '...' : text}
        </p>
      </div>
    </div>
  );
};

export default QrCodeHistoryItem;