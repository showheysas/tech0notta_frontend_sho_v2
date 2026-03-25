/**
 * API エラークラス
 * fetchWithAuth から throw される統一エラー型
 */
export class ApiError extends Error {
  status: number;
  detail: string;

  constructor(status: number, detail: string) {
    super(detail);
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail;
  }

  /** 401 Unauthorized */
  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  /** 403 Forbidden */
  get isForbidden(): boolean {
    return this.status === 403;
  }

  /** 404 Not Found */
  get isNotFound(): boolean {
    return this.status === 404;
  }
}
