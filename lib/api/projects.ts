import { API_URL } from '../config';

export interface NotionProject {
  id: string;
  name: string;
  status: string;
  importance: string;
  company_name?: string;
  amount?: number;
  expected_close_date?: string;
  start_date?: string;
  end_date?: string;
  url: string;
}

/**
 * Notion案件DBから案件一覧を取得する
 */
export async function getProjects(): Promise<NotionProject[]> {
  const res = await fetch(`${API_URL}/api/projects`);
  if (!res.ok) throw new Error('案件一覧の取得に失敗しました');
  return res.json();
}
