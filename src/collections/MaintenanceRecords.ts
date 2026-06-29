import type { CollectionConfig } from 'payload'
import { isAuthenticated, privateOwnerAccess, adminOnlyField } from '@/access/roles'
import { computeMaintenanceTotal } from '@/lib/maintenance'

// Per-vehicle service log (private Garage Ledger). After saving, "Get AI
// recommendations" (POST /api/maintenance-records/:id/recommend) asks Gemini for
// next-service suggestions from the vehicle's history + current mileage.
export const MaintenanceRecords: CollectionConfig = {
  slug: 'maintenance-records',
  labels: { singular: 'Maintenance Record', plural: 'Maintenance' },
  admin: {
    useAsTitle: 'type',
    defaultColumns: ['type', 'vehicle', 'date', 'mileage', 'totalCost'],
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
        if (!data) return data
        if (data.vehicle && !data.owner) {
          const vehicle = await req.payload.findByID({ collection: 'vehicles', id: data.vehicle, depth: 0, overrideAccess: true })
          const owner = (vehicle as { owner?: unknown })?.owner
          if (owner) data.owner = typeof owner === 'object' ? (owner as { id: unknown }).id : owner
        }
        data.totalCost = computeMaintenanceTotal(data.items, data.laborCost)
        return data
      },
    ],
  },
  fields: [
    {
      name: 'maintActions',
      type: 'ui',
      admin: { components: { Field: '@/components/admin/MaintenanceActions#default' } },
    },
    {
      type: 'row',
      fields: [
        { name: 'vehicle', type: 'relationship', relationTo: 'vehicles', required: true, admin: { width: '50%' } },
        {
          name: 'type',
          type: 'select',
          required: true,
          defaultValue: 'oil-change',
          admin: { width: '50%' },
          options: [
            { label: 'Oil change', value: 'oil-change' },
            { label: 'Brake service', value: 'brake-service' },
            { label: 'Fluid flush', value: 'fluid-flush' },
            { label: 'Tire rotation', value: 'tire-rotation' },
            { label: 'Tune-up', value: 'tune-up' },
            { label: 'Inspection', value: 'inspection' },
            { label: 'Repair', value: 'repair' },
            { label: 'Other', value: 'other' },
          ],
        },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'date', type: 'date', admin: { width: '50%' } },
        { name: 'mileage', type: 'number', admin: { width: '50%', description: 'Odometer at service.' } },
      ],
    },
    {
      name: 'items',
      type: 'array',
      labels: { singular: 'Item / consumable', plural: 'Items / consumables' },
      admin: { description: 'Parts & consumables used (oil, filter, fluids…).' },
      fields: [
        { name: 'name', type: 'text', required: true },
        {
          type: 'row',
          fields: [
            { name: 'brand', type: 'text', admin: { width: '34%' } },
            { name: 'spec', type: 'text', admin: { width: '33%', description: 'e.g. 5W-30 synthetic' } },
            { name: 'partNumber', type: 'text', admin: { width: '33%' } },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'quantity', type: 'number', defaultValue: 1, admin: { width: '50%' } },
            { name: 'unitCost', type: 'number', admin: { width: '50%' } },
          ],
        },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'laborCost', type: 'number', admin: { width: '50%' } },
        { name: 'totalCost', type: 'number', admin: { width: '50%', readOnly: true, description: 'Consumables + labor (auto).' } },
      ],
    },
    { name: 'receipt', type: 'upload', relationTo: 'media', admin: { description: 'Optional receipt/photo.' } },
    { name: 'notes', type: 'textarea' },
    {
      type: 'row',
      fields: [
        { name: 'nextDueMileage', type: 'number', admin: { width: '50%', description: 'AI-suggested; editable.' } },
        { name: 'nextDueDate', type: 'date', admin: { width: '50%', description: 'AI-suggested; editable.' } },
      ],
    },
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
      admin: { position: 'sidebar', readOnly: true, description: 'Inherited from the vehicle.' },
      access: { update: adminOnlyField },
    },
    {
      name: 'aiRecommendations',
      type: 'json',
      admin: { position: 'sidebar', description: 'AI next-service suggestions (advisory).' },
    },
  ],
  endpoints: [
    {
      path: '/:id/recommend',
      method: 'post',
      handler: async (req) => {
        if (!req.user) return Response.json({ error: 'unauthorized' }, { status: 401 })
        const id = req.routeParams?.id as string
        let record: any
        try {
          record = await req.payload.findByID({ collection: 'maintenance-records', id, depth: 1, overrideAccess: false, user: req.user, req })
        } catch {
          return Response.json({ error: 'forbidden' }, { status: 403 })
        }
        const vehicleId = typeof record.vehicle === 'object' ? record.vehicle?.id : record.vehicle
        const vehicle = record.vehicle && typeof record.vehicle === 'object'
          ? record.vehicle
          : await req.payload.findByID({ collection: 'vehicles', id: vehicleId, depth: 0, overrideAccess: true })

        const history = (
          await req.payload.find({
            collection: 'maintenance-records',
            where: { vehicle: { equals: vehicleId } },
            sort: '-date',
            limit: 50,
            depth: 0,
            overrideAccess: true,
          })
        ).docs.map((r: any) => ({ type: r.type, date: r.date, mileage: r.mileage }))

        try {
          const { generateRecommendations } = await import('@/lib/maintenanceAI')
          const recs = await generateRecommendations(
            { title: vehicle?.title, year: vehicle?.year },
            history,
            record.mileage,
          )
          const next = recs[0]
          await req.payload.update({
            collection: 'maintenance-records',
            id,
            overrideAccess: true,
            data: {
              aiRecommendations: recs,
              nextDueMileage: next?.dueAtMileage || record.nextDueMileage || undefined,
              nextDueDate: next?.dueByDate || record.nextDueDate || undefined,
            },
          })
          return Response.json({ ok: true, count: recs.length })
        } catch (e) {
          console.error('Maintenance recommend error:', e)
          return Response.json({ error: 'Recommendation failed — check GEMINI_API_KEY.' }, { status: 500 })
        }
      },
    },
  ],
}
