'use client';

import { Sparkles, RefreshCw } from 'lucide-react';

interface SummaryTabProps {
  summary: string;
  setSummary: (value: string) => void;
  needsSummarization: boolean;
  needsMetadataExtraction: boolean;
  extracting: boolean;
  summarizing: boolean;
  isCompleted: boolean;
  handleSummarize: () => void;
  handleResummarize: () => void;
}

export default function SummaryTab({
  summary, setSummary, needsSummarization, needsMetadataExtraction,
  extracting, summarizing, isCompleted, handleSummarize, handleResummarize,
}: SummaryTabProps) {
  return (
    <>
      {needsSummarization && (
        <div className="flex flex-col gap-3 p-6 rounded-xl bg-blue-50 border border-blue-200">
          <p className="text-sm text-blue-800">文字起こしが完了しました。次に要約を生成してください。</p>
          <button onClick={handleSummarize} disabled={summarizing} className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors">
            {summarizing ? <><RefreshCw className="animate-spin" size={18} /> 要約生成中...</> : <><Sparkles size={18} /> 要約を生成</>}
          </button>
        </div>
      )}

      {needsMetadataExtraction && !extracting && (
        <div className="flex flex-col gap-3 p-6 rounded-xl bg-emerald-50 border border-emerald-200">
          <p className="text-sm text-emerald-800">要約が完了しました。メタデータとタスクを抽出しています...</p>
        </div>
      )}

      {extracting && (
        <div className="flex flex-col gap-3 p-6 rounded-xl bg-emerald-50 border border-emerald-200">
          <p className="text-sm text-emerald-800">要約が完了しました。メタデータとタスクを抽出しています...</p>
          <div className="w-full py-3 px-4 bg-emerald-600 text-white font-bold rounded-xl flex items-center justify-center gap-2">
            <RefreshCw className="animate-spin" size={18} /> 抽出中...
          </div>
        </div>
      )}

      {summary && (
        <div className="flex flex-col gap-3">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex justify-between items-end">
            エグゼクティブサマリー
            <span className="text-[10px] normal-case font-normal text-slate-400">{isCompleted ? '閲覧のみ' : 'クリックして編集'}</span>
          </label>
          <div className="w-full p-4 sm:p-6 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-300 hover:bg-white focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-500 transition-all">
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              disabled={isCompleted}
              className="w-full bg-transparent border-0 p-0 text-sm sm:text-base leading-relaxed text-slate-800 placeholder:text-slate-400 focus:ring-0 resize-none h-[400px] sm:h-[500px] focus:outline-none disabled:opacity-70"
              spellCheck={false}
            />
          </div>
          {!isCompleted && (
            <button
              onClick={handleResummarize}
              disabled={summarizing}
              className="self-start px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {summarizing ? <><RefreshCw className="animate-spin" size={14} /> 再生成中...</> : <><RefreshCw size={14} /> 要約を再生成</>}
            </button>
          )}
        </div>
      )}
    </>
  );
}
