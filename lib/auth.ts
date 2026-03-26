import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions['adapter'],
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { empresa: { include: { prestador: true } } },
        })

        if (!user || !user.passwordHash) return null

        const passwordOk = await bcrypt.compare(credentials.password, user.passwordHash)
        if (!passwordOk) return null

        if (user.empresa?.status === 'PENDENTE') {
          throw new Error('EMAIL_NAO_CONFIRMADO')
        }
        if (user.empresa?.status === 'SUSPENSO') {
          throw new Error('CONTA_SUSPENSA')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          empresaId: user.empresaId,
          tipoEmpresa: user.empresa?.tipo,
          prestadorId: user.empresa?.prestador?.id,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.empresaId = (user as typeof user & { empresaId?: string }).empresaId
        token.tipoEmpresa = (user as typeof user & { tipoEmpresa?: string }).tipoEmpresa
        token.prestadorId = (user as typeof user & { prestadorId?: string }).prestadorId
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as typeof session.user & {
          empresaId?: string
          tipoEmpresa?: string
          prestadorId?: string
          id?: string
        }).empresaId = token.empresaId as string
        ;(session.user as typeof session.user & { tipoEmpresa?: string }).tipoEmpresa =
          token.tipoEmpresa as string
        ;(session.user as typeof session.user & { prestadorId?: string }).prestadorId =
          token.prestadorId as string
        ;(session.user as typeof session.user & { id?: string }).id = token.sub
      }
      return session
    },
  },
}
