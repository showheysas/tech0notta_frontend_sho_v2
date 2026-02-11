import { API_URL } from '../config';
import { JobDetail, MeetingMetadata, ExtractedTask } from '../types/meeting';

/**
 * メタデータとタスクを自動抽出する
 * MVP新機能: POST /api/jobs/{job_id}/extract-metadata
 */
export async function extractMetadata(jobId: string): Promise<{
  job_id: string;
  status: string;
  metadata: MeetingMetadata;
  extracted_tasks: ExtractedTask[];
  message: string;
}> {
  const res = await fetch(`${API_URL}/api/jobs/${jobId}/extract-metadata`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'メタデータ抽出に失敗しました');
  }
  
  return res.json();
}

/**
 * Jobの内容を更新する
 * MVP新機能: PUT /api/jobs/{job_id}
 */
export async function updateJob(
  jobId: string,
  data: {
    summary?: string;
    metadata?: MeetingMetadata;
    extracted_tasks?: ExtractedTask[];
  }
): Promise<JobDetail> {
  const res = await fetch(`${API_URL}/api/jobs/${jobId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Job更新に失敗しました');
  }
  
  return res.json();
}

/**
 * 議事録を承認する
 * MVP新機能: POST /api/jobs/{job_id}/approve
 */
export async function approveJob(
  jobId: string,
  options: {
    register_tasks?: boolean;
    send_notifications?: boolean;
    project_id?: string;
  } = {}
): Promise<{
  job_id: string;
  status: string;
  notion_page_url?: string;
  tasks_registered: number;
  notifications_sent: number;
  message: string;
}> {
  const res = await fetch(`${API_URL}/api/jobs/${jobId}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      register_tasks: options.register_tasks ?? true,
      send_notifications: options.send_notifications ?? true,
      project_id: options.project_id,
    }),
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || '承認に失敗しました');
  }
  
  return res.json();
}
