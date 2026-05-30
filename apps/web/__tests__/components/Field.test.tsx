import React from 'react'
import { render, screen } from '@testing-library/react'
import { Field, Input } from '@/components/ui'

describe('Field Component', () => {
  it('renders label', () => {
    render(
      <Field label="Email">
        <Input />
      </Field>
    )
    expect(screen.getByText('Email')).toBeInTheDocument()
  })

  it('renders children', () => {
    render(
      <Field label="Name">
        <Input placeholder="Enter name" />
      </Field>
    )
    expect(screen.getByPlaceholderText('Enter name')).toBeInTheDocument()
  })

  it('displays required indicator when required prop is true', () => {
    render(
      <Field label="Required Field" required>
        <Input />
      </Field>
    )
    const label = screen.getByText('Required Field')
    expect(label.parentElement).toHaveTextContent('*')
  })

  it('does not display required indicator when required prop is false', () => {
    const { container } = render(
      <Field label="Optional Field" required={false}>
        <Input />
      </Field>
    )
    const requiredIndicator = container.querySelector('.text-red-400')
    expect(requiredIndicator).not.toBeInTheDocument()
  })

  it('renders with proper label styling', () => {
    render(
      <Field label="Test Label">
        <Input />
      </Field>
    )
    const label = screen.getByText('Test Label')
    expect(label).toHaveClass('text-sm')
    expect(label).toHaveClass('font-medium')
    expect(label).toHaveClass('text-slate-300')
  })

  it('associates label with input using htmlFor', () => {
    render(
      <Field label="Email" htmlFor="email-input">
        <Input id="email-input" />
      </Field>
    )
    const label = screen.getByText('Email')
    expect(label).toHaveAttribute('for', 'email-input')
  })

  it('wraps children in proper container', () => {
    const { container } = render(
      <Field label="Test">
        <Input />
      </Field>
    )
    const fieldDiv = container.querySelector('div')
    expect(fieldDiv).toBeInTheDocument()
  })

  it('renders with textarea child', () => {
    render(
      <Field label="Description">
        <textarea placeholder="Enter description" />
      </Field>
    )
    expect(screen.getByPlaceholderText('Enter description')).toBeInTheDocument()
  })

  it('renders with select child', () => {
    render(
      <Field label="Options">
        <select>
          <option>Option 1</option>
          <option>Option 2</option>
        </select>
      </Field>
    )
    expect(screen.getByText('Options')).toBeInTheDocument()
    expect(screen.getByText('Option 1')).toBeInTheDocument()
  })

  it('renders required indicator with proper color', () => {
    const { container } = render(
      <Field label="Required" required>
        <Input />
      </Field>
    )
    const requiredStar = container.querySelector('.text-red-400')
    expect(requiredStar).toHaveClass('ml-0.5')
  })

  it('maintains label margin spacing', () => {
    const { container } = render(
      <Field label="Spaced">
        <Input />
      </Field>
    )
    const label = screen.getByText('Spaced')
    expect(label).toHaveClass('mb-1.5')
  })
})
