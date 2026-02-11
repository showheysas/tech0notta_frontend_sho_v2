'use client';

import { useState } from 'react';
import { CheckSquare, Plus, Trash2, Calendar, User } from 'lucide-react';
import { ExtractedTask } from '@/lib/types/meeting';

interface TaskEditorProps {
  tasks: ExtractedTask[];
  onChange: (tasks: ExtractedTask[]) => void;
}

const PRIORITY_OPTIONS = ['高', '中', '低'];

export default function TaskEditor({ tasks, onChange }: TaskEditorProps) {
  const [localTasks, setLocalTasks] = useState<ExtractedTask[]>(tasks);

  const handleTaskChange = (index: number, field: keyof ExtractedTask, value: any) => {
    const updated = [...localTasks];
    updated[index] = { ...updated[index], [field]: value };
    setLocalTasks(updated);
    onChange(updated);
  };

  const handleAddTask = () => {
    const newTask: ExtractedTask = {
      title: '',
      description: '',
      assignee: '未割り当て',
      due_date: '',
      priority: '中',
    };
    const updated = [...localTasks, newTask];
    setLocalTasks(updated);
    onChange(updated);
  };

  const handleRemoveTask = (index: number) => {
    const updated = localTasks.filter((_, i) => i !== index);
    setLocalTasks(updated);
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CheckSquare size={18} className="text-blue-600" />
          <h3 className="text-sm font-bold text-slate-700">抽出されたタスク</h3>
          <span className="text-xs text-slate-500">({localTasks.length}件)</span>
        </div>
        <button
          onClick={handleAddTask}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-medium transition-colors"
        >
          <Plus size={14} /> タスク追加
        </button>
      </div>

      {localTasks.length === 0 ? (
        <div className="text-center py-8 text-slate-500 text-sm">
          タスクが抽出されていません。「タスク追加」ボタンから手動で追加できます。
        </div>
      ) : (
        <div className="space-y-3">
          {localTasks.map((task, index) => (
            <div
              key={index}
              className="p-4 rounded-lg border border-slate-200 bg-white hover:border-blue-300 transition-colors space-y-3"
            >
              {/* タスク名 */}
              <div className="flex items-start gap-2">
                <input
                  type="text"
                  value={task.title}
                  onChange={(e) => handleTaskChange(index, 'title', e.target.value)}
                  placeholder="タスク名"
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
                />
                <button
                  onClick={() => handleRemoveTask(index)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="削除"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* 説明 */}
              <textarea
                value={task.description || ''}
                onChange={(e) => handleTaskChange(index, 'description', e.target.value)}
                placeholder="タスクの詳細説明"
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all resize-none"
              />

              {/* 担当者・期限・優先度 */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1 flex items-center gap-1">
                    <User size={12} /> 担当者
                  </label>
                  <input
                    type="text"
                    value={task.assignee}
                    onChange={(e) => handleTaskChange(index, 'assignee', e.target.value)}
                    placeholder="未割り当て"
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1 flex items-center gap-1">
                    <Calendar size={12} /> 期限
                  </label>
                  <input
                    type="date"
                    value={task.due_date || ''}
                    onChange={(e) => handleTaskChange(index, 'due_date', e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    優先度
                  </label>
                  <select
                    value={task.priority}
                    onChange={(e) => handleTaskChange(index, 'priority', e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
                  >
                    {PRIORITY_OPTIONS.map(priority => (
                      <option key={priority} value={priority}>{priority}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
