import React from 'react';
import { Package } from 'lucide-react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gray-50">
      <Package size={48} className="text-primary-600 animate-pulse" />
      <h1 className="mt-4 text-xl font-semibold text-gray-700">WholeFlow ERP</h1>
      <div className="mt-4 flex items-center justify-center">
        <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-primary-600 animate-progress"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;