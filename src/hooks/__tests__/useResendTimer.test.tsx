import { renderHook, act } from '@testing-library/react'
import { useResendTimer, RESEND_OTP_SECONDS } from '../useResendTimer'

describe('useResendTimer', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })
  afterEach(() => {
    jest.useRealTimers()
  })

  it('defaults to a 30-second cooldown', () => {
    expect(RESEND_OTP_SECONDS).toBe(30)
  })

  it('starts idle (resend allowed) before start() is called', () => {
    const { result } = renderHook(() => useResendTimer())
    expect(result.current.secondsLeft).toBe(0)
    expect(result.current.canResend).toBe(true)
    expect(result.current.isActive).toBe(false)
  })

  it('disables resend for 30s, counts down, then re-enables', () => {
    const { result } = renderHook(() => useResendTimer())

    act(() => {
      result.current.start()
    })
    expect(result.current.secondsLeft).toBe(30)
    expect(result.current.canResend).toBe(false)
    expect(result.current.isActive).toBe(true)

    act(() => {
      jest.advanceTimersByTime(1000)
    })
    expect(result.current.secondsLeft).toBe(29)
    expect(result.current.canResend).toBe(false)

    act(() => {
      jest.advanceTimersByTime(29000)
    })
    expect(result.current.secondsLeft).toBe(0)
    expect(result.current.canResend).toBe(true)
    expect(result.current.isActive).toBe(false)
  })

  it('reset() stops the countdown immediately', () => {
    const { result } = renderHook(() => useResendTimer())

    act(() => {
      result.current.start()
    })
    expect(result.current.isActive).toBe(true)

    act(() => {
      result.current.reset()
    })
    expect(result.current.secondsLeft).toBe(0)
    expect(result.current.canResend).toBe(true)
  })

  it('honors a custom cooldown duration', () => {
    const { result } = renderHook(() => useResendTimer(10))
    act(() => {
      result.current.start()
    })
    expect(result.current.secondsLeft).toBe(10)
  })
})
