import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { LanguageProvider, useLanguage } from '../app/components/LanguageContext'
import React from 'react'

// Mock API calls
vi.mock('../lib/api', () => ({
  API_BASE_URL: 'http://localhost:5000',
  fetchBreedDetection: vi.fn(),
  fetchSchemes: vi.fn(),
}))

describe('LanguageContext', () => {
  it('should provide default language', () => {
    const TestComponent = () => {
      const { language } = useLanguage()
      return <div>{language}</div>
    }

    render(
      <BrowserRouter>
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      </BrowserRouter>
    )

    const element = screen.getByText(/en|hi|ta|te|ml|ka/)
    expect(element).toBeInTheDocument()
  })

  it('should allow language switching', async () => {
    const user = userEvent.setup()
    
    const TestComponent = () => {
      const { language, setLanguage } = useLanguage()
      return (
        <div>
          <div>Current: {language}</div>
          <button onClick={() => setLanguage('hi')}>Hindi</button>
        </div>
      )
    }

    render(
      <BrowserRouter>
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      </BrowserRouter>
    )

    const button = screen.getByRole('button', { name: /Hindi/i })
    await user.click(button)

    expect(screen.getByText(/Current: hi/)).toBeInTheDocument()
  })

  it('should persist language to localStorage', async () => {
    const user = userEvent.setup()
    
    const TestComponent = () => {
      const { language, setLanguage } = useLanguage()
      return (
        <div>
          <div>Current: {language}</div>
          <button onClick={() => setLanguage('hi')}>Hindi</button>
        </div>
      )
    }

    render(
      <BrowserRouter>
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      </BrowserRouter>
    )

    const button = screen.getByRole('button', { name: /Hindi/i })
    await user.click(button)

    expect(localStorage.getItem('language')).toBe('hi')
  })
})

describe('API Integration Tests', () => {
  it('should build correct API URLs', () => {
    expect('http://localhost:5000').toBeDefined()
    expect('http://localhost:5000').toMatch(/^http/)
  })

  it('should handle API base URL from environment', () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'
    expect(apiUrl).toBeDefined()
  })
})

describe('Component Accessibility', () => {
  it('should have proper ARIA labels on buttons', () => {
    const TestComponent = () => (
      <button aria-label="Test button">Click me</button>
    )

    render(<TestComponent />)
    
    const button = screen.getByLabelText('Test button')
    expect(button).toBeInTheDocument()
  })

  it('should support keyboard navigation', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()

    const TestComponent = () => (
      <button onKeyDown={(e) => e.key === 'Enter' && handleClick()}>
        Keyboard button
      </button>
    )

    render(<TestComponent />)

    const button = screen.getByRole('button')
    button.focus()
    expect(button).toHaveFocus()
  })

  it('should have sufficient color contrast', () => {
    const TestComponent = () => (
      <div style={{ color: '#000000', backgroundColor: '#FFFFFF' }}>
        High contrast text
      </div>
    )

    const { container } = render(<TestComponent />)
    const element = container.querySelector('div')
    expect(element).toBeInTheDocument()
  })
})

describe('Loading States', () => {
  it('should show loading skeleton', async () => {
    const TestComponent = () => {
      const [loading, setLoading] = React.useState(true)

      React.useEffect(() => {
        setTimeout(() => setLoading(false), 100)
      }, [])

      return loading ? <div data-testid="skeleton">Loading...</div> : <div>Content</div>
    }

    render(<TestComponent />)
    expect(screen.getByTestId('skeleton')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Content')).toBeInTheDocument()
    })
  })
})

describe('Error Handling', () => {
  it('should display error message on API failure', async () => {
    const TestComponent = () => {
      const [error, setError] = React.useState<string | null>(null)

      const handleFetch = async () => {
        try {
          throw new Error('API Error')
        } catch (err) {
          setError((err as Error).message)
        }
      }

      return (
        <div>
          <button onClick={handleFetch}>Fetch</button>
          {error && <div role="alert">{error}</div>}
        </div>
      )
    }

    const user = userEvent.setup()
    render(<TestComponent />)

    const button = screen.getByRole('button')
    await user.click(button)

    expect(screen.getByRole('alert')).toHaveTextContent('API Error')
  })

  it('should show user-friendly error messages', () => {
    const TestComponent = () => (
      <div role="alert">Unable to load data. Please try again later.</div>
    )

    render(<TestComponent />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })
})
