import '@testing-library/jest-dom'

// Polyfill matchMedia if needed
if (!window.matchMedia) {
  // @ts-ignore
  window.matchMedia = () => ({ matches: false, addListener: () => {}, removeListener: () => {} })
}

// Provide NotificationProvider globally for tests so hooks depending on it don't throw
import React from 'react'
import { render } from '@testing-library/react'
import { NotificationProvider } from '../hooks/useNotifications'

// Wrapper without JSX so this file can remain .ts
const AllProviders = ({ children }: { children: React.ReactNode }) =>
  React.createElement(NotificationProvider as any, null, children)

const customRender = (ui: React.ReactElement, options: any = {}) =>
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
