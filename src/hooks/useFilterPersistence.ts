import { useState, useEffect } from 'react'

interface FilterPersistenceOptions<T> {
  key: string
  defaultValue: T
  debounceMs?: number
}

export function useFilterPersistence<T extends Record<string, any>>({
  key,
  defaultValue,
  debounceMs = 300
}: FilterPersistenceOptions<T>) {
  const [filters, setFiltersState] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(`filters_${key}`)
      return saved ? { ...defaultValue, ...JSON.parse(saved) } : defaultValue
    } catch {
      return defaultValue
    }
  })

  const setFilters = (newFilters: Partial<T>) => {
    const updated = { ...filters, ...newFilters }
    setFiltersState(updated)

    try {
      localStorage.setItem(`filters_${key}`, JSON.stringify(updated))
    } catch (error) {
      console.warn('Failed to save filters to localStorage:', error)
    }
  }

  const clearFilters = () => {
    setFiltersState(defaultValue)
    try {
      localStorage.removeItem(`filters_${key}`)
    } catch (error) {
      console.warn('Failed to clear filters from localStorage:', error)
    }
  }

  const resetFilters = () => {
    setFilters(defaultValue)
  }

  // Auto-save on filter changes
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(`filters_${key}`, JSON.stringify(filters))
      } catch (error) {
        console.warn('Failed to auto-save filters:', error)
      }
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [filters, key, debounceMs])

  return {
    filters,
    setFilters,
    clearFilters,
    resetFilters,
    hasActiveFilters: Object.keys(filters).some(
      k => filters[k] !== defaultValue[k] && filters[k] !== '' && filters[k] !== null
    )
  }
}