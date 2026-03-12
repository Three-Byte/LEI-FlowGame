import { render, screen } from '@testing-library/react'
import ComingSoon from './ComingSoon'

describe('ComingSoon', () => {
  it('renders heading', () => {
    render(<ComingSoon />)

    expect(
      screen.getByRole('heading', { name: 'Coming Soon' }),
    ).toBeInTheDocument()
  })

  it('renders subtitle', () => {
    render(<ComingSoon />)

    expect(
      screen.getByText('Something new is being built.'),
    ).toBeInTheDocument()
  })

  it('renders footer with copyright', () => {
    render(<ComingSoon />)

    expect(screen.getByText('© 2026 3-Byte')).toBeInTheDocument()
  })
})