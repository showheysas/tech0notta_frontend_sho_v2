/**
 * 日付ユーティリティ
 *
 * 全ての日付表示を JST (Asia/Tokyo) で統一する。
 * バックエンドからのタイムスタンプは ISO 文字列で届くため、
 * 表示時に Asia/Tokyo タイムゾーンでフォーマットする。
 */

const JST_TIMEZONE = 'Asia/Tokyo';

/**
 * 日付文字列を JST でフォーマットする
 * 例: "2026年03月04日 14:30"
 *
 * @param dateStr - ISO 8601 日付文字列 (バックエンドからの created_at 等)
 * @returns JST でフォーマットされた文字列
 */
export function formatDateTimeJST(dateStr: string): string {
  const date = new Date(
    dateStr.endsWith('Z') || dateStr.includes('+') ? dateStr : `${dateStr}+09:00`
  );

  return date.toLocaleString('ja-JP', {
    timeZone: JST_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).replace(/\//g, '年').replace(' ', '日 ').replace(/(\d{2}日)/, '$1')
    // toLocaleString returns "2026/03/04 14:30", convert to "2026年03月04日 14:30"
    ;
}

/**
 * 日付文字列を JST の "yyyy年MM月dd日 HH:mm" 形式にフォーマットする
 *
 * @param dateStr - ISO 8601 日付文字列
 * @returns "yyyy年MM月dd日 HH:mm" 形式の文字列
 */
export function formatDateJST(dateStr: string): string {
  const date = new Date(
    dateStr.endsWith('Z') || dateStr.includes('+') ? dateStr : `${dateStr}+09:00`
  );

  const formatter = new Intl.DateTimeFormat('ja-JP', {
    timeZone: JST_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const get = (type: string) => parts.find(p => p.type === type)?.value || '';

  return `${get('year')}年${get('month')}月${get('day')}日 ${get('hour')}:${get('minute')}`;
}

/**
 * 日付文字列を JST の "HH:mm" 形式にフォーマットする（時刻のみ）
 *
 * @param dateStr - ISO 8601 日付文字列
 * @returns "HH:mm" 形式の文字列
 */
export function formatTimeJST(dateStr: string): string {
  const date = new Date(
    dateStr.endsWith('Z') || dateStr.includes('+') ? dateStr : `${dateStr}+09:00`
  );

  return date.toLocaleTimeString('ja-JP', {
    timeZone: JST_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}
