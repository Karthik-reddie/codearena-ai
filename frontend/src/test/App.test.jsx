import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import { store } from '../store/store'
import App from '../App'

describe('App', () => {
  it('renders landing page', () => {
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>
      </Provider>
    )
    expect(screen.getByText(/Level Up Your/i)).toBeInTheDocument()
    expect(screen.getAllByText(/CodeArena AI/i).length).toBeGreaterThan(0)
  })

  it('renders login page', () => {
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/login']}>
          <App />
        </MemoryRouter>
      </Provider>
    )
    expect(screen.getByText(/Welcome back/i)).toBeInTheDocument()
  })

  it('renders signup page', () => {
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/signup']}>
          <App />
        </MemoryRouter>
      </Provider>
    )
    expect(screen.getByText(/Create your account/i)).toBeInTheDocument()
  })

  it('redirects to login for protected routes', () => {
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/dashboard']}>
          <App />
        </MemoryRouter>
      </Provider>
    )
    expect(screen.getByText(/Welcome back/i)).toBeInTheDocument()
  })
})
