'use client';

import { useParams } from 'next/navigation';
import { Sparkles, Edit2, ArrowLeft, RefreshCw, AlertCircle, FileText, CheckCircle2, ExternalLink, Loader2 } from 'lucide-react';
import MetadataEditor from '@/components/review/MetadataEditor';
import TaskEditor from '@/components/review/TaskEditor';
import ChatPanel from '@/components/review/ChatPanel';
import SummaryTab from '@/components/review/SummaryTab';
import { useReviewPage } from '@/hooks/useReviewPage';

export default function ReviewPage() {
  const params = useParams();
  const jobId = params.id as string;

  const {
    job, loading, error, summary, setSummary, metadata, setMetadata,
    extractedTasks, setExtractedTasks, syncing, summarizing, extracting, saving,
    activeTab, setActiveTab, chatMessages, chatInput, setChatInput, isTyping,
    chatEndRef, needsSummarization, needsMetadataExtraction, isReviewing, isCompleted,
    handleSummarize, handleResummarize, handleSave,
    sendMessage, handleApprove, router,
  } = useReviewPage(jobId);

  if (loading) return (
    <div className="flex-1 flex items-center justify-center h-screen">
      <RefreshCw className="animate-spin text-blue-600" size={32} />
    </div>
  );

  if (error || !job) return (
    <div className="flex-1 flex flex-col items-center justify-center h-screen gap-4">
      <AlertCircle className="text-red-500" size={48} />
      <p className="text-slate-700">{error || 'ジョブが見つかりませんでした'}</p>
      <button onClick={() => router.push('/')} className="text-blue-600 hover:underline">ホームに戻る</button>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-white animate-slide-in-from-right">

      {/* Header */}
      <div className="flex-none px-4 py-4 sm:px-8 sm:py-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white z-10 gap-4 sm:gap-0">
        <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <button onClick={() => router.push('/')} className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors shrink-0">
            <ArrowLeft size={20} />
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600 shrink-0"><Sparkles size={18} /></div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight truncate">議事録確認・修正</h2>
            </div>
            <p className="text-slate-500 text-xs sm:text-sm pl-0 sm:pl-10 mt-1 truncate">
              会議: <span className="font-medium text-slate-900">{job.filename}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 ring-1 ring-inset ring-slate-200">
            {{ transcribed: '文字起こし済み', summarized: '要約済み', extracting_metadata: 'メタデータ抽出中', reviewing: '確認・修正中', creating_notion: 'Notion投入中', completed: '完了', failed: 'エラー' }[job.status] || job.status}
          </div>
          {isReviewing && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
            >
              {saving ? <><Loader2 size={14} className="inline animate-spin mr-1" /> 保存中...</> : '変更を保存'}
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left column: Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 border-b lg:border-b-0 lg:border-r border-slate-100 order-2 lg:order-1">
          <div className="max-w-3xl mx-auto flex flex-col gap-6 sm:gap-8 pb-10">
            {/* Tabs */}
            <div className="flex gap-2 border-b border-slate-200 overflow-x-auto">
              <button onClick={() => setActiveTab('summary')} className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap ${activeTab === 'summary' ? 'text-blue-600 border-blue-600' : 'text-slate-500 border-transparent hover:text-slate-700'}`}>
                <Sparkles size={16} /> 要約
              </button>
              {job.transcription && (
                <button onClick={() => setActiveTab('transcription')} className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap ${activeTab === 'transcription' ? 'text-blue-600 border-blue-600' : 'text-slate-500 border-transparent hover:text-slate-700'}`}>
                  <FileText size={16} /> 文字起こし
                </button>
              )}
              {(job.metadata || isReviewing) && (
                <button onClick={() => setActiveTab('metadata')} className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap ${activeTab === 'metadata' ? 'text-blue-600 border-blue-600' : 'text-slate-500 border-transparent hover:text-slate-700'}`}>
                  <Edit2 size={16} /> メタデータ
                </button>
              )}
              {(job.extracted_tasks || isReviewing) && (
                <button onClick={() => setActiveTab('tasks')} className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap ${activeTab === 'tasks' ? 'text-blue-600 border-blue-600' : 'text-slate-500 border-transparent hover:text-slate-700'}`}>
                  <CheckCircle2 size={16} /> タスク ({extractedTasks.length})
                </button>
              )}
            </div>

            {activeTab === 'transcription' && job.transcription && (
              <div className="w-full p-4 sm:p-6 rounded-xl bg-slate-50 border border-slate-200 max-h-[400px] overflow-y-auto">
                <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">{job.transcription}</p>
              </div>
            )}

            {activeTab === 'summary' && (
              <SummaryTab
                summary={summary}
                setSummary={setSummary}
                needsSummarization={needsSummarization ?? false}
                needsMetadataExtraction={needsMetadataExtraction ?? false}
                extracting={extracting}
                summarizing={summarizing}
                isCompleted={isCompleted ?? false}
                handleSummarize={handleSummarize}
                handleResummarize={handleResummarize}
              />
            )}

            {activeTab === 'metadata' && (
              <MetadataEditor metadata={metadata} onChange={setMetadata} />
            )}

            {activeTab === 'tasks' && (
              <TaskEditor tasks={extractedTasks} onChange={setExtractedTasks} />
            )}
          </div>
        </div>

        {/* Right column: AI Chat & Actions */}
        <div className="w-full lg:w-96 bg-slate-50 flex flex-col shrink-0 order-1 lg:order-2 border-b lg:border-b-0 lg:border-l border-slate-200 max-h-[50vh] lg:max-h-full overflow-hidden">
          <div className="p-4 sm:p-6 flex flex-col flex-1 gap-4 sm:gap-6 overflow-hidden min-h-0">
            <ChatPanel
              chatMessages={chatMessages}
              chatInput={chatInput}
              setChatInput={setChatInput}
              isTyping={isTyping}
              sendMessage={sendMessage}
              chatEndRef={chatEndRef}
            />
          </div>

          {(isReviewing || isCompleted) && (
            <div className="flex-none p-4 sm:p-6 pt-0 sm:pt-0 border-t border-slate-200 bg-slate-50">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">アクション</label>

              {isCompleted && job.notion_page_url ? (
                <>
                  <div className="mb-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    <span className="text-sm text-emerald-800 font-medium">Notion同期済み</span>
                  </div>
                  <a href={job.notion_page_url} target="_blank" rel="noopener noreferrer" className="w-full py-3.5 sm:py-4 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5">
                    <ExternalLink size={20} /> Notionで表示
                  </a>
                </>
              ) : (
                <button onClick={handleApprove} disabled={syncing} className="w-full py-3.5 sm:py-4 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5">
                  {syncing ? <><Loader2 className="animate-spin" size={20} /> 処理中...</> : <><CheckCircle2 size={20} /> 承認してNotion投入</>}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
