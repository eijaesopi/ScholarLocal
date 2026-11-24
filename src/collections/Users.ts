import type { Access, CollectionBeforeValidateHook, CollectionConfig } from 'payload'

const isPayloadAdmin = (user: { collection?: string } | null | undefined) =>
  user?.collection === 'admins'

const isAppUser = (user: { collection?: string } | null | undefined) => user?.collection === 'users'

const readOwnProfile: Access = ({ req }) => {
  const user = req.user
  if (isPayloadAdmin(user)) return true
  if (!user || !isAppUser(user)) return false
  return { id: { equals: user.id } }
}

const validateInstitutionalEmail: CollectionBeforeValidateHook = ({ data }) => {
  if (!data?.email) return data

  const email = String(data.email).trim().toLowerCase()
  const allowedDomains = ['@iskolarngbayan.pup.edu.ph', '@pup.edu.ph']

  if (!allowedDomains.some((domain) => email.endsWith(domain))) {
    throw new Error('Use a valid PUP institutional email address.')
  }

  return { ...data, email }
}

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  access: {
    create: () => true,
    delete: ({ req }) => isPayloadAdmin(req.user),
    read: readOwnProfile,
    update: readOwnProfile,
  },
  admin: {
    group: 'ScholarLocal',
    useAsTitle: 'fullName',
    defaultColumns: ['fullName', 'studentId', 'program', 'email'],
  },
  hooks: {
    beforeValidate: [validateInstitutionalEmail],
  },
  fields: [
    {
      name: 'fullName',
      type: 'text',
      required: true,
    },
    {
      name: 'studentId',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'program',
      type: 'select',
      required: true,
      options: ['DIT', 'DCvET', 'DCET', 'DEET', 'DECET', 'DMET', 'DOMT', 'DRET'],
    },
    {
      name: 'accountStatus',
      type: 'select',
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Suspended', value: 'suspended' },
      ],
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
