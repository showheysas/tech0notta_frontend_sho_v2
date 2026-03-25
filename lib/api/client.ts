/**
 * 認証付き fetch ユーティリティ
 * Authorization: Bearer <access_token> ヘッダーを自動付与する。
 * レスポンスが ok でない場合は ApiError を throw する。
 */
import { getSession } from "next-auth/react"
import { API_URL } from "../config"
import { ApiError } from "./errors"

export async function fetchWithAuth(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const session = await getSession()

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  }

  if (session?.accessToken) {
    headers["Authorization"] = `Bearer ${session.accessToken}`
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  })

  if (!res.ok) {
    let detail = `HTTP ${res.status}`
    try {
      const body = await res.json()
      detail = body.detail || body.message || detail
    } catch {
      // レスポンスボディがJSONでない場合はステータステキストを使用
      detail = res.statusText || detail
    }
    throw new ApiError(res.status, detail)
  }

  return res
}
