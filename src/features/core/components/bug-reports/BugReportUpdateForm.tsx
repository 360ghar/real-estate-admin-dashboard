import React from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { BugReport, BugReportUpdate } from '@/types/api'

const BugReportUpdateForm: React.FC<{ bugReport: BugReport; onSubmit: (data: BugReportUpdate) => void }> = ({ bugReport, onSubmit }) => {
  const { control, register, handleSubmit, formState: { isSubmitting } } = useForm<BugReportUpdate>({
    defaultValues: {
      status: bugReport.status,
      assigned_to: bugReport.assigned_to ?? undefined,
      resolution: bugReport.resolution || '',
    },
  })

  return (
    <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-1">
        <div className="space-y-2">
          <Label>Status</Label>
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="assigned_to">Assigned To (Agent ID)</Label>
        <Input
          id="assigned_to"
          type="number"
          {...register('assigned_to', {
            setValueAs: (value) => (value === '' || Number.isNaN(Number(value)) ? undefined : Number(value)),
          })}
          placeholder="Enter agent ID"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="resolution">Resolution Notes</Label>
        <Textarea
          id="resolution"
          {...register('resolution')}
          placeholder="Add resolution notes or comments..."
          rows={4}
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? 'Updating...' : 'Update Report'}
        </Button>
        <Button type="button" variant="outline">
          Cancel
        </Button>
      </div>
    </form>
  )
}

export { BugReportUpdateForm }
