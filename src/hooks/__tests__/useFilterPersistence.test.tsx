import { renderHook } from '@testing-library/react'
import { useFilterPersistence } from '../useFilterPersistence'

describe('useFilterPersistence', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns default values initially', () => {
    const { result } = renderHook(() => useFilterPersistence({
      key: 'test',
      defaultValue: { q: '', city: '' }
    }))

    expect(result.current.filters).toEqual({ q: '', city: '' })
  })

  it('persists changes to localStorage', () => {
    const { result } = renderHook(() => useFilterPersistence({
      key: 'test',
      defaultValue: { q: '' }
    }))

    result.current.setFilters({ q: 'search' })

    expect(localStorage.getItem('test-filters')).toBe('{"q":"search"}')
  })

  it('loads from localStorage on mount', () => {
    localStorage.setItem('test-filters', '{"q":"saved"}')

    const { result } = renderHook(() => useFilterPersistence({
      key: 'test',
      defaultValue: { q: '' }
    }))

    expect(result.current.filters.q).toBe('saved')
  })
})
