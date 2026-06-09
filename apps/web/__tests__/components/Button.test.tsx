import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '@/components/ui'

describe('Button Component', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('renders with primary variant by default', () => {
    render(<Button>Primary</Button>)
    const button = screen.getByText('Primary')
    expect(button).toHaveClass('bg-blue-600')
  })

  it('renders with secondary variant', () => {
    render(<Button variant="secondary">Secondary</Button>)
    const button = screen.getByText('Secondary')
    expect(button).toHaveClass('bg-slate-800')
  })

  it('renders with success variant', () => {
    render(<Button variant="success">Success</Button>)
    const button = screen.getByText('Success')
    expect(button).toHaveClass('bg-emerald-600')
  })

  it('renders with danger variant', () => {
    render(<Button variant="danger">Danger</Button>)
    const button = screen.getByText('Danger')
    expect(button).toHaveClass('bg-red-600')
  })

  it('renders with ghost variant', () => {
    render(<Button variant="ghost">Ghost</Button>)
    const button = screen.getByText('Ghost')
    expect(button).toHaveClass('bg-transparent')
  })

  it('renders with small size', () => {
    render(<Button size="sm">Small</Button>)
    const button = screen.getByText('Small')
    expect(button).toHaveClass('px-3')
    expect(button).toHaveClass('text-xs')
  })

  it('renders with medium size by default', () => {
    render(<Button>Medium</Button>)
    const button = screen.getByText('Medium')
    expect(button).toHaveClass('px-4')
    expect(button).toHaveClass('text-sm')
  })

  it('renders with large size', () => {
    render(<Button size="lg">Large</Button>)
    const button = screen.getByText('Large')
    expect(button).toHaveClass('px-5')
    expect(button).toHaveClass('text-base')
  })

  it('handles click events', async () => {
    const user = userEvent.setup()
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click</Button>)

    await user.click(screen.getByText('Click'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>)
    const button = screen.getByText('Disabled') as HTMLButtonElement
    expect(button.disabled).toBe(true)
    expect(button).toHaveClass('disabled:opacity-50')
  })

  it('is disabled when loading prop is true', () => {
    render(<Button loading>Loading</Button>)
    const button = screen.getByText('Loading') as HTMLButtonElement
    expect(button.disabled).toBe(true)
  })

  it('renders with fullWidth prop', () => {
    render(<Button fullWidth>Full Width</Button>)
    const button = screen.getByText('Full Width')
    expect(button).toHaveClass('w-full')
  })

  it('renders with icon', () => {
    render(<Button icon={<span>🚀</span>}>With Icon</Button>)
    expect(screen.getByText('🚀')).toBeInTheDocument()
    expect(screen.getByText('With Icon')).toBeInTheDocument()
  })
})
