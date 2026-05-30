import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Modal } from '@/components/ui'

describe('Modal Component', () => {
  it('does not render when open is false', () => {
    render(
      <Modal open={false} onClose={jest.fn()} title="Test Modal">
        Content
      </Modal>
    )
    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument()
  })

  it('renders when open is true', () => {
    render(
      <Modal open={true} onClose={jest.fn()} title="Test Modal">
        Content
      </Modal>
    )
    expect(screen.getByText('Test Modal')).toBeInTheDocument()
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('displays the title', () => {
    render(
      <Modal open={true} onClose={jest.fn()} title="My Modal">
        Content here
      </Modal>
    )
    expect(screen.getByText('My Modal')).toBeInTheDocument()
  })

  it('displays the children content', () => {
    render(
      <Modal open={true} onClose={jest.fn()} title="Title">
        <div>Complex content</div>
      </Modal>
    )
    expect(screen.getByText('Complex content')).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup()
    const handleClose = jest.fn()
    render(
      <Modal open={true} onClose={handleClose} title="Test">
        Content
      </Modal>
    )

    const closeButton = screen.getByText('✕')
    await user.click(closeButton)
    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('displays footer content when provided', () => {
    render(
      <Modal
        open={true}
        onClose={jest.fn()}
        title="Test"
        footer={<button>Action</button>}
      >
        Content
      </Modal>
    )
    expect(screen.getByText('Action')).toBeInTheDocument()
  })

  it('does not display footer when not provided', () => {
    const { container } = render(
      <Modal open={true} onClose={jest.fn()} title="Test">
        Content
      </Modal>
    )
    const footer = container.querySelector('[class*="border-t"]')
    expect(footer).not.toBeInTheDocument()
  })

  it('has proper styling classes', () => {
    const { container } = render(
      <Modal open={true} onClose={jest.fn()} title="Test">
        Content
      </Modal>
    )
    const backdrop = container.querySelector('.fixed.inset-0')
    expect(backdrop).toHaveClass('bg-black/50')
  })

  it('renders with proper z-index for overlay', () => {
    const { container } = render(
      <Modal open={true} onClose={jest.fn()} title="Test">
        Content
      </Modal>
    )
    const backdrop = container.querySelector('.fixed.inset-0')
    expect(backdrop).toHaveClass('z-50')
  })

  it('shows close button with correct styling', () => {
    render(
      <Modal open={true} onClose={jest.fn()} title="Test">
        Content
      </Modal>
    )
    const closeButton = screen.getByText('✕')
    expect(closeButton).toHaveClass('text-slate-400')
    expect(closeButton).toHaveClass('hover:text-white')
  })
})
