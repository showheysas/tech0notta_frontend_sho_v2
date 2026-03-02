'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Square, Mic, AlertCircle, Home } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

interface Segment {
  id: string;
  speaker: string;
  speakerId?: string;
  text: string;
  time: string;
  initials: string;
  colorClass: string;
}

export default function LivePage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.session_id as string;

  const [segments, setSegments] = useState<Segment[]>([]);
  const [segmentCount, setSegmentCount] = useState(0);
  const [meetingTopic, setMeetingTopic] = useState('会議中...');
  const [botStatus, setBotStatus] = useState<string>('in_meeting');
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isEnding, setIsEnding] = useState(false);

  const lastSegmentIdRef = useRef<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<number>(Date.now());

  // 経過時間タイマー
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatElapsed = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // セグメントポーリング
  useEffect(() => {
    const poll = async () => {
      try {
        const url = lastSegmentIdRef.current
          ? `${API_URL}/api/live/segments/${sessionId}?since_id=${lastSegmentIdRef.current}`
          : `${API_URL}/api/live/segments/${sessionId}`;
        const res = await fetch(url);
        if (!res.ok) return;
        const data = await res.json();

        setMeetingTopic(data.session.meeting_topic);
        setSegmentCount(data.session.segment_count);

        if (data.segments.length > 0) {
          setSegments(prev => [...prev, ...data.segments]);
          lastSegmentIdRef.current = data.segments[data.segments.length - 1].id;
        }
      } catch {
        // ポーリングエラーは無視
      }
    };

    poll();
    const interval = setInterval(poll, 1000);
    return () => clearInterval(interval);
  }, [sessionId]);

  // Botステータスポーリング
  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch(`${API_URL}/api/bot/${sessionId}/status`);
        if (!res.ok) return;
        const data = await res.json();
        setBotStatus(data.status);

        if (data.status === 'error') {
          setError(data.error_message || 'Botにエラーが発生しました');
        } else if (data.status === 'completed') {
          handleEnd();
        }
      } catch {
        // ポーリングエラーは無視
      }
    };

    const interval = setInterval(poll, 1000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  // 下部自動スクロール
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [segments]);

  const handleEnd = useCallback(async () => {
    if (isEnding) return;
    setIsEnding(true);

    try {
      // 1. finalize: LiveSession → Job
      const finalizeRes = await fetch(`${API_URL}/api/live/segments/${sessionId}/finalize`, {
        method: 'POST',
      });
      const finalizeData = finalizeRes.ok ? await finalizeRes.json() : null;
      const jobId = finalizeData?.job_id;

      // 2. Bot終了
      await fetch(`${API_URL}/api/bot/${sessionId}/terminate`, { method: 'POST' });

      // 3. リダイレクト
      if (jobId) {
        router.push(`/review/${jobId}`);
      } else {
        router.push('/');
      }
    } catch {
      setError('会議終了処理中にエラーが発生しました');
      setIsEnding(false);
    }
  }, [isEnding, sessionId, router]);

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* ヘッダー */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-semibold text-red-500 uppercase tracking-wider">録音中</span>
          </div>
          <h1 className="font-bold text-slate-900 truncate max-w-xs sm:max-w-md">{meetingTopic}</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1.5">
              <Mic size={14} className="text-slate-400" />
              {segmentCount} 件
            </span>
            <span className="font-mono">{formatElapsed(elapsed)}</span>
          </div>
          <button
            onClick={handleEnd}
            disabled={isEnding}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white font-medium rounded-lg text-sm transition-colors"
          >
            <Square size={14} />
            {isEnding ? '終了処理中...' : '会議を終了'}
          </button>
        </div>
      </div>

      {/* モバイル用ステータス */}
      <div className="sm:hidden bg-slate-100 px-6 py-2 flex items-center gap-4 text-xs text-slate-500 flex-shrink-0">
        <span>{segmentCount} 件</span>
        <span className="font-mono">{formatElapsed(elapsed)}</span>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 flex-shrink-0">
          <AlertCircle size={18} />
          <span className="text-sm font-medium flex-1">{error}</span>
          <button onClick={() => router.push('/')} className="flex items-center gap-1 text-xs underline">
            <Home size={12} /> ホームへ
          </button>
        </div>
      )}

      {/* 文字起こし表示 */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-3">
        {segments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
            <Mic size={32} className="animate-pulse" />
            <p className="text-sm">音声を検出すると文字起こしが表示されます</p>
          </div>
        ) : (
          segments.map((seg) => (
            <div key={seg.id} className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${seg.colorClass || 'bg-slate-100 text-slate-600'}`}>
                {seg.initials || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-0.5">
                  <span className="text-xs font-semibold text-slate-700">{seg.speaker}</span>
                  <span className="text-xs text-slate-400">{seg.time}</span>
                </div>
                <p className="text-sm text-slate-800 leading-relaxed">{seg.text}</p>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* フッター */}
      <div className="bg-white border-t border-slate-100 px-6 py-3 flex-shrink-0">
        <p className="text-xs text-slate-400 text-center">
          リアルタイム文字起こし中 · Botステータス: <span className="font-medium text-slate-500">{botStatus}</span>
        </p>
      </div>
    </div>
  );
}
