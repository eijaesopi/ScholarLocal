import { appAuth } from '@/lib/app-auth'
import { getPayloadClient } from '@/lib/payload'
import type { ResearchFile } from '@/payload-types'
import { cookies } from 'next/headers'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ requestId: string }> },
) {
  const user = await appAuth.currentUser()
  if (!user) {
    return Response.json({ error: 'Authentication required.' }, { status: 401 })
  }

  const { requestId } = await params
  const payload = await getPayloadClient()

  try {
    const downloadRequest = await payload.findByID({
      collection: 'download-requests',
      id: requestId,
      depth: 2,
      overrideAccess: false,
      user,
    })

    if (downloadRequest.status !== 'approved') {
      return Response.json(
        { error: 'This download request has not been approved.' },
        { status: 403 },
      )
    }

    const study =
      typeof downloadRequest.study === 'object'
        ? downloadRequest.study
        : await payload.findByID({
            collection: 'studies',
            id: downloadRequest.study,
            depth: 1,
            overrideAccess: false,
            user,
          })

    if (!study.protectedPdf) {
      return Response.json({ error: 'The repository PDF is not available yet.' }, { status: 404 })
    }

    const file: ResearchFile =
      typeof study.protectedPdf === 'object'
        ? study.protectedPdf
        : await payload.findByID({
            collection: 'research-files',
            id: study.protectedPdf,
            depth: 0,
            overrideAccess: false,
            user,
          })

    if (!file.url) {
      return Response.json({ error: 'The file is unavailable.' }, { status: 404 })
    }

    const token = (await cookies()).get('app-session')?.value
    if (!token) {
      return Response.json({ error: 'Authentication required.' }, { status: 401 })
    }

    const fileURL = new URL(file.url, process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000')
    const fileResponse = await fetch(fileURL, {
      cache: 'no-store',
      headers: { Authorization: `JWT ${token}` },
    })

    if (!fileResponse.ok || !fileResponse.body) {
      return Response.json({ error: 'The protected file could not be retrieved.' }, { status: 502 })
    }

    const filename = (file.filename || 'scholarlocal-research.pdf').replace(/[^a-zA-Z0-9._-]/g, '-')

    return new Response(fileResponse.body, {
      headers: {
        'Cache-Control': 'private, no-store',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Type': file.mimeType || 'application/pdf',
      },
    })
  } catch {
    return Response.json({ error: 'The approved request could not be found.' }, { status: 404 })
  }
}
