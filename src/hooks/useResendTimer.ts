import { useCallback, useEffect, useRef, useState } from 'react'

/** Standard cooldown (seconds) before an OTP can be resent. */
export const RESEND_OTP_SECONDS = 30

export interface ResendTimer {
  /** Seconds remaining in the cooldown (0 when resend is allowed). */
  secondsLeft: number
  /** True while the cooldown is active and resend should be disabled. */
  isActive: boolean
  /** True when the cooldown has elapsed and resend is allowed. */
  canResend: boolean
  /** (Re)start the cooldown — call right after an OTP has been sent. */
  start: () => void
  /** Stop the cooldown immediately (e.g. when leaving the OTP step). */
  reset: () => void
}

/**
 * Countdown timer for "Resend code" controls. Deadline-based so it stays
 * accurate across re-renders, ticks once per second, and clears its interval
 * on unmount/reset.
 */
export function useResendTimer(seconds: number = RESEND_OTP_SECONDS): ResendTimer {
  const [secondsLeft, setSecondsLeft] = useState(0)
  const deadlineRef = useRef<number>(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const clear = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const tick = useCallback(() => {
    const remaining = Math.max(0, Math.ceil((deadlineRef.current - Date.now()) / 1000))
    setSecondsLeft(remaining)
    if (remaining <= 0) clear()
  }, [clear])

  const start = useCallback(() => {
    clear()
    deadlineRef.current = Date.now() + seconds * 1000
    setSecondsLeft(seconds)
    intervalRef.current = setInterval(tick, 1000)
  }, [clear, seconds, tick])

  const reset = useCallback(() => {
    clear()
    deadlineRef.current = 0
    setSecondsLeft(0)
  }, [clear])

  useEffect(() => clear, [clear])

  return {
    secondsLeft,
    isActive: secondsLeft > 0,
    canResend: secondsLeft <= 0,
    start,
    reset,
  }
}
