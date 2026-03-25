import { signIn } from "@/auth"
import DevTestButton from "./DevTestButton"

const isDev = process.env.NODE_ENV === "development"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-12 w-full max-w-md text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Tech Notta</h1>
        </div>

        <p className="text-slate-600 mb-2 font-medium">会議議事録 AI アシスタント</p>
        <p className="text-slate-400 text-sm mb-8">
          組織のAzureアカウントでログインしてください
        </p>

        <form
          action={async () => {
            "use server"
            await signIn("microsoft-entra-id", { redirectTo: "/" })
          }}
        >
          <button
            type="submit"
            className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-3 shadow-sm"
          >
            <svg width="20" height="20" viewBox="0 0 21 21" fill="none">
              <rect x="1" y="1" width="9" height="9" fill="#F25022" />
              <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
              <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
              <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
            </svg>
            Microsoftアカウントでログイン
          </button>
        </form>

        {isDev && <DevTestButton />}
      </div>
    </div>
  )
}
