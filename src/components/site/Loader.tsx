import React from 'react'
import { Logo } from '../brand/Logo'

// Full-page loading state: a spinning gold gear logo.
export function Loader() {
  return (
    <div className="loader" role="status" aria-label="Loading">
      <Logo variant="gold" size={120} spin spinFast />
    </div>
  )
}

export default Loader
