import NextAuth from "next-auth"
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id"
import Credentials from "next-auth/providers/credentials"

const isDev = process.env.NODE_ENV === "development"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    MicrosoftEntraID({
      clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID!,
      clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET!,
      tenantId: process.env.AUTH_MICROSOFT_ENTRA_ID_TENANT_ID!,
      authorization: {
        params: {
          scope: "openid profile email offline_access User.Read",
        },
      },
    }),
    ...(isDev
      ? [
          Credentials({
            id: "dev-test",
            name: "テストユーザー（開発用）",
            credentials: {},
            async authorize() {
              return {
                id: "dev-test-user-00000000-0000-0000-0000-000000000000",
                name: "テスト ユーザー",
                email: "test@dev.local",
              }
            },
          }),
        ]
      : []),
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      if (account) {
        token.accessToken = account.access_token
        token.expiresAt = account.expires_at
      }
      if (user?.email === "test@dev.local") {
        token.accessToken = "dev-test-token"
      }
      return token
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
})
