import { UseFormReturn } from 'react-hook-form'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PropertyFormValues } from '@/features/properties/schemas'
import { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useGetUsersQuery } from '@/features/users/api/usersApi'
import { useDebounce } from '@/hooks/useDebounce'
import Combobox from '@/components/ui/combobox'
import { useAppSelector } from '@/hooks/redux'
import { selectCurrentUser } from '@/features/auth/slices/authSlice'

interface PropertyOwnerProps {
  form: UseFormReturn<PropertyFormValues>
}

export function PropertyOwner({ form }: PropertyOwnerProps) {
  const [ownerMode, setOwnerMode] = useState<'search' | 'id'>('search')
  const [ownerSearch, setOwnerSearch] = useState('')
  const dq = useDebounce(ownerSearch, 300)

  const me = useAppSelector(selectCurrentUser)
  const role = (me?.role as 'admin' | 'agent' | 'user') || (me?.agent_id ? 'agent' : 'admin')

  const { data: users } = useGetUsersQuery(
    {
      page: 1,
      limit: 20,
      q: dq || undefined,
      ...(role === 'agent' && me?.agent_id ? { agent_id: me.agent_id } : {}),
    },
    { skip: ownerMode !== 'search' }
  )

  if (role === 'user') return null

  return (
    <div className="space-y-4 border p-4 rounded-lg bg-muted/10">
      <h3 className="font-medium">Owner Details (Admin/Agent Only)</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <FormLabel className="text-xs text-muted-foreground">Selection Mode</FormLabel>
          <Select value={ownerMode} onValueChange={(v) => setOwnerMode(v as 'id' | 'search')}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="search">Search Users</SelectItem>
              <SelectItem value="id">Enter User ID</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {ownerMode === 'search' && (
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FormLabel className="text-xs text-muted-foreground">Search User</FormLabel>
              <Input
                placeholder="Name or phone..."
                value={ownerSearch}
                onChange={(e) => setOwnerSearch(e.target.value)}
              />
            </div>
            <FormField
              control={form.control}
              name="owner_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-muted-foreground">Select User</FormLabel>
                  <FormControl>
                    <Combobox
                      items={(users?.items || []).map((u) => ({
                        value: String(u.id),
                        label: `${u.full_name || 'User'} • ${u.phone || 'N/A'} • #${u.id}`
                      }))}
                      value={field.value ? String(field.value) : ''}
                      onChange={(v) => field.onChange(v ? Number(v) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {ownerMode === 'id' && (
           <FormField
            control={form.control}
            name="owner_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-muted-foreground">Owner ID</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="e.g. 123"
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 pt-2">
        <FormField
          control={form.control}
          name="owner_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Owner Name (Optional override)</FormLabel>
              <FormControl>
                <Input placeholder="Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="owner_contact"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Owner Contact (Optional override)</FormLabel>
              <FormControl>
                <Input placeholder="Phone/Email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
