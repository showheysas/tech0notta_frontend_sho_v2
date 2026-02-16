'use client';

import { useState, useEffect } from 'react';
import { Calendar, Users, Briefcase, Tag, Building2 } from 'lucide-react';
import { MeetingMetadata } from '@/lib/types/meeting';
import { getProjects, NotionProject } from '@/lib/api/projects';

interface MetadataEditorProps {
  metadata: MeetingMetadata;
  onChange: (metadata: MeetingMetadata) => void;
}

const MEETING_TYPES = ['定例', '商談', '社内', 'キックオフ', 'レビュー', 'その他'];
const TEAM_OPTIONS = ['営業', '開発', '企画', '経営', 'その他'];

export default function MetadataEditor({ metadata, onChange }: MetadataEditorProps) {
  const [localMetadata, setLocalMetadata] = useState<MeetingMetadata>(metadata);
  const [projects, setProjects] = useState<NotionProject[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);

  // Notion案件一覧を取得
  useEffect(() => {
    const fetchProjects = async () => {
      setProjectsLoading(true);
      try {
        const data = await getProjects();
        setProjects(data);
      } catch (e) {
        console.error('案件一覧の取得に失敗:', e);
      } finally {
        setProjectsLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const handleChange = (field: keyof MeetingMetadata, value: any) => {
    const updated = { ...localMetadata, [field]: value };
    setLocalMetadata(updated);
    onChange(updated);
  };

  const handleProjectSelect = (projectId: string) => {
    const selected = projects.find(p => p.id === projectId);
    const updated = {
      ...localMetadata,
      project_id: projectId || undefined,
      project: selected?.name || '',
    };
    setLocalMetadata(updated);
    onChange(updated);
  };

  const handleParticipantsChange = (value: string) => {
    const participants = value.split(',').map(p => p.trim()).filter(p => p);
    handleChange('participants', participants);
  };

  const handleStakeholdersChange = (value: string) => {
    const stakeholders = value.split(',').map(s => s.trim()).filter(s => s);
    handleChange('key_stakeholders', stakeholders);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Tag size={18} className="text-blue-600" />
        <h3 className="text-sm font-bold text-slate-700">メタデータ</h3>
      </div>

      {/* MTG名 */}
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1.5">
          MTG名 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={localMetadata.mtg_name || ''}
          onChange={(e) => handleChange('mtg_name', e.target.value)}
          placeholder="例: QTnet案件 定例会議"
          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
        />
      </div>

      {/* 参加者 */}
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1.5 flex items-center gap-1.5">
          <Users size={14} /> 参加者（カンマ区切り）
        </label>
        <input
          type="text"
          value={localMetadata.participants.join(', ')}
          onChange={(e) => handleParticipantsChange(e.target.value)}
          placeholder="例: 田中, 佐藤, 鈴木"
          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
        />
      </div>

      {/* 企業名 */}
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1.5 flex items-center gap-1.5">
          <Building2 size={14} /> 企業名
        </label>
        <input
          type="text"
          value={localMetadata.company_name || ''}
          onChange={(e) => handleChange('company_name', e.target.value)}
          placeholder="例: QTnet株式会社"
          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
        />
      </div>

      {/* 会議日 */}
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1.5 flex items-center gap-1.5">
          <Calendar size={14} /> 会議日 <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          value={localMetadata.meeting_date || ''}
          onChange={(e) => handleChange('meeting_date', e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
        />
      </div>

      {/* 種別 */}
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1.5">
          種別 <span className="text-red-500">*</span>
        </label>
        <select
          value={localMetadata.meeting_type || ''}
          onChange={(e) => handleChange('meeting_type', e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
        >
          <option value="">選択してください</option>
          {MEETING_TYPES.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      {/* 案件（Notion案件DBから選択） */}
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1.5 flex items-center gap-1.5">
          <Briefcase size={14} /> 案件
        </label>
        <select
          value={localMetadata.project_id || ''}
          onChange={(e) => handleProjectSelect(e.target.value)}
          disabled={projectsLoading}
          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all disabled:opacity-50"
        >
          <option value="">
            {projectsLoading ? '読み込み中...' : '案件を選択（任意）'}
          </option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>
              {p.name}{p.status ? ` [${p.status}]` : ''}{p.company_name ? ` - ${p.company_name}` : ''}
            </option>
          ))}
        </select>
        {localMetadata.project_id && (
          <p className="text-xs text-blue-600 mt-1">
            選択中: {projects.find(p => p.id === localMetadata.project_id)?.name || localMetadata.project}
          </p>
        )}
      </div>

      {/* 重要共有者 */}
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1.5">
          重要共有者（カンマ区切り）
        </label>
        <input
          type="text"
          value={localMetadata.key_stakeholders.join(', ')}
          onChange={(e) => handleStakeholdersChange(e.target.value)}
          placeholder="例: 田中, 佐藤"
          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
        />
      </div>

      {/* 重要共有チーム */}
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1.5 flex items-center gap-1.5">
          <Building2 size={14} /> 重要共有チーム
        </label>
        <select
          value={localMetadata.key_team || ''}
          onChange={(e) => handleChange('key_team', e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
        >
          <option value="">選択してください</option>
          {TEAM_OPTIONS.map(team => (
            <option key={team} value={team}>{team}</option>
          ))}
        </select>
      </div>

      {/* 検索ワード */}
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1.5">
          検索ワード
        </label>
        <input
          type="text"
          value={localMetadata.search_keywords || ''}
          onChange={(e) => handleChange('search_keywords', e.target.value)}
          placeholder="例: QTnet, 提案, 見積もり"
          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
        />
        <p className="text-xs text-slate-500 mt-1">AIが自動生成したキーワードです。必要に応じて編集してください。</p>
      </div>
    </div>
  );
}
