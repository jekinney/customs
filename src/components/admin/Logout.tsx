'use client'

import React from 'react'
import { useAuth } from '@payloadcms/ui'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const { logOut } = useAuth()
  const router = useRouter()

  return (
    <button
      onClick={() => {
        logOut()
        router.push('/')
      }}
      style={{
        background: 'none',
        border: 'none',
        color: 'inherit',
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontSize: 'inherit',
        padding: '0.5rem',
        textAlign: 'left',
        width: '100%',
      }}
    >
      Log out
    </button>
  )
}
