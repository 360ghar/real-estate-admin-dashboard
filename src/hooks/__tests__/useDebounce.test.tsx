import { renderHook, act } from '@testing-library/react'
import { useDebounce } from '../useDebounce'

describe('useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })
  afterEach(() => {
    jest.useRealTimers()
  })

  it('returns the initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('a', 100))
    expect(result.current).toBe('a')
  })

  it('debounces value changes', () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: 'a', delay: 100 },
    })

    rerender({ value: 'b', delay: 100 })
    // Not updated until the delay elapses.
    expect(result.current).toBe('a')

    act(() => {
      jest.advanceTimersByTime(100)
    })
    expect(result.current).toBe('b')
  })

  it('only emits the latest value within a debounce window', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 100), {
      initialProps: { value: 'a' },
    })

    rerender({ value: 'b' })
    rerender({ value: 'c' })
    act(() => {
      jest.advanceTimersByTime(100)
    })
    expect(result.current).toBe('c')
  })
})
