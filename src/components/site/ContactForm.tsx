'use client'

import React, { useActionState, useEffect, useRef } from 'react'
import { submitInquiry, type InquiryState } from '@/app/(frontend)/actions/submitInquiry'

const initialState: InquiryState = {
  success: false,
  error: null,
}

export function ContactForm({ vehicleId }: { vehicleId?: number }) {
  const [state, formAction, isPending] = useActionState(submitInquiry, initialState)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset()
    }
  }, [state.success])

  if (state.success) {
    return (
      <div
        style={{
          padding: '2rem',
          background: 'var(--bg-elev)',
          border: '1px solid var(--border)',
          borderRadius: '0.75rem',
          textAlign: 'center',
        }}
      >
        <h4
          style={{
            color: 'var(--gold)',
            marginBottom: '0.5rem',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}
        >
          Message Sent
        </h4>
        <p style={{ margin: 0, color: 'var(--muted)' }}>
          Thanks for reaching out. We will get back to you shortly.
        </p>
      </div>
    )
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        background: 'var(--bg-elev)',
        padding: '2rem',
        border: '1px solid var(--border)',
        borderRadius: '0.75rem',
      }}
    >
      {state.error && (
        <div
          style={{
            padding: '1rem',
            background: 'rgba(248, 113, 113, 0.1)',
            border: '1px solid var(--red)',
            borderRadius: '0.5rem',
            color: 'var(--red)',
            fontSize: '0.85rem',
          }}
        >
          {state.error}
        </div>
      )}

      {/* Honeypot field - visually hidden */}
      <div style={{ position: 'absolute', left: '-9999px', opacity: 0 }} aria-hidden="true">
        <label htmlFor="address">Leave this field blank if you are human</label>
        <input type="text" id="address" name="address" tabIndex={-1} autoComplete="off" />
      </div>

      <input type="hidden" name="source" value={vehicleId ? `Vehicle Spec Page` : 'Contact Page'} />
      {vehicleId && <input type="hidden" name="vehicle" value={vehicleId} />}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label
            htmlFor="name"
            style={{
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'var(--muted)',
            }}
          >
            Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            style={{
              padding: '0.75rem',
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
              borderRadius: '0.25rem',
              fontFamily: 'var(--font-mono)',
            }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label
            htmlFor="email"
            style={{
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'var(--muted)',
            }}
          >
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            style={{
              padding: '0.75rem',
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
              borderRadius: '0.25rem',
              fontFamily: 'var(--font-mono)',
            }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label
          htmlFor="phone"
          style={{
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'var(--muted)',
          }}
        >
          Phone (Optional)
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          style={{
            padding: '0.75rem',
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            color: 'var(--text)',
            borderRadius: '0.25rem',
            fontFamily: 'var(--font-mono)',
          }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label
          htmlFor="message"
          style={{
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'var(--muted)',
          }}
        >
          Message *
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          style={{
            padding: '0.75rem',
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            color: 'var(--text)',
            borderRadius: '0.25rem',
            fontFamily: 'var(--font-mono)',
            resize: 'vertical',
          }}
        />
      </div>

      <button
        type="submit"
        className="btn btn--gold"
        disabled={isPending}
        style={{
          marginTop: '0.5rem',
          opacity: isPending ? 0.7 : 1,
          cursor: isPending ? 'not-allowed' : 'pointer',
        }}
      >
        {isPending ? 'Sending...' : 'Send Inquiry'}
      </button>
    </form>
  )
}
