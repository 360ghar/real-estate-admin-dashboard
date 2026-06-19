import { useEffect, useRef } from 'react'
import { useStore } from 'react-redux'
import { api } from '@/store/api'
import { REALTIME_URL } from '@/lib/config'

/**
 * Subscribe to a realtime event stream (Server-Sent Events) and invalidate
 * RTK Query caches based on incoming events. When `VITE_REALTIME_URL` is not
 * configured, this hook is a graceful no-op.
 *
 * Expected SSE event shape (JSON in `data:`):
 *   { "tags": ["Booking", "Visit"] }            // invalidate LIST + all ids
 *   { "tags": [{ "type": "Booking", "id": 5 }] } // invalidate specific tag
 *   { "tag": "Property" }                        // shorthand single tag
 *
 * The hook auto-reconnects with exponential backoff up to 30s.
 */
export function useRealtimeInvalidation() {
  const reconnectDelay = useRef(1000)
  const esRef = useRef<EventSource | null>(null)
  const store = useStore()

  useEffect(() => {
    if (!REALTIME_URL) return
    if (typeof window === 'undefined' || typeof window.EventSource === 'undefined') return

    let closed = false

    const connect = () => {
      if (closed) return
      const es = new window.EventSource(REALTIME_URL as string, { withCredentials: true })
      esRef.current = es

      es.onopen = () => {
        reconnectDelay.current = 1000
      }

      es.onmessage = (ev) => {
        try {
          const raw: string = typeof ev.data === 'string' ? ev.data : String(ev.data)
          const parsed: unknown = JSON.parse(raw)
          const payload = parsed as {
            tags?: Array<string | { type: string; id?: string | number }>
            tag?: string
          }
          const rawTags = payload.tags ?? (payload.tag ? [payload.tag] : [])
          // Cast to the tag union type expected by RTK Query. The realtime
          // service is trusted to emit valid tag names; unknown tags are a
          // no-op on the cache side.
          const tagObjects = rawTags.map((t) =>
            typeof t === 'string' ? { type: t, id: 'LIST' } : { type: t.type, id: t.id ?? 'LIST' },
          ) as Parameters<typeof api.util.invalidateTags>[0]
          if (tagObjects.length) {
            store.dispatch(api.util.invalidateTags(tagObjects))
          }
        } catch {
          // Ignore malformed payloads
        }
      }
      es.onerror = () => {
        es.close()
        esRef.current = null
        if (closed) return
        const delay = Math.min(reconnectDelay.current, 30000)
        reconnectDelay.current = Math.min(reconnectDelay.current * 2, 30000)
        setTimeout(connect, delay)
      }
    }

    connect()

    return () => {
      closed = true
      esRef.current?.close()
      esRef.current = null
    }
  }, [store])
}

