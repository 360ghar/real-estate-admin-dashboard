import { renderHook, act } from '@testing-library/react'
import { useDebounce } from '../useDebounce'
import { useEffect, useState } from 'react'

const DebounceWrapper = ({ delay, onDebounced }: { delay?: number; onDebounced: (value: string) => void }) => {
  const [value, setValue] = useState('')
  const debouncedValue = useDebounce(value, delay)

  useEffect(() => {
    onDebounced(debouncedValue)
  }, [debouncedValue, onDebounced])

  return (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      data-testid="input"
    />
  )
}

describe('useDebounce', () => {
  it('debounces value changes', async () => {
    const onDebounced = jest.fn()
    const { getByTestId } = renderHook(() => <DebounceWrapper delay={100} onDebounced={onDebounced} />).result

    const input = getByTestId('input')

    act(() => {
      input.focus()
      input.value = 'test'
      input.dispatchEvent(new Event('input', { bubbles: true }))
    })

    expect(onDebounced).toHaveBeenCalledTimes(0)

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 150))
    })

    expect(onDebounced).toHaveBeenCalledWith('test')
  })
})
