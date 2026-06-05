import { useState, useEffect, useRef, useMemo } from 'react'

interface FilterPersistenceOptions<T extends Record<string, unknown>> {
  key: string
  defaultValue: T
  debounceMs?: number
}

export function useFilterPersistence<T extends Record<string, unknown>>({
  key,
  defaultValue,
  debounceMs = 300
}: FilterPersistenceOptions<T>) {
  const defaultValueRef = useRef(defaultValue)
  const [filters, setFiltersState] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(`filters_${key}`)
      return saved
        ? { ...defaultValueRef.current, ...(JSON.parse(saved) as Partial<T>) }
        : { ...defaultValueRef.current }
    } catch {
      return { ...defaultValueRef.current }
    }
  })

  const setFilters = (newFilters: Partial<T>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }))
  }

  const clearFilters = () => {
    setFiltersState({ ...defaultValueRef.current })
    try {
      localStorage.removeItem(`filters_${key}`)
    } catch (error) {
      console.warn('Failed to clear filters from localStorage:', error)
    }
  }

  const resetFilters = () => {
    setFilters({ ...defaultValueRef.current })
  }

  const isEqual = (a: unknown, b: unknown) => {
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false
      return a.every((item, index) => item === b[index])
    }
    return a === b
  }

  const hasActiveFilters = useMemo(() =>
    (Object.keys(filters) as Array<keyof T>).some((k) =>
      !isEqual(filters[k], defaultValueRef.current[k])
    ), [filters, defaultValueRef])

  // Auto-save on filter changes
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        if (!hasActiveFilters) {
          localStorage.removeItem(`filters_${key}`)
          return
        }
        localStorage.setItem(`filters_${key}`, JSON.stringify(filters))
      } catch (error) {
        console.warn('Failed to auto-save filters:', error)
      }
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [filters, key, debounceMs, hasActiveFilters])

  return {
    filters,
    setFilters,
    clearFilters,
    resetFilters,
    hasActiveFilters
  }
}