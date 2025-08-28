import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import Layout from '../Layout'

const renderWithRouter = (component: React.ReactNode) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('Layout', () => {
  it('renders navigation with correct links', () => {
    renderWithRouter(<Layout />)
    
    expect(screen.getByText('What to Eat')).toBeInTheDocument()
    expect(screen.getByText('Recipes')).toBeInTheDocument()
    expect(screen.getByText('Meals')).toBeInTheDocument()
    expect(screen.getByText('Analytics')).toBeInTheDocument()
  })

  it('renders navigation links with correct hrefs', () => {
    renderWithRouter(<Layout />)
    
    expect(screen.getByText('Recipes').closest('a')).toHaveAttribute('href', '/')
    expect(screen.getByText('Meals').closest('a')).toHaveAttribute('href', '/meals')
    expect(screen.getByText('Analytics').closest('a')).toHaveAttribute('href', '/analytics')
  })
})