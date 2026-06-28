import React from 'react'
import Link from 'next/link'
import { Logo } from '../brand/Logo'

export function Header() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link href="/" className="brand" aria-label="120 Customs home">
          <Logo variant="gold" size={44} />
          <span>
            <h1 className="brand__name">
              120 <span className="accent">Customs</span>
            </h1>
            <div className="brand__est">EST. 2012</div>
          </span>
        </Link>

        <nav className="nav">
          <Link href="/#showroom">Showroom</Link>
          <Link href="/#shop">The Shop</Link>
          <Link href="/estimator">Estimator</Link>
          <Link href="/contact">Contact</Link>
        </nav>
      </div>
    </header>
  )
}

export default Header
