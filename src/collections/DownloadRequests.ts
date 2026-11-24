import { APIError, type Access, type CollectionConfig } from 'payload'

const isPayloadAdmin = (user: { collection?: string } | null | undefined) =>
  user?.collection === 'admins'

const isAppUser = (user: { collection?: string } | null | undefined) => user?.collection === 'users'

const readOwnRequests: Access = ({ req }) => {
  const user = req.user
  if (isPayloadAdmin(user)) return true
  if (!user || !isAppUser(user)) return false
  return { owner: { equals: user.id } }
}

export const DownloadRequests: CollectionConfig = {
  slug: 'download-requests',
  access: {
    create: ({ req }) => {
      const user = req.user
      return Boolean(user && user.collection === 'users' && user.accountStatus !== 'suspended')
    },
    delete: ({ req }) => isPayloadAdmin(req.user),
    read: readOwnRequests,
    update: ({ req }) => isPayloadAdmin(req.user),
  },
  admin: {
    group: 'ScholarLocal',
    useAsTitle: 'requestLabel',
    defaultColumns: ['requestLabel', 'owner', 'study', 'status', 'createdAt'],
  },
  hooks: {
    beforeValidate: [
      ({ data, operation, req }) => {
        const user = req.user
        if (operation !== 'create' || user?.collection !== 'users') return data

        return {
          ...data,
          owner: user.id,
          requestLabel: `${user.fullName} — ${String(data?.studyTitle ?? 'PDF request')}`,
          status: 'pending',
        }
      },
    ],
    beforeChange: [
      async ({ data, operation, req }) => {
        const user = req.user
        if (operation !== 'create' || user?.collection !== 'users') return data

        const studyId =
          typeof data.study === 'object' && data.study !== null ? data.study.id : data.study

        const existing = await req.payload.find({
          collection: 'download-requests',
          limit: 1,
          overrideAccess: true,
          where: {
            and: [
              { owner: { equals: user.id } },
              { study: { equals: studyId } },
              { status: { equals: 'pending' } },
            ],
          },
        })

        if (existing.totalDocs > 0) {
          throw new APIError('You already have a pending request for this study.', 409)
        }

        return data
      },
    ],
  },
  fields: [
    {
      name: 'requestLabel',
      type: 'text',
      access: {
        create: () => false,
        update: () => false,
      },
      admin: {
        hidden: true,
      },
    },
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
      access: {
        create: () => false,
        update: () => false,
      },
    },
    {
      name: 'study',
      type: 'relationship',
      relationTo: 'studies',
      required: true,
      index: true,
    },
    {
      name: 'studyTitle',
      type: 'text',
      required: true,
      admin: {
        description: 'Snapshot used in audit history if the study title changes.',
      },
    },
    {
      name: 'purpose',
      type: 'textarea',
      required: true,
      minLength: 10,
      maxLength: 500,
    },
    {
      name: 'academicUseAccepted',
      type: 'checkbox',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      required: true,
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Denied', value: 'denied' },
      ],
      access: {
        create: ({ req }) => isPayloadAdmin(req.user),
        update: ({ req }) => isPayloadAdmin(req.user),
      },
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'reviewNote',
      type: 'textarea',
      access: {
        create: ({ req }) => isPayloadAdmin(req.user),
        update: ({ req }) => isPayloadAdmin(req.user),
      },
    },
    {
      name: 'reviewedAt',
      type: 'date',
      access: {
        create: ({ req }) => isPayloadAdmin(req.user),
        update: ({ req }) => isPayloadAdmin(req.user),
      },
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
