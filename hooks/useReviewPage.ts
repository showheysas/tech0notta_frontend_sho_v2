'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { JobDetail, MeetingMetadata, ExtractedTask } from '@/lib/types/meeting';
import { extractMetadata, updateJob, approveJob } from '@/lib/api/metadata';
import { fetchWithAuth } from '@/lib/api/client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export type ReviewTab = 'transcription' | 'summary' | 'metadata' | 'tasks';

export function useReviewPage(jobId: string) {
  const router = useRouter();

  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState('');
  const [metadata, setMetadata] = useState<MeetingMetadata>({
    participants: [],
    key_stakeholders: [],
  });
  const [extractedTasks, setExtractedTasks] = useState<ExtractedTask[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<ReviewTab>('summary');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const hasStartedAutoSummarize = useRef(false);

  // ジョブデータ取得
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

  // チャットセッション作成
  useEffect(() => {
    const createSession = async () => {
      if (!jobId || !job || loading) return;
      if (sessionId) return;
      if (!job.summary) return;

      try {
        const res = await fetchWithAuth('/api/chat/sessions', {
          method: 'POST',
          body: JSON.stringify({ job_id: jobId }),
        });
        const data = await res.json();
        setSessionId(data.session_id);
        setChatMessages([{ id: '1', role: 'assistant', content: '議事録ドラフトを確認しました。修正や追加のご要望があればお知らせください。' }]);
      } catch (e) { console.error('Failed to create chat session:', e); }
    };
    createSession();
  }, [jobId, job, loading, sessionId]);

  // チャットスクロール
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

      if (data.status === 'summarized') {
        setTimeout(() => handleExtractMetadata(), 1000);
      }
    } catch (e) { alert(`エラー: ${e instanceof Error ? e.message : '要約生成に失敗しました'}`); }
    finally { setSummarizing(false); }
  };

  // 自動要約開始
  useEffect(() => {
    if (job && job.status === 'transcribed' && !job.summary && !summarizing && !hasStartedAutoSummarize.current) {
      hasStartedAutoSummarize.current = true;
      handleSummarize();
    }
  }, [job, summarizing]);

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
      const res = await fetchWithAuth(`/api/chat/sessions/${sessionId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ message: userMsg.content }),
      });
      const data = await res.json();
      setChatMessages(prev => [...prev, { id: data.message_id, role: 'assistant', content: data.content }]);
      setSummary(data.content);
    } catch { alert('メッセージの送信に失敗しました。'); }
    finally { setIsTyping(false); }
  };

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
      await updateJob(jobId, {
        summary,
        metadata,
        extracted_tasks: extractedTasks,
      });

      const result = await approveJob(jobId, {
        register_tasks: true,
        send_notifications: true,
        project_id: metadata.project_id,
      });
      alert(result.message);

      setJob(prev => prev ? { ...prev, status: 'creating_notion' } : null);
      router.push('/');
    } catch (e) {
      alert(`承認エラー: ${e instanceof Error ? e.message : '不明なエラー'}`);
    } finally {
      setSyncing(false);
    }
  };

  const needsSummarization = job?.status === 'transcribed' && !job?.summary;
  const needsMetadataExtraction = job?.status === 'summarized' && !job?.metadata;
  const isReviewing = job?.status === 'reviewing';
  const isCompleted = job?.status === 'completed';

  return {
    job, loading, error, summary, setSummary, metadata, setMetadata,
    extractedTasks, setExtractedTasks, syncing, summarizing, extracting, saving,
    activeTab, setActiveTab, chatMessages, chatInput, setChatInput, isTyping,
    chatEndRef, needsSummarization, needsMetadataExtraction, isReviewing, isCompleted,
    handleSummarize, handleExtractMetadata, handleResummarize, handleSave,
    sendMessage, handleApprove, router,
  };
}
