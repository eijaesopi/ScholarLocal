import ScholarLocalApp, { type Study as StudyView } from '@/components/ScholarLocalApp'
import { appAuth } from '@/lib/app-auth'
import { getPayloadClient } from '@/lib/payload'
import { buildRelatedStudyIndex } from '@/lib/tfidf'
import type { DownloadRequest, Study } from '@/payload-types'

const programLabels: Record<Study['program'], string> = {
  DIT: 'Diploma in Information Technology (DIT)',
  DCvET: 'Diploma in Civil Engineering Technology (DCvET)',
  DCET: 'Diploma in Computer Engineering Technology (DCET)',
  DEET: 'Diploma in Electrical Engineering Technology (DEET)',
  DECET: 'Diploma in Electronics Engineering Technology (DECET)',
  DMET: 'Diploma in Mechanical Engineering Technology (DMET)',
  DOMT: 'Diploma in Office Management Technology (DOMT)',
  DRET: 'Diploma in Railway Engineering Technology (DRET)',
}

function relationshipID(value: string | { id: string }) {
  return typeof value === 'string' ? value : value.id
}

function requestStatus(status: DownloadRequest['status']) {
  return `${status.charAt(0).toUpperCase()}${status.slice(1)}` as 'Pending' | 'Approved' | 'Denied'
}

export default async function HomePage() {
  const payload = await getPayloadClient()
  const currentUser = await appAuth.currentUser()

  const [studyResult, requestResult] = await Promise.all([
    payload.find({
      collection: 'studies',
      depth: 1,
      limit: 100,
      overrideAccess: false,
      sort: 'createdAt',
      user: currentUser ?? undefined,
    }),
    currentUser
      ? payload.find({
          collection: 'download-requests',
          depth: 1,
          limit: 100,
          overrideAccess: false,
          sort: '-createdAt',
          user: currentUser,
        })
      : Promise.resolve({ docs: [] as DownloadRequest[] }),
  ])

  const approvedRequestsByStudy = new Map(
    requestResult.docs
      .filter((request) => request.status === 'approved')
      .map((request) => [relationshipID(request.study), request]),
  )

  const studies: StudyView[] = studyResult.docs.map((study) => {
    const approvedRequest = approvedRequestsByStudy.get(study.id)
    return {
      abstract: study.abstract,
      authors: study.authors,
      department: study.department,
      id: study.id,
      keywords: study.keywords?.map((item) => item.keyword) ?? [],
      pdfUrl:
        approvedRequest && study.protectedPdf ? `/downloads/${approvedRequest.id}` : undefined,
      program: programLabels[study.program],
      slug: study.slug,
      title: study.title,
      year: String(study.year),
    }
  })

  const downloadRequests = requestResult.docs.map((request) => ({
    id: request.id,
    program: currentUser?.program ?? '',
    purpose: request.purpose,
    requestedAt: new Intl.DateTimeFormat('en-PH', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'Asia/Manila',
    }).format(new Date(request.createdAt)),
    requester: currentUser?.fullName ?? '',
    status: requestStatus(request.status),
    studentId: currentUser?.studentId ?? '',
    studyTitle: request.studyTitle,
  }))
  const relatedStudies = buildRelatedStudyIndex(studies)

  return (
    <ScholarLocalApp
      currentUser={
        currentUser
          ? {
              email: currentUser.email,
              fullName: currentUser.fullName,
              program: currentUser.program,
              studentId: currentUser.studentId,
            }
          : null
      }
      downloadRequests={downloadRequests}
      relatedStudies={relatedStudies}
      studies={studies}
    />
  )
}
