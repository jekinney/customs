import type { GlobalConfig } from 'payload'
import { adminOnly } from '@/access/roles'

// CMS-editable inputs that drive the build cost estimator. Public read; admin write.
export const EstimatorConfig: GlobalConfig = {
  slug: 'estimator-config',
  label: 'Estimator',
  admin: { group: 'Site' },
  access: {
    read: () => true,
    update: adminOnly,
  },
  fields: [
    { name: 'intro', type: 'textarea', admin: { description: 'Short blurb shown above the estimator.' } },
    {
      name: 'platforms',
      type: 'array',
      labels: { singular: 'Platform', plural: 'Platforms' },
      admin: { description: 'Truck platforms a customer can start from.' },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'name', type: 'text', required: true, admin: { width: '50%' } },
            { name: 'basePrice', type: 'number', required: true, admin: { width: '50%', description: 'Starting build cost ($).' } },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'minYear', type: 'number', admin: { width: '33%' } },
            { name: 'maxYear', type: 'number', admin: { width: '33%' } },
            {
              name: 'type',
              type: 'select',
              admin: { width: '34%' },
              options: [
                { label: 'Full-size', value: 'fullsize' },
                { label: 'Mid-size', value: 'midsize' },
                { label: 'Heavy duty', value: 'heavy' },
                { label: 'Classic', value: 'classic' },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'features',
      type: 'array',
      labels: { singular: 'Feature', plural: 'Features' },
      admin: { description: 'Build options. Lift / wheels / tires are single-choice; the rest are add-ons.' },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'name', type: 'text', required: true, admin: { width: '50%' } },
            { name: 'price', type: 'number', required: true, admin: { width: '20%' } },
            {
              name: 'group',
              type: 'select',
              required: true,
              admin: { width: '30%' },
              options: [
                { label: 'Lift / Stance', value: 'lift' },
                { label: 'Wheels', value: 'wheels' },
                { label: 'Tires', value: 'tires' },
                { label: 'Performance', value: 'performance' },
                { label: 'Exterior', value: 'exterior' },
                { label: 'Interior', value: 'interior' },
                { label: 'Other', value: 'other' },
              ],
            },
          ],
        },
        { name: 'description', type: 'text' },
      ],
    },
    {
      name: 'contingencyPct',
      type: 'number',
      defaultValue: 15,
      admin: { description: 'Range +/- shown around the estimate (percent).' },
    },
    { name: 'disclaimer', type: 'textarea' },
  ],
}
