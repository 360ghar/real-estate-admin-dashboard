import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

// Compatibility shim so the existing Jest-style tests (which use `jest.fn()`,
// `jest.useFakeTimers()`, etc.) run unchanged under Vitest.
;(globalThis as unknown as { jest: typeof vi }).jest = vi
