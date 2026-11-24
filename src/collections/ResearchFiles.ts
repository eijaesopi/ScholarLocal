import type { Access, CollectionConfig } from 'payload'

const canReadResearchFile: Access = async ({ id, req }) => {
  const user = req.user
  if (user?.collection === 'admins') return true
  if (user?.collection !== 'users' || !id) return false

  const file = await req.payload.findByID({
    collection: 'research-files',
    id,
    depth: 0,
    overrideAccess: true,
  })
  const studyId = typeof file.relatedStudy === 'object' ? file.relatedStudy.id : file.relatedStudy

  const approvedRequest = await req.payload.find({
    collection: 'download-requests',
    limit: 1,
    overrideAccess: true,
    where: {
      and: [
        { owner: { equals: user.id } },
        { study: { equals: studyId } },
        { status: { equals: 'approved' } },
      ],
    },
  })

  return approvedRequest.totalDocs > 0
}

export const ResearchFiles: CollectionConfig = {
  slug: 'research-files',
  access: {
    create: ({ req }) => req.user?.collection === 'admins',
    delete: ({ req }) => req.user?.collection === 'admins',
    read: canReadResearchFile,
    update: ({ req }) => req.user?.collection === 'admins',
  },
  admin: {
    group: 'ScholarLocal',
    useAsTitle: 'alt',
    description:
      'Private full-text PDFs. Access is granted only after a download request is approved.',
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      name: 'relatedStudy',
      type: 'relationship',
      relationTo: 'studies',
      required: true,
      unique: true,
      index: true,
    },
  ],
  upload: {
    mimeTypes: ['application/pdf'],
    modifyResponseHeaders: ({ headers }) => {
      headers.set('Cache-Control', 'private, no-store')
      return headers
    },
  },
}
