'use client'

import { signIn } from 'next-auth/react'

export default function DevTestButton() {
  return (
    <div className="mt-6 pt-6 border-t border-slate-100">
      <p className="text-xs text-slate-400 mb-3">開発用</p>
      <button
        type="button"
        onClick={() => signIn('dev-test', { callbackUrl: '/' })}
        className="w-full py-2.5 px-6 bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium rounded-xl transition-colors text-sm border border-slate-200"
      >
        テスト用アクセス（Azure AD 不要）
      </button>
    </div>
  )
}
