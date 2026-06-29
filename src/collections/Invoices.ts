import type { CollectionConfig } from 'payload'
import { isAuthenticated, privateOwnerAccess, adminOnlyField } from '@/access/roles'

// Uploaded parts invoices/receipts (private Garage Ledger). The file IS the upload;
// AI extraction (POST /api/invoices/:id/extract) fills the fields for review, and
// confirm (POST /api/invoices/:id/confirm) turns the line items into Parts.
export const Invoices: CollectionConfig = {
  slug: 'invoices',
  labels: { singular: 'Invoice', plural: 'Invoices' },
  upload: true,
  admin: {
    useAsTitle: 'invoiceNumber',
    defaultColumns: ['invoiceNumber', 'vehicle', 'store', 'total', 'reviewStatus'],
    group: 'Garage Ledger',
  },
  access: {
    read: privateOwnerAccess,
    create: isAuthenticated,
    update: privateOwnerAccess,
    delete: privateOwnerAccess,
  },
  hooks: {
    beforeChange: [
      async ({ data, req }) => {
        if (data?.vehicle && !data.owner) {
          const vehicle = await req.payload.findByID({ collection: 'vehicles', id: data.vehicle, depth: 0, overrideAccess: true })
          const owner = (vehicle as { owner?: unknown })?.owner
          if (owner) data.owner = typeof owner === 'object' ? (owner as { id: unknown }).id : owner
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'invoiceActions',
      type: 'ui',
      admin: { components: { Field: '@/components/admin/InvoiceActions#default' } },
    },
    {
      type: 'row',
      fields: [
        { name: 'vehicle', type: 'relationship', relationTo: 'vehicles', required: true, admin: { width: '50%' } },
        { name: 'store', type: 'relationship', relationTo: 'stores', admin: { width: '50%', description: 'AI-detected; confirm/adjust.' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'invoiceNumber', type: 'text', admin: { width: '50%' } },
        { name: 'invoiceDate', type: 'date', admin: { width: '50%' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'subtotal', type: 'number', admin: { width: '25%' } },
        { name: 'tax', type: 'number', admin: { width: '25%' } },
        { name: 'shipping', type: 'number', admin: { width: '25%' } },
        { name: 'total', type: 'number', admin: { width: '25%' } },
      ],
    },
    {
      name: 'lineItems',
      type: 'array',
      labels: { singular: 'Line item', plural: 'Line items' },
      admin: { description: 'Review/edit, then Confirm to create parts.' },
      fields: [
        { name: 'description', type: 'text', required: true },
        {
          type: 'row',
          fields: [
            { name: 'partNumber', type: 'text', admin: { width: '25%' } },
            { name: 'quantity', type: 'number', defaultValue: 1, admin: { width: '25%' } },
            { name: 'unitPrice', type: 'number', admin: { width: '25%' } },
            { name: 'lineTotal', type: 'number', admin: { width: '25%' } },
          ],
        },
        { name: 'category', type: 'relationship', relationTo: 'part-categories', admin: { description: 'AI-suggested; confirm/adjust.' } },
      ],
    },
    {
      name: 'reviewStatus',
      type: 'select',
      defaultValue: 'pending-review',
      admin: { position: 'sidebar' },
      options: [
        { label: 'Pending review', value: 'pending-review' },
        { label: 'Confirmed', value: 'confirmed' },
      ],
    },
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
      admin: { position: 'sidebar', readOnly: true, description: 'Inherited from the vehicle.' },
      access: { update: adminOnlyField },
    },
    { name: 'aiRaw', type: 'json', admin: { position: 'sidebar', description: 'Raw AI output (debug).' } },
  ],
  endpoints: [
    {
      path: '/:id/extract',
      method: 'post',
      handler: async (req) => {
        if (!req.user) return Response.json({ error: 'unauthorized' }, { status: 401 })
        const id = req.routeParams?.id as string
        let invoice: any
        try {
          invoice = await req.payload.findByID({ collection: 'invoices', id, depth: 0, overrideAccess: false, user: req.user, req })
        } catch {
          return Response.json({ error: 'forbidden' }, { status: 403 })
        }
        if (!invoice?.filename) return Response.json({ error: 'No file on this invoice' }, { status: 400 })

        const cats = (await req.payload.find({ collection: 'part-categories', limit: 200, overrideAccess: true })).docs as { id: string | number; name: string }[]
        const stores = (await req.payload.find({ collection: 'stores', limit: 200, overrideAccess: true })).docs as any[]

        const { readInvoiceFile, extractInvoice } = await import('@/lib/invoiceAI')
        const { matchStore, mapCategory } = await import('@/lib/invoice')

        try {
          const { base64, mimeType } = await readInvoiceFile(invoice)
          const extracted = await extractInvoice(base64, mimeType, cats.map((c) => c.name))
          const lineItems = (extracted.lineItems || []).map((li) => ({
            description: li.description || 'Part',
            partNumber: li.partNumber || '',
            quantity: li.quantity || 1,
            unitPrice: li.unitPrice || 0,
            lineTotal: li.lineTotal || (li.quantity || 0) * (li.unitPrice || 0),
            category: mapCategory(li.suggestedCategory, cats) || undefined,
          }))
          await req.payload.update({
            collection: 'invoices',
            id,
            overrideAccess: true,
            data: {
              store: matchStore(extracted.store, stores) || undefined,
              invoiceNumber: extracted.invoiceNumber || undefined,
              invoiceDate: extracted.invoiceDate || undefined,
              subtotal: extracted.subtotal ?? undefined,
              tax: extracted.tax ?? undefined,
              shipping: extracted.shipping ?? undefined,
              total: extracted.total ?? undefined,
              lineItems,
              aiRaw: extracted as Record<string, unknown>,
              reviewStatus: 'pending-review',
            },
          })
          return Response.json({ ok: true, lineItems: lineItems.length })
        } catch (e) {
          console.error('Invoice extract error:', e)
          return Response.json({ error: 'Extraction failed — check the file and GEMINI_API_KEY.' }, { status: 500 })
        }
      },
    },
    {
      path: '/:id/confirm',
      method: 'post',
      handler: async (req) => {
        if (!req.user) return Response.json({ error: 'unauthorized' }, { status: 401 })
        const id = req.routeParams?.id as string
        let invoice: any
        try {
          invoice = await req.payload.findByID({ collection: 'invoices', id, depth: 0, overrideAccess: false, user: req.user, req })
        } catch {
          return Response.json({ error: 'forbidden' }, { status: 403 })
        }
        const { confirmInvoice } = await import('@/lib/invoiceConfirm')
        const created = await confirmInvoice(req.payload, id)
        return Response.json({ ok: true, created })
      },
    },
  ],
}
