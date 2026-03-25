'use client';

import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export default function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] gap-4 p-8">
      <AlertCircle className="text-red-500" size={48} />
      <h2 className="text-lg font-bold text-slate-900">エラーが発生しました</h2>
      <p className="text-sm text-slate-600 text-center max-w-md">
        {error.message || '予期しないエラーが発生しました。'}
      </p>
      <button
        onClick={resetErrorBoundary}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
      >
        <RefreshCw size={16} />
        再試行
      </button>
    </div>
  );
}
