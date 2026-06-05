import { describe, it, expect, vi } from 'vitest'
import { applyServerValidation, extractFieldErrors } from '@/lib/formErrors'

describe('extractFieldErrors', () => {
  it('parses a FastAPI 422 detail array, stripping the body/query prefix', () => {
    const error = {
      status: 422,
      data: { detail: [{ loc: ['body', 'title'], msg: 'field required' }, { loc: ['body', 'price'], msg: 'must be positive' }] },
    }
    expect(extractFieldErrors(error)).toEqual({ title: 'Field required', price: 'Must be positive' })
  })

  it('parses the alternative { errors: { field: [msg] } } shape', () => {
    const error = { status: 400, data: { errors: { email: ['already taken'] } } }
    expect(extractFieldErrors(error)).toEqual({ email: 'already taken' })
  })

  it('returns an empty object for non-validation errors', () => {
    expect(extractFieldErrors({ status: 500, data: { detail: 'boom' } })).toEqual({})
    expect(extractFieldErrors('network down')).toEqual({})
  })
})

describe('applyServerValidation', () => {
  it('maps field errors via setError and returns true', () => {
    const setError = vi.fn()
    const error = { status: 422, data: { detail: [{ loc: ['body', 'title'], msg: 'field required' }] } }
    const applied = applyServerValidation(error, setError)
    expect(applied).toBe(true)
    expect(setError).toHaveBeenCalledWith('title', { type: 'server', message: 'Field required' })
  })

  it('routes a generic error to the form root and returns false', () => {
    const setError = vi.fn()
    const error = { status: 400, data: { detail: 'Bad request happened' } }
    const applied = applyServerValidation(error, setError)
    expect(applied).toBe(false)
    expect(setError).toHaveBeenCalledWith('root', { type: 'server', message: 'Bad request happened' })
  })

  it('folds unknown server fields into the root error when knownFields is set', () => {
    const setError = vi.fn()
    const error = { status: 422, data: { detail: [{ loc: ['body', 'secret'], msg: 'nope' }] } }
    const applied = applyServerValidation(error, setError, { knownFields: ['title'] })
    expect(applied).toBe(false)
    expect(setError).toHaveBeenCalledWith('root', { type: 'server', message: 'Nope' })
  })
})
