import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { clearCredentials } from '@/features/auth/slices/authSlice'
import type { RootState } from '@/store'

export interface SelectedOwner {
  id: number
  label: string
}

interface PmState {
  selected_owner: SelectedOwner | null
}

const STORAGE_KEY = 'pm_selected_owner'

const readSelectedOwner = (): SelectedOwner | null => {
  if (typeof localStorage === 'undefined') return null
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as { id?: unknown; label?: unknown }
    if (typeof parsed?.id !== 'number') return null
    if (typeof parsed?.label !== 'string') return null
    return { id: parsed.id, label: parsed.label }
  } catch {
    return null
  }
}

const initialState: PmState = {
  selected_owner: readSelectedOwner(),
}

const pmSlice = createSlice({
  name: 'pm',
  initialState,
  reducers: {
    setSelectedOwner: (state, action: PayloadAction<SelectedOwner | null>) => {
      state.selected_owner = action.payload
      if (typeof localStorage === 'undefined') return
      if (action.payload) localStorage.setItem(STORAGE_KEY, JSON.stringify(action.payload))
      else localStorage.removeItem(STORAGE_KEY)
    },
  },
  extraReducers: (builder) => {
    builder.addCase(clearCredentials, (state) => {
      state.selected_owner = null
      if (typeof localStorage !== 'undefined') localStorage.removeItem(STORAGE_KEY)
    })
  },
})

export const { setSelectedOwner } = pmSlice.actions

export const selectSelectedOwner = (state: RootState) => state.pm.selected_owner
export const selectSelectedOwnerId = (state: RootState) => state.pm.selected_owner?.id ?? null

export default pmSlice.reducer

