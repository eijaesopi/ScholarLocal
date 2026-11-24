import type { Access, CollectionConfig } from 'payload'

const isPayloadAdmin: Access = ({ req }) => req.user?.collection === 'admins'

export const Studies: CollectionConfig = {
  slug: 'studies',
  access: {
    create: isPayloadAdmin,
    delete: isPayloadAdmin,
    read: () => true,
    update: isPayloadAdmin,
  },
  admin: {
    group: 'ScholarLocal',
    useAsTitle: 'title',
    defaultColumns: ['title', 'program', 'year', 'fileStatus'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'authors',
      type: 'text',
      required: true,
    },
    {
      name: 'year',
      type: 'number',
      required: true,
      min: 1904,
      max: 2100,
    },
    {
      name: 'department',
      type: 'text',
      required: true,
      defaultValue: 'PUP Institute of Technology',
    },
    {
      name: 'program',
      type: 'select',
      required: true,
      options: [
        { label: 'Diploma in Information Technology (DIT)', value: 'DIT' },
        { label: 'Diploma in Civil Engineering Technology (DCvET)', value: 'DCvET' },
        { label: 'Diploma in Computer Engineering Technology (DCET)', value: 'DCET' },
        { label: 'Diploma in Electrical Engineering Technology (DEET)', value: 'DEET' },
        { label: 'Diploma in Electronics Engineering Technology (DECET)', value: 'DECET' },
        { label: 'Diploma in Mechanical Engineering Technology (DMET)', value: 'DMET' },
        { label: 'Diploma in Office Management Technology (DOMT)', value: 'DOMT' },
        { label: 'Diploma in Railway Engineering Technology (DRET)', value: 'DRET' },
      ],
    },
    {
      name: 'abstract',
      type: 'textarea',
      required: true,
    },
    {
      name: 'keywords',
      type: 'array',
      fields: [
        {
          name: 'keyword',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'pdf',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Optional public preview file.',
      },
    },
    {
      name: 'protectedPdf',
      type: 'upload',
      relationTo: 'research-files',
      admin: {
        description: 'Private full-text PDF delivered only after request approval.',
      },
    },
    {
      name: 'fileStatus',
      type: 'select',
      defaultValue: 'available',
      options: [
        { label: 'Available by request', value: 'available' },
        { label: 'Metadata only', value: 'metadata-only' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
