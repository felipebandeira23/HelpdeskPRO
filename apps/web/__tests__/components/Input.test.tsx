import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from '@/components/ui'

describe('Input Component', () => {
  it('renders input element', () => {
    render(<Input />)
    const input = screen.getByRole('textbox')
    expect(input).toBeInTheDocument()
  })

  it('has correct base styles', () => {
    render(<Input />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('bg-slate-800')
    expect(input).toHaveClass('border')
    expect(input).toHaveClass('border-slate-700')
    expect(input).toHaveClass('rounded-lg')
  })

  it('accepts placeholder prop', () => {
    render(<Input placeholder="Enter text" />)
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
  })

  it('accepts type prop', () => {
    render(<Input type="email" />)
    const input = screen.getByRole('textbox') as HTMLInputElement
    expect(input.type).toBe('email')
  })

  it('accepts value prop and updates on input', async () => {
    const user = userEvent.setup()
    const Wrapper = () => {
      const [value, setValue] = React.useState('')
      return <Input value={value} onChange={(e) => setValue(e.target.value)} />
    }
    render(<Wrapper />)

    const input = screen.getByRole('textbox') as HTMLInputElement
    expect(input.value).toBe('')

    await user.type(input, 'hello')
    expect(input.value).toBe('hello')
  })

  it('handles change events', async () => {
    const user = userEvent.setup()
    const handleChange = jest.fn()
    render(<Input onChange={handleChange} />)

    const input = screen.getByRole('textbox')
    await user.type(input, 'test')

    expect(handleChange).toHaveBeenCalled()
  })

  it('can be disabled', () => {
    render(<Input disabled />)
    const input = screen.getByRole('textbox') as HTMLInputElement
    expect(input.disabled).toBe(true)
    expect(input).toHaveClass('disabled:opacity-50')
  })

  it('focuses on input', () => {
    const ref = React.createRef<HTMLInputElement>()
    render(<Input ref={ref} />)
    ref.current?.focus()
    expect(ref.current).toBe(document.activeElement)
  })

  it('accepts custom className', () => {
    render(<Input className="custom-class" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('custom-class')
  })

  it('renders with password type', () => {
    const { container } = render(<Input type="password" />)
    const input = container.querySelector('input') as HTMLInputElement
    expect(input.type).toBe('password')
  })

  it('renders with number type', () => {
    render(<Input type="number" />)
    const input = screen.getByRole('spinbutton') as HTMLInputElement
    expect(input.type).toBe('number')
  })
})
