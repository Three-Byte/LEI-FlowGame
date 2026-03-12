import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

describe('App', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('shows PIN gate when not authenticated', () => {
    render(<App />)
    expect(screen.getByPlaceholderText('Enter PIN')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /enter/i })).toBeInTheDocument()
  })

  it('shows homescreen after correct PIN', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByPlaceholderText('Enter PIN'), '5555')
    await user.click(screen.getByRole('button', { name: /enter/i }))

    expect(sessionStorage.getItem('pin-auth')).toBe('true')
    // HomeScreen is now shown — segment buttons are a reliable landmark
    expect(screen.getByText('Items')).toBeInTheDocument()
    expect(screen.getByText('Metrics')).toBeInTheDocument()
    expect(screen.getByText('About')).toBeInTheDocument()
  })

  it('shows homescreen directly if sessionStorage has auth', () => {
    sessionStorage.setItem('pin-auth', 'true')
    render(<App />)
    expect(screen.getByText('Items')).toBeInTheDocument()
    expect(screen.getByText('Metrics')).toBeInTheDocument()
    expect(screen.getByText('About')).toBeInTheDocument()
  })
})
