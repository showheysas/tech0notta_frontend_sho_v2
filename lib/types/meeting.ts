/**
 * Meeting status enum representing all possible states of a meeting/job
 */
export enum MeetingStatus {
  UPLOADING = 'UPLOADING',           // アップロード中
  UPLOADED = 'UPLOADED',             // アップロード完了
  EXTRACTING_AUDIO = 'EXTRACTING_AUDIO', // 音声抽出中
  TRANSCRIBING = 'TRANSCRIBING',     // 文字起こし中
  SUMMARIZING = 'SUMMARIZING',       // 要約生成中
  EXTRACTING_METADATA = 'EXTRACTING_METADATA', // メタデータ抽出中（MVP新機能）
  REVIEWING = 'REVIEWING',           // 確認・修正中（MVP新機能）
  CREATING_NOTION = 'CREATING_NOTION', // Notion作成中
  PENDING = 'PENDING',               // レビュー待ち
  SYNCED = 'SYNCED',                 // 同期済み
  PROCESSING = 'PROCESSING',         // 処理中（汎用）
  LIVE = 'LIVE',                     // ライブ中
  FAILED = 'FAILED'                  // 失敗
}

/**
 * Meeting interface representing a meeting/job in the system
 */
export interface Meeting {
  id: string;
  title: string;
  date: string;
  status: MeetingStatus;
  duration?: string;
  originalFileType?: 'audio' | 'video';
  audioFileUrl?: string;
  notionPageUrl?: string;
}

/**
 * Response from the upload API endpoint
 */
export interface UploadResponse {
  job_id: string;
  filename: string;
  status: MeetingStatus;
  original_file_type: 'audio' | 'video';
}

/**
 * Error response from the upload API endpoint
 */
export interface UploadError {
  detail: string;
  code?: string;
}

/**
 * Meeting metadata extracted from the meeting summary
 * MVP新機能: 議事録メタデータ
 */
export interface MeetingMetadata {
  mtg_name?: string;
  participants: string[];
  company_name?: string;
  meeting_date?: string;
  meeting_type?: string;
  project?: string;
  project_id?: string;  // Notion案件ページID
  key_stakeholders: string[];
  key_team?: string;
  search_keywords?: string;
  is_knowledge?: boolean;
  materials_url?: string;
  notes?: string;
  related_meetings?: string[];
}

/**
 * Extracted task from meeting summary
 * MVP新機能: 抽出されたタスク
 */
export interface ExtractedTask {
  title: string;
  description?: string;
  assignee: string;
  due_date?: string;
  priority: string;
  is_abstract?: boolean;
}

/**
 * Job detail with metadata and extracted tasks
 * MVP新機能: メタデータとタスクを含むJob詳細
 */
export interface JobDetail {
  id: number;
  job_id: string;
  filename: string;
  file_size: number;
  status: string;
  created_at: string;
  updated_at?: string;
  notion_page_url?: string;
  duration?: number;
  last_viewed_at?: string;
  transcription?: string;
  summary?: string;
  metadata?: MeetingMetadata;
  extracted_tasks?: ExtractedTask[];
  meeting_date?: string;
  error_message?: string;
}
