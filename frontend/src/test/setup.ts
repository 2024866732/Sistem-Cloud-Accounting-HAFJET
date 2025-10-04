import '@testing-library/jest-dom'

// Polyfill matchMedia if needed
if (!window.matchMedia) {
  // Provide a minimal matchMedia polyfill for the test environment
  (window as any).matchMedia = () => ({ matches: false, addListener: () => {}, removeListener: () => {} })
}

// Provide NotificationProvider globally for tests so hooks depending on it don't throw
import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import NotificationProvider from '../hooks/useNotifications'

// Wrapper without JSX so this file can remain .ts
type ProviderProps = { children: React.ReactNode }
const AllProviders = ({ children }: ProviderProps) =>
  React.createElement(NotificationProvider, null, children)

const customRender = (ui: ReactElement, options?: RenderOptions) =>
  render(ui, { wrapper: AllProviders as any, ...options })

// re-export everything from testing-library and override render
export * from '@testing-library/react'
export { customRender as render }

// Mock socket.io-client to prevent real network connections during unit tests
jest.mock('socket.io-client', () => ({
  io: () => ({
    on: () => {},
    emit: () => {},
    disconnect: () => {},
    connect: () => {},
  }),
}))
