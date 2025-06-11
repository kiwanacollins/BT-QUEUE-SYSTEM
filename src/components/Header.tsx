import React from 'react';
import { Headphones, Download, Trash2 } from 'lucide-react';

interface HeaderProps {
  onExportData: () => void;
  onClearQueue: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onExportData, onClearQueue }) => {
  const handleClearQueue = () => {
    if (window.confirm('Are you sure you want to clear the entire queue? This action cannot be undone.')) {
      onClearQueue();
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-purple-600 p-2 rounded-lg">
              <Headphones className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">BT Repair Centre</h1>
              <p className="text-gray-600">Queue Management System</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onExportData}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200"
              title="Export queue data"
            >
              <Download className="w-4 h-4" />
              <span className="font-medium">Export</span>
            </button>

            <button
              onClick={handleClearQueue}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
              title="Clear entire queue"
            >
              <Trash2 className="w-4 h-4" />
              <span className="font-medium">Clear Queue</span>
            </button>

            {/* <div className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-medium">Offline Ready</span>
            </div> */}
          </div>
        </div>
      </div>
    </header>
  );
};