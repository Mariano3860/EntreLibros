/// <reference types="vitest" />
import '@testing-library/jest-dom'

declare global {
  namespace Vi {
    interface Assertion<T = unknown> extends jest.Matchers<void, T> {}
  }
}
