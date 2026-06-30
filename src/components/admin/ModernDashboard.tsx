import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export default async function ModernDashboard() {
  const payload = await getPayload({ config: configPromise })

  // Fetch true counts from Payload Collections
  const { totalDocs: totalVehicles } = await payload.count({
    collection: 'vehicles',
    where: { status: { in: ['published', 'for-sale'] } },
  })
  const { totalDocs: newInquiries } = await payload.count({
    collection: 'inquiries',
    where: { status: { equals: 'unread' } },
  })
  const { totalDocs: openInvoices } = await payload.count({ collection: 'invoices' })
  const { totalDocs: totalParts } = await payload.count({ collection: 'parts' })

  const config = await configPromise

  return (
    <div style={{ padding: '2rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 600, color: 'var(--theme-text)' }}>
          Dashboard
        </h1>
        <p style={{ color: '#8996a4', marginTop: '0.25rem' }}>
          Welcome to the 120 Customs Admin Panel.
        </p>
      </header>

      {/* Datta Able-style Metrics Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        <MetricCard
          title="Active Vehicles"
          value={totalVehicles}
          subtitle="In the showroom"
          color="#a389d4"
        />
        <MetricCard
          title="New Inquiries"
          value={newInquiries}
          subtitle="Awaiting review"
          color="#3ec9d6"
        />
        <MetricCard
          title="Invoices"
          value={openInvoices}
          subtitle="Logged in system"
          color="#e7c264"
        />
        <MetricCard
          title="Registered Parts"
          value={totalParts}
          subtitle="Items tracked"
          color="#ea4d4d"
        />
      </div>

      {/* Collections UI */}
      <div
        style={{
          background: 'var(--theme-elevation-100)',
          borderRadius: '8px',
          padding: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        }}
      >
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>System Objects</h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '1rem',
          }}
        >
          {config.collections
            .filter((c) => !c.admin?.hidden)
            .map((coll) => (
              <a
                key={coll.slug}
                href={`/admin/collections/${coll.slug}`}
                style={{
                  display: 'block',
                  padding: '1rem',
                  border: '1px solid var(--theme-elevation-200)',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  color: 'var(--theme-text)',
                  fontWeight: 500,
                  textAlign: 'center',
                }}
                className="card"
              >
                {typeof coll.labels?.plural === 'string' ? coll.labels.plural : coll.slug}
              </a>
            ))}
        </div>
      </div>
    </div>
  )
}

function MetricCard({
  title,
  value,
  subtitle,
  color,
}: {
  title: string
  value: string | number
  subtitle: string
  color: string
}) {
  return (
    <div
      style={{
        background: 'var(--theme-elevation-100)',
        padding: '1.5rem',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        borderTop: `4px solid ${color}`,
        transition: 'transform 0.15s ease',
      }}
      className="card"
    >
      <h3
        style={{
          fontSize: '0.875rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: '#8996a4',
          marginBottom: '0.5rem',
        }}
      >
        {title}
      </h3>
      <div
        style={{
          fontSize: '2rem',
          fontWeight: 700,
          color: 'var(--theme-text)',
          marginBottom: '0.25rem',
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: '0.85rem', color: '#5b6b79' }}>{subtitle}</div>
    </div>
  )
}
