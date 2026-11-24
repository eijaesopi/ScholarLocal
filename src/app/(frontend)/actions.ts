'use server'

import type { DownloadRequest, User } from '@/payload-types'
import { appAuth } from '@/lib/app-auth'
import { getPayloadClient } from '@/lib/payload'
import { rankStudies } from '@/lib/tfidf'

type ActionResult = {
  ok: boolean
  error?: string
}

export async function searchStudiesAction(input: {
  query: string
}): Promise<
  { ok: true; results: { id: string; score: number }[] } | { ok: false; error: string; results: [] }
> {
  const query = cleanString(input.query, 120)
  if (query.length < 2) {
    return {
      ok: false,
      error: 'Enter at least two characters to search the repository.',
      results: [],
    }
  }

  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'studies',
    depth: 0,
    limit: 100,
    overrideAccess: false,
  })

  return {
    ok: true,
    results: rankStudies(
      result.docs.map((study) => ({
        abstract: study.abstract,
        authors: study.authors,
        id: study.id,
        keywords: study.keywords?.map((item) => item.keyword) ?? [],
        program: study.program,
        title: study.title,
      })),
      query,
    ),
  }
}

const programs = new Set(['DIT', 'DCvET', 'DCET', 'DEET', 'DECET', 'DMET', 'DOMT', 'DRET'])

function cleanString(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

function friendlyError(error: unknown, fallback: string) {
  if (!(error instanceof Error)) return fallback
  if (error.message.includes('already have a pending request')) {
    return 'You already have a pending request for this study.'
  }
  if (error.message.includes('duplicate') || error.message.includes('unique')) {
    return 'An account with that email or student ID already exists.'
  }
  if (error.message.includes('valid PUP institutional email')) {
    return error.message
  }
  return fallback
}

export async function loginAction(input: {
  email: string
  password: string
}): Promise<ActionResult> {
  const email = cleanString(input.email, 160).toLowerCase()
  const password = cleanString(input.password, 128)

  if (!email || !password) {
    return { ok: false, error: 'Enter your institutional email and password.' }
  }

  try {
    const user = await appAuth.login(email, password)
    if (user.accountStatus === 'suspended') {
      await appAuth.logout()
      return {
        ok: false,
        error: 'This account is suspended. Contact the repository office.',
      }
    }
    return { ok: true }
  } catch {
    return { ok: false, error: 'The email or password is incorrect.' }
  }
}

export async function registerAction(input: {
  fullName: string
  studentId: string
  program: string
  email: string
  password: string
}): Promise<ActionResult> {
  const fullName = cleanString(input.fullName, 120)
  const studentId = cleanString(input.studentId, 40).toUpperCase()
  const program = cleanString(input.program, 10)
  const email = cleanString(input.email, 160).toLowerCase()
  const password = cleanString(input.password, 128)

  if (fullName.length < 3 || studentId.length < 5) {
    return { ok: false, error: 'Enter your full name and valid student ID.' }
  }
  if (!programs.has(program)) {
    return { ok: false, error: 'Select your diploma program.' }
  }
  if (!email.endsWith('@iskolarngbayan.pup.edu.ph') && !email.endsWith('@pup.edu.ph')) {
    return { ok: false, error: 'Use a valid PUP institutional email address.' }
  }
  if (password.length < 8) {
    return {
      ok: false,
      error: 'Use a password with at least eight characters.',
    }
  }

  try {
    const payload = await getPayloadClient()
    await payload.create({
      collection: 'users',
      data: {
        accountStatus: 'active',
        email,
        fullName,
        password,
        program: program as User['program'],
        studentId,
      },
      overrideAccess: false,
    })
    await appAuth.login(email, password)
    return { ok: true }
  } catch (error) {
    return {
      ok: false,
      error: friendlyError(error, 'We could not create your account.'),
    }
  }
}

export async function logoutAction(): Promise<ActionResult> {
  await appAuth.logout()
  return { ok: true }
}

export async function requestDownloadAction(input: {
  studyId: string
  purpose: string
}): Promise<ActionResult> {
  const user = await appAuth.currentUser()
  if (!user) {
    return { ok: false, error: 'Sign in before requesting a PDF download.' }
  }

  const studyId = cleanString(input.studyId, 80)
  const purpose = cleanString(input.purpose, 500)
  if (!studyId || purpose.length < 10) {
    return {
      ok: false,
      error: 'Provide a short academic purpose for this request.',
    }
  }

  try {
    const payload = await getPayloadClient()
    const study = await payload.findByID({
      collection: 'studies',
      id: studyId,
      depth: 0,
      overrideAccess: false,
      user,
    })

    if (study.fileStatus !== 'available') {
      return { ok: false, error: 'This study does not currently have a PDF.' }
    }

    await payload.create({
      collection: 'download-requests',
      data: {
        academicUseAccepted: true,
        owner: user.id,
        purpose,
        status: 'pending' as DownloadRequest['status'],
        study: study.id,
        studyTitle: study.title,
      },
      overrideAccess: false,
      user,
    })

    return { ok: true }
  } catch (error) {
    return {
      ok: false,
      error: friendlyError(error, 'The request could not be submitted.'),
    }
  }
}
