'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Sparkles, X, Plus, Edit2, CloudUpload, ArrowLeft, Send, Bot, User, RefreshCw, AlertCircle, FileText, CheckCircle2, ExternalLink, Loader2 } from 'lucide-react';
import MetadataEditor from '@/components/review/MetadataEditor';
import TaskEditor from '@/components/review/TaskEditor';
import { JobDetail, MeetingMetadata, ExtractedTask } from '@/lib/types/meeting';
import { extractMetadata, updateJob, approveJob } from '@/lib/api/metadata';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function ReviewPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState('');
  const [metadata, setMetadata] = useState<MeetingMetadata>({
    participants: [],
    key_stakeholders: [],
  });
  const [extractedTasks, setExtractedTasks] = useState<ExtractedTask[]>([]);
  const [tags, setTags] = useState<string[]>(['議事録', '会議']);
  const [syncing, setSyncing] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'transcription' | 'summary' | 'metadata' | 'tasks'>('summary');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/jobs/${jobId}`);
        if (!res.ok) throw new Error('ジョブが見つかりませんでした');
        const data: JobDetail = await res.json();
        setJob(data);
        if (data.summary) setSummary(data.summary);
        if (data.metadata) setMetadata(data.metadata);
        if (data.extracted_tasks) setExtractedTasks(data.extracted_tasks);
      } catch (e) {
        setError(e instanceof Error ? e.message : '不明なエラー');
      } finally {
        setLoading(false);
      }
    };
    if (jobId) fetchJob();
  }, [jobId]);

  useEffect(() => {
    const createSession = async () => {
      // jobデータが読み込まれるまで待つ
      if (!jobId || !job || loading) return;
      
      // セッションが既に作成されている場合はスキップ
      if (sessionId) return;
      
      // 要約が生成されていない場合は待つ
      if (!job.summary) return;
      
      try {
        const res = await fetch(`${API_URL}/api/chat/sessions`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ job_id: jobId }),
        });
        if (res.ok) {
          const data = await res.json();
          setSessionId(data.session_id);
          setChatMessages([{ id: '1', role: 'assistant', content: '議事録ドラフトを確認しました。修正や追加のご要望があればお知らせください。' }]);
        }
      } catch (e) { console.error('Failed to create chat session:', e); }
    };
    createSession();
  }, [jobId, job, loading, sessionId]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages]);

  const handleSummarize = async () => {
    if (!job) return;
    setSummarizing(true);
    try {
      const res = await fetch(`${API_URL}/api/summarize`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_id: jobId, auto_extract_metadata: true }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.detail || '要約生成に失敗しました'); }
      const data = await res.json();
      setSummary(data.summary);
      setJob(prev => prev ? { ...prev, status: data.status, summary: data.summary } : null);
      
      // 要約完了後、自動的にメタデータ抽出を開始
      if (data.status === 'summarized') {
        setTimeout(() => handleExtractMetadata(), 1000);
      }
    } catch (e) { alert(`エラー: ${e instanceof Error ? e.message : '要約生成に失敗しました'}`); }
    finally { setSummarizing(false); }
  };

  const hasStartedAutoSummarize = useRef(false);
  useEffect(() => {
    if (job && job.status === 'transcribed' && !job.summary && !summarizing && !hasStartedAutoSummarize.current) {
      hasStartedAutoSummarize.current = true;
      handleSummarize();
    }
  }, [job, summarizing]);

  // MVP新機能: メタデータ抽出
  const handleExtractMetadata = async () => {
    if (!job) return;
    setExtracting(true);
    try {
      const result = await extractMetadata(jobId);
      setMetadata(result.metadata);
      setExtractedTasks(result.extracted_tasks);
      setJob(prev => prev ? { ...prev, status: result.status, metadata: result.metadata, extracted_tasks: result.extracted_tasks } : null);
      setActiveTab('metadata');
      alert(result.message);
    } catch (e) {
      alert(`メタデータ抽出エラー: ${e instanceof Error ? e.message : '不明なエラー'}`);
    } finally {
      setExtracting(false);
    }
  };

  // 要約を再生成（メタデータ・タスク抽出は行わない）
  const handleResummarize = async () => {
    if (!job) return;
    setSummarizing(true);
    try {
      const res = await fetch(`${API_URL}/api/summarize`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_id: jobId, auto_extract_metadata: false }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.detail || '要約生成に失敗しました'); }
      const data = await res.json();
      setSummary(data.summary);
      setJob(prev => prev ? { ...prev, summary: data.summary } : null);
    } catch (e) { alert(`エラー: ${e instanceof Error ? e.message : '要約生成に失敗しました'}`); }
    finally { setSummarizing(false); }
  };

  // MVP新機能: 変更を保存
  const handleSave = async () => {
    if (!job) return;
    setSaving(true);
    try {
      const updated = await updateJob(jobId, {
        summary,
        metadata,
        extracted_tasks: extractedTasks,
      });
      setJob(updated);
      alert('変更を保存しました');
    } catch (e) {
      alert(`保存エラー: ${e instanceof Error ? e.message : '不明なエラー'}`);
    } finally {
      setSaving(false);
    }
  };

  const sendMessage = async () => {
    if (!chatInput.trim() || isTyping || !sessionId) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: chatInput.trim() };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput(''); setIsTyping(true);
    try {
      const res = await fetch(`${API_URL}/api/chat/sessions/${sessionId}/messages`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg.content }),
      });
      if (res.ok) {
        const data = await res.json();
        setChatMessages(prev => [...prev, { id: data.message_id, role: 'assistant', content: data.content }]);
        // チャットリライトの結果を常にメインの要約に反映
        setSummary(data.content);
      } else { throw new Error('送信失敗'); }
    } catch { alert('メッセージの送信に失敗しました。'); }
    finally { setIsTyping(false); }
  };

  // MVP新機能: 承認
  const handleApprove = async () => {
    if (!job) return;
    
    if (!metadata.mtg_name || !metadata.meeting_date || !metadata.meeting_type) {
      alert('必須項目（MTG名、会議日、種別）を入力してください。');
      setActiveTab('metadata');
      return;
    }

    const confirmed = confirm('議事録を承認してNotionに投入しますか？\n\n承認後、以下の処理が実行されます：\n- Notion議事録DBに投入\n- タスクをNotion タスクDBに登録\n- Slack通知を送信');
    if (!confirmed) return;

    setSyncing(true);
    try {
      // 承認前に編集内容を保存
      await updateJob(jobId, {
        summary,
        metadata,
        extracted_tasks: extractedTasks,
      });
      
      const result = await approveJob(jobId, {
        register_tasks: true,
        send_notifications: true,
      });
      alert(result.message);
      
      // ステータスを更新
      setJob(prev => prev ? { ...prev, status: 'creating_notion' } : null);
      
      // ホーム画面（会議履歴）に遷移
      router.push('/');
    } catch (e) {
      alert(`承認エラー: ${e instanceof Error ? e.message : '不明なエラー'}`);
    } finally {
      setSyncing(false);
    }
  };

  const removeTag = (t: string) => setTags(tags.filter(tag => tag !== t));

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

  const needsSummarization = job.status === 'transcribed' && !job.summary;
  const needsMetadataExtraction = job.status === 'summarized' && !job.metadata;
  const isReviewing = job.status === 'reviewing';
  const isCompleted = job.status === 'completed';

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
            {job.status}
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
        {/* Left column: Content - スクロール可能 */}
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

            {/* Transcription Tab */}
            {activeTab === 'transcription' && job.transcription && (
              <div className="w-full p-4 sm:p-6 rounded-xl bg-slate-50 border border-slate-200 max-h-[400px] overflow-y-auto">
                <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">{job.transcription}</p>
              </div>
            )}

            {/* Summary Tab */}
            {activeTab === 'summary' && (
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

                {(job.summary || summary) && (
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
                        className="w-full bg-transparent border-0 p-0 text-sm sm:text-base leading-relaxed text-slate-800 placeholder:text-slate-400 focus:ring-0 resize-none h-[200px] sm:h-[240px] focus:outline-none disabled:opacity-70" 
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
            )}

            {/* Metadata Tab */}
            {activeTab === 'metadata' && (
              <MetadataEditor metadata={metadata} onChange={setMetadata} />
            )}

            {/* Tasks Tab */}
            {activeTab === 'tasks' && (
              <TaskEditor tasks={extractedTasks} onChange={setExtractedTasks} />
            )}
          </div>
        </div>

        {/* Right column: AI Chat & Actions - 画面に固定 */}
        <div className="w-full lg:w-96 bg-slate-50 flex flex-col shrink-0 order-1 lg:order-2 border-b lg:border-b-0 lg:border-l border-slate-200 max-h-[50vh] lg:max-h-full overflow-hidden">
          <div className="p-4 sm:p-6 flex flex-col flex-1 gap-4 sm:gap-6 overflow-hidden min-h-0">
            {/* AI Chat */}
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">AI要約修正アシスタント</label>
                <div className="flex items-center gap-1.5 text-emerald-600">
                  <Bot size={14} /><span className="text-[10px] font-medium">オンライン</span>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto bg-white rounded-xl border border-slate-200 p-3 mb-3 min-h-[150px]">
                <div className="flex flex-col gap-3">
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'}`}>
                        {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                      </div>
                      <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-800'}`}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex gap-2">
                      <div className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center bg-slate-100 text-slate-600"><Bot size={14} /></div>
                      <div className="px-3 py-2 rounded-xl bg-slate-100 text-slate-500 text-sm">
                        <span className="inline-flex gap-1">
                          <span className="animate-bounce">.</span>
                          <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>.</span>
                          <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>.</span>
                        </span>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
              </div>
              <div className="flex gap-2">
                <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()} placeholder="修正内容を入力..." className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all" />
                <button onClick={sendMessage} disabled={!chatInput.trim() || isTyping} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl transition-colors">
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Actions - 固定位置 */}
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
