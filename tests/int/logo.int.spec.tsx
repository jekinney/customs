import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Logo } from '@/components/brand/Logo'

describe('Logo (gear mark)', () => {
  it('renders an accessible svg gear', () => {
    const { container, getByLabelText } = render(<Logo variant="gold" />)
    expect(getByLabelText('120 Customs')).toBeTruthy()
    expect(container.querySelector('svg')).toBeTruthy()
  })

  it('applies the gold variant class by default', () => {
    const { container } = render(<Logo variant="gold" />)
    expect(container.querySelector('.logo--gold')).toBeTruthy()
  })

  it('adds the spin class only when spinning', () => {
    const { container: still } = render(<Logo />)
    expect(still.querySelector('.logo-spin')).toBeNull()
    const { container: spinning } = render(<Logo spin spinFast />)
    expect(spinning.querySelector('.logo-spin')).toBeTruthy()
    expect(spinning.querySelector('.logo-spin--fast')).toBeTruthy()
  })
})
