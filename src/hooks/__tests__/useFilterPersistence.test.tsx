import { renderHook, act } from '@testing-library/react'
import { useFilterPersistence } from '../useFilterPersistence'

describe('useFilterPersistence', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns default values initially', () => {
    const { result } = renderHook(() =>
      useFilterPersistence({
        key: 'test',
        defaultValue: { q: '', city: '' },
      }),
    )

    expect(result.current.filters).toEqual({ q: '', city: '' })
  })

  it('persists active filters to localStorage (debounced)', () => {
    jest.useFakeTimers()
    try {
      const { result } = renderHook(() =>
        useFilterPersistence({
          key: 'test',
          defaultValue: { q: '' },
          debounceMs: 0,
        }),
      )

      act(() => {
        result.current.setFilters({ q: 'search' })
      })
      act(() => {
        jest.advanceTimersByTime(5)
      })

      // Storage key is `filters_${key}` and only non-default values persist.
      expect(localStorage.getItem('filters_test')).toBe('{"q":"search"}')
    } finally {
      jest.useRealTimers()
    }
  })

  it('loads persisted filters from localStorage on mount', () => {
    localStorage.setItem('filters_test', '{"q":"saved"}')

    const { result } = renderHook(() =>
      useFilterPersistence({
        key: 'test',
        defaultValue: { q: '' },
      }),
    )

    expect(result.current.filters.q).toBe('saved')
  })
})
