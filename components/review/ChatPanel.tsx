'use client';

import { RefObject } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { ChatMessage } from '@/hooks/useReviewPage';

interface ChatPanelProps {
  chatMessages: ChatMessage[];
  chatInput: string;
  setChatInput: (value: string) => void;
  isTyping: boolean;
  sendMessage: () => void;
  chatEndRef: RefObject<HTMLDivElement | null>;
}

export default function ChatPanel({
  chatMessages, chatInput, setChatInput, isTyping, sendMessage, chatEndRef,
}: ChatPanelProps) {
  return (
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
  );
}
