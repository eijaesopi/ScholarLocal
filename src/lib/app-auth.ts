import 'server-only'

import type { User } from '@/payload-types'
import { getPayloadClient } from '@/lib/payload'
import { cookies } from 'next/headers'

const APP_SESSION_COOKIE = 'app-session'

export function createAppAuth(collection: 'users') {
  return {
    async currentUser(): Promise<User | null> {
      const token = (await cookies()).get(APP_SESSION_COOKIE)?.value
      if (!token) return null

      const payload = await getPayloadClient()
      const authHeaders = new Headers({ Authorization: `JWT ${token}` })
      const { user } = await payload.auth({ headers: authHeaders })

      if (!user || user.collection !== collection) return null
      return user
    },

    async login(email: string, password: string): Promise<User> {
      const payload = await getPayloadClient()
      const result = await payload.login({
        collection,
        data: { email, password },
        overrideAccess: false,
      })

      if (!result.token || !result.user) {
        throw new Error('Unable to create a secure session.')
      }

      const maxAge = result.exp
        ? Math.max(result.exp - Math.floor(Date.now() / 1000), 60)
        : 60 * 60 * 8

      ;(await cookies()).set(APP_SESSION_COOKIE, result.token, {
        httpOnly: true,
        maxAge,
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      })

      return result.user
    },

    async logout(): Promise<void> {
      ;(await cookies()).delete(APP_SESSION_COOKIE)
    },
  }
}

export const appAuth = createAppAuth('users')
