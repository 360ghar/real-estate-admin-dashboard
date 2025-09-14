import { useEffect } from 'react'
import { useCreateAgentMutation, useGetAgentQuery, useUpdateAgentMutation } from '@/store/services/agentsApi'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useToast } from '@/hooks/use-toast'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

const toBool = (v: any) => (v === 'true' ? true : v === 'false' ? false : v)
const schema = z.object({
  name: z.string().min(2),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
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
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { is_active: true, is_available: true } })

  useEffect(() => {
    if (data) {
      form.reset({ name: data.name, email: data.email || '', phone: data.phone || '', is_active: data.is_active, is_available: data.is_available })
    }
  }, [data, form])

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEdit && id) {
        await update({ id, data: values }).unwrap()
        toast({ title: 'Saved', description: 'Agent updated' })
      } else {
        await create(values).unwrap()
        toast({ title: 'Created', description: 'Agent created' })
      }
    } catch (e: any) {
      toast({ title: 'Failed', description: e?.data?.detail || 'Try again', variant: 'destructive' })
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
