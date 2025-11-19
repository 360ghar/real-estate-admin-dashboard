import { useEffect } from 'react'
import { useCreateAgentMutation, useGetAgentQuery, useUpdateAgentMutation } from '@/features/agents/api/agentsApi'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useToast } from '@/hooks/use-toast'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

const toBool = (v: unknown) => (v === 'true' ? true : v === 'false' ? false : v)
const schema = z.object({
  name: z.string().min(2),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  user_id: z.coerce.number().min(1, 'Linked user is required'),
  employee_id: z.string().min(1, 'Employee ID is required'),
  specialization: z.string().min(1, 'Specialization is required'),
  agent_type: z.enum(['general', 'specialist', 'senior']),
  is_active: z.preprocess(toBool, z.boolean().optional()),
  is_available: z.preprocess(toBool, z.boolean().optional()),
})
type FormValues = z.infer<typeof schema>

const AgentForm = ({ id }: { id?: number }) => {
  const { data } = useGetAgentQuery(id!, { skip: !id })
  const [create, createState] = useCreateAgentMutation()
  const [update, updateState] = useUpdateAgentMutation()
  const { toast } = useToast()
  const isEdit = !!id
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { is_active: true, is_available: true, agent_type: 'general' } })

  useEffect(() => {
    if (data) {
      form.reset({
        name: (data as any).name || data.user?.full_name || '',
        email: data.user?.email || '',
        phone: data.user?.phone || '',
        user_id: data.user_id,
        employee_id: data.employee_id,
        specialization: data.specialization,
        agent_type: data.agent_type,
        is_active: (data as any).is_active ?? true,
        is_available: data.is_available,
      })
    }
  }, [data, form])

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEdit && id) {
        await update({ id, data: values as any }).unwrap()
        toast({ title: 'Saved', description: 'Agent updated' })
      } else {
        await create({
          user_id: values.user_id,
          employee_id: values.employee_id,
          specialization: values.specialization,
          agent_type: values.agent_type,
          is_available: values.is_available,
        } as any).unwrap()
        toast({ title: 'Created', description: 'Agent created' })
      }
    } catch (e: unknown) {
      const error = e as { data?: { detail?: string } }
      toast({ title: 'Failed', description: error?.data?.detail || 'Try again', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">{isEdit ? 'Edit Agent' : 'Create Agent'}</h1>
      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="user_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Linked User ID</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="employee_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employee ID</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="specialization"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specialization</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="agent_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agent Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="specialist">Specialist</SelectItem>
                        <SelectItem value="senior">Senior</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Active</FormLabel>
                    <Select onValueChange={(v) => field.onChange(v === 'true')} defaultValue={field.value ? 'true' : 'false'}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="true">Yes</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="is_available"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Available</FormLabel>
                    <Select onValueChange={(v) => field.onChange(v === 'true')} defaultValue={field.value ? 'true' : 'false'}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="true">Yes</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="md:col-span-2 flex justify-end">
                <Button type="submit" disabled={createState.isLoading || updateState.isLoading}>
                  {isEdit ? (updateState.isLoading ? 'Saving…' : 'Save') : createState.isLoading ? 'Creating…' : 'Create'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

export default AgentForm
