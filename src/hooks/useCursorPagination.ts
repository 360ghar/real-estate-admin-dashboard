import { useCallback, useState } from 'react'

/**
 * Cursor-based pagination helper for list pages that navigate one page at a
 * time (Prev/Next) using opaque backend cursors.
 *
 * The backend returns `{items, next_cursor, has_more, limit}`. `next_cursor`
 * is opaque base64 and is never decoded on the client. Because the backend
 * does not support a "previous" cursor, backwards navigation is implemented
 * with a client-side cursor history stack: before advancing to the next page
 * we push the current cursor onto the stack, and `prev()` pops it.
 *
 * Usage:
 *   const pager = useCursorPagination()
 *   const { data } = useListXQuery({ cursor: pager.cursor, ... })
 *   // advance:
 *   pager.next(data.next_cursor)
 *   // go back:
 *   pager.prev()
 *   // reset on filter/limit change:
 *   pager.reset()
 */
export interface CursorPager {
  /** Cursor for the currently displayed page (null = first page). */
  cursor: string | null
  /** True when there is a previous page in the history stack. */
  canPrev: boolean
  /** Advance to the next page using the `next_cursor` from the current response. */
  next: (nextCursor: string | null) => void
  /** Pop the history stack and return to the previous page. */
  prev: () => void
  /** Reset to the first page (clears cursor and history). Call on filter/limit change. */
  reset: () => void
}

export function useCursorPagination(): CursorPager {
  const [cursor, setCursor] = useState<string | null>(null)
  const [history, setHistory] = useState<(string | null)[]>([])

  const next = useCallback(
    (nextCursor: string | null) => {
      setHistory((h) => [...h, cursor])
      setCursor(nextCursor)
    },
    [cursor],
  )

  const prev = useCallback(() => {
    setHistory((h) => {
      if (h.length === 0) return h
      const prevCursor = h[h.length - 1]
      setCursor(prevCursor)
      return h.slice(0, -1)
    })
  }, [])

  const reset = useCallback(() => {
    setCursor(null)
    setHistory([])
  }, [])

  return { cursor, canPrev: history.length > 0, next, prev, reset }
}
