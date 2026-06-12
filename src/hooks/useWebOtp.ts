import { useEffect, useRef } from 'react'

interface OtpCredentialRequestOptions extends CredentialRequestOptions {
  otp: { transport: string[] }
  signal?: AbortSignal
}

interface OtpCredential extends Credential {
  code: string
}

/**
 * Android Chrome SMS OTP autofill via the WebOTP API.
 *
 * When `enabled` (typically once the OTP step is shown), this requests an
 * incoming SMS that ends with the `@<domain> #<code>` binding line and calls
 * `onCode` with the extracted code so the form can fill itself. Feature-detected
 * and aborted on unmount / when disabled, so it is a no-op on unsupported
 * browsers (Safari, Firefox, desktop Chrome).
 *
 * The SMS template must include the WebOTP binding line for this to fire — see
 * the Phase 0 setup checklist.
 */
export function useWebOtp(onCode: (code: string) => void, enabled = true, version = 0): void {
  const onCodeRef = useRef(onCode)
  onCodeRef.current = onCode

  useEffect(() => {
    if (!enabled) return
    if (typeof window === 'undefined') return
    if (!('OTPCredential' in window)) return
    if (!navigator.credentials || typeof navigator.credentials.get !== 'function') return

    const controller = new AbortController()

    void navigator.credentials
      .get({
        otp: { transport: ['sms'] },
        signal: controller.signal,
      } as OtpCredentialRequestOptions)
      .then((credential) => {
        const otp = credential as OtpCredential | null
        if (otp?.code) {
          onCodeRef.current(otp.code)
        }
      })
      .catch(() => {
        // Aborted on unmount, declined, or no SMS arrived — ignore.
      })

    return () => controller.abort()
  }, [enabled, version])
}
