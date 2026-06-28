'use client'

import React, { useState } from 'react'

// Renders the "120 Shoptruck" line-art illustration from /public/brand.
// Until the asset file is added it hides gracefully (so the layout still reviews
// cleanly). Add the file at: public/brand/120-shoptruck.png
export function ShopTruck({ className = '' }: { className?: string }) {
  const [failed, setFailed] = useState(false)
  if (failed) {
    return (
      <div className={`placeholder ${className}`.trim()}>
        Add <code>public/brand/120-shoptruck.png</code> to show the Shoptruck illustration here.
      </div>
    )
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand/120-shoptruck.png"
      alt="120 Customs Shoptruck — 1990 Chevrolet GMT400"
      className={className}
      onError={() => setFailed(true)}
    />
  )
}

export default ShopTruck
