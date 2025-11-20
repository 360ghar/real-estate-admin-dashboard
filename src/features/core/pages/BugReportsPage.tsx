import React, { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/useAuth'
import {
  useGetBugReportsQuery,
  useGetBugReportQuery,
  useCreateBugReportMutation,
  useUpdateBugReportMutation,
  useCreateBugReportWithMediaMutation
} from '@/features/core/api/coreApi'
import { format, parseISO } from 'date-fns'
import { Bug, Plus, Edit, Paperclip, Image, Video, FileText, AlertTriangle, CheckCircle, Clock, User, Calendar, X } from 'lucide-react'

const bugReportSchema = z.object({
  source: z.enum(['web', 'mobile', 'api']),
  bug_type: z.enum(['ui_bug', 'functionality_bug', 'performance_issue', 'crash', 'feature_request', 'other']),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  steps_to_reproduce: z.string().optional(),
  expected_behavior: z.string().optional(),
  actual_behavior: z.string().optional(),
  device_info: z.object({
    os: z.string().optional(),
    version: z.string().optional(),
    model: z.string().optional(),
    browser: z.string().optional(),
    screen_resolution: z.string().optional(),
  }).optional(),
  app_version: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

type BugReportFormData = z.infer<typeof bugReportSchema>

const severityColors = {
  low: 'bg-blue-100 text-blue-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
}

const statusColors = {
  open: 'bg-muted text-foreground',
  in_progress: 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-purple-100 text-purple-800',
}

const priorityColors = {
  low: 'bg-blue-50 text-blue-700',
  medium: 'bg-yellow-50 text-yellow-700',
  high: 'bg-orange-50 text-orange-700',
  critical: 'bg-red-50 text-red-700',
}

interface BugReportCardProps {
  bugReport: any
  onUpdate?: (id: number, data: any) => void
  showActions?: boolean
}

const BugReportCard: React.FC<BugReportCardProps> = ({ bugReport, onUpdate, showActions = false }) => {
  const [showDetails, setShowDetails] = useState(false)

  return (
    <Card className="transition-all hover:shadow-md">
      <CardContent className="pt-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">{bugReport.title}</h3>
                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                  {bugReport.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge className={severityColors[bugReport.severity as keyof typeof severityColors]}>
                    {bugReport.severity}
                  </Badge>
                  <Badge variant="outline">{bugReport.bug_type.replace('_', ' ')}</Badge>
                  <Badge className={statusColors[bugReport.status as keyof typeof statusColors]}>
                    {bugReport.status.replace('_', ' ')}
                  </Badge>
                  {bugReport.priority && (
                    <Badge className={priorityColors[bugReport.priority as keyof typeof priorityColors]}>
                      Priority: {bugReport.priority}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {showDetails && (
              <div className="mt-4 pt-4 border-t space-y-4">
                {bugReport.steps_to_reproduce && (
                  <div>
                    <h4 className="font-medium mb-2">Steps to Reproduce</h4>
                    <pre className="text-sm bg-muted p-3 rounded whitespace-pre-wrap">
                      {bugReport.steps_to_reproduce}
                    </pre>
                  </div>
                )}

                {bugReport.expected_behavior && (
                  <div>
                    <h4 className="font-medium mb-2">Expected Behavior</h4>
                    <p className="text-sm">{bugReport.expected_behavior}</p>
                  </div>
                )}

                {bugReport.actual_behavior && (
                  <div>
                    <h4 className="font-medium mb-2">Actual Behavior</h4>
                    <p className="text-sm">{bugReport.actual_behavior}</p>
                  </div>
                )}

                {bugReport.device_info && (
                  <div>
                    <h4 className="font-medium mb-2">Device Information</h4>
                    <div className="grid gap-2 md:grid-cols-2 text-sm">
                      {bugReport.device_info.os && (
                        <div>OS: {bugReport.device_info.os}</div>
                      )}
                      {bugReport.device_info.version && (
                        <div>Version: {bugReport.device_info.version}</div>
                      )}
                      {bugReport.device_info.model && (
                        <div>Model: {bugReport.device_info.model}</div>
                      )}
                      {bugReport.device_info.browser && (
                        <div>Browser: {bugReport.device_info.browser}</div>
                      )}
                      {bugReport.device_info.screen_resolution && (
                        <div>Screen: {bugReport.device_info.screen_resolution}</div>
                      )}
                    </div>
                  </div>
                )}

                {bugReport.tags && bugReport.tags.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {bugReport.tags.map((tag: string, index: number) => (
                        <Badge key={index} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {bugReport.attachments && bugReport.attachments.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Attachments</h4>
                    <div className="grid gap-2 md:grid-cols-2">
                      {bugReport.attachments.map((attachment: any) => (
                        <div key={attachment.id} className="flex items-center gap-2 p-2 border rounded">
                          {attachment.file_type.startsWith('image/') ? (
                            <Image className="h-5 w-5 text-blue-500" />
                          ) : attachment.file_type.startsWith('video/') ? (
                            <Video className="h-5 w-5 text-green-500" />
                          ) : (
                            <FileText className="h-5 w-5 text-muted-foreground" />
                          )}
                          <span className="text-sm truncate">{attachment.file_name}</span>
                          <span className="text-xs text-muted-foreground">
                            {(attachment.file_size / 1024).toFixed(1)}KB
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {bugReport.resolution_notes && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-1">Resolution Notes</h4>
                    <p className="text-sm text-green-700">{bugReport.resolution_notes}</p>
                  </div>
                )}

                <div className="grid gap-3 md:grid-cols-3 text-sm pt-3 border-t">
                  <div>
                    <span className="text-muted-foreground">Reported By:</span>
                    <p className="font-medium">{bugReport.user?.full_name || 'Unknown'}</p>
                    <p className="text-muted-foreground">{bugReport.user?.email}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Created:</span>
                    <p className="font-medium">
                      {format(parseISO(bugReport.created_at), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                  {bugReport.assigned_to && (
                    <div>
                      <span className="text-muted-foreground">Assigned To:</span>
                      <p className="font-medium">Agent #{bugReport.assigned_to}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 lg:w-48">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? 'Hide Details' : 'View Details'}
            </Button>

            {showActions && bugReport.status !== 'closed' && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Update Status
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Update Bug Report</DialogTitle>
                    <DialogDescription>
                      Update the status and priority of this bug report
                    </DialogDescription>
                  </DialogHeader>
                  <BugReportUpdateForm
                    bugReport={bugReport}
                    onSubmit={(data) => onUpdate?.(bugReport.id, data)}
                  />
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const BugReportUpdateForm: React.FC<{ bugReport: any; onSubmit: (data: any) => void }> = ({ bugReport, onSubmit }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      status: bugReport.status,
      priority: bugReport.priority || 'medium',
      assigned_to: bugReport.assigned_to || '',
      resolution_notes: bugReport.resolution_notes || '',
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Status</Label>
          <Select {...register('status')}>
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
        </div>
        <div className="space-y-2">
          <Label>Priority</Label>
          <Select {...register('priority')}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="assigned_to">Assigned To (Agent ID)</Label>
        <Input
          id="assigned_to"
          type="number"
          {...register('assigned_to', { valueAsNumber: true })}
          placeholder="Enter agent ID"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="resolution_notes">Resolution Notes</Label>
        <Textarea
          id="resolution_notes"
          {...register('resolution_notes')}
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

const CreateBugReportDialog: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [attachments, setAttachments] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [createBugReport] = useCreateBugReportMutation()
  const [createBugReportWithMedia] = useCreateBugReportWithMediaMutation()

  const form = useForm<BugReportFormData>({
    resolver: zodResolver(bugReportSchema),
    defaultValues: {
      source: 'web',
      bug_type: 'ui_bug',
      severity: 'medium',
      tags: [],
    },
  })

  const onSubmit = async (data: BugReportFormData) => {
    try {
      if (attachments.length > 0) {
        const formData = new FormData()
        Object.entries(data).forEach(([key, value]) => {
          if (key === 'device_info') {
            formData.append(key, JSON.stringify(value))
          } else if (key === 'tags' && Array.isArray(value)) {
            formData.append(key, JSON.stringify(value))
          } else {
            formData.append(key, value as string)
          }
        })
        attachments.forEach(file => formData.append('files', file))

        await createBugReportWithMedia(formData).unwrap()
      } else {
        await createBugReport(data).unwrap()
      }

      toast({
        title: 'Bug Report Created',
        description: 'Thank you for reporting this issue. We will look into it.',
      })
      setIsOpen(false)
      form.reset()
      setAttachments([])
      onSuccess?.()
    } catch (error) {
      toast({
        title: 'Report Failed',
        description: 'Failed to create bug report. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setAttachments(prev => [...prev, ...files])
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Report Bug
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Report a Bug</DialogTitle>
          <DialogDescription>
            Help us improve by reporting issues you encounter
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Source</Label>
              <Select {...form.register('source')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                <SelectItem value="web">Web</SelectItem>
                <SelectItem value="mobile">Mobile</SelectItem>
                <SelectItem value="api">API</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Bug Type</Label>
            <Select {...form.register('bug_type')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ui_bug">UI Bug</SelectItem>
                <SelectItem value="functionality_bug">Functionality Bug</SelectItem>
                <SelectItem value="performance_issue">Performance Issue</SelectItem>
                <SelectItem value="crash">Crash</SelectItem>
                <SelectItem value="feature_request">Feature Request</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
            <div className="space-y-2">
              <Label>Severity</Label>
              <Select {...form.register('severity')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              {...form.register('title')}
              placeholder="Brief description of the issue"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...form.register('description')}
              placeholder="Detailed description of the issue"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="steps_to_reproduce">Steps to Reproduce</Label>
            <Textarea
              id="steps_to_reproduce"
              {...form.register('steps_to_reproduce')}
              placeholder="1. Step one&#10;2. Step two&#10;3. Step three"
              rows={4}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="expected_behavior">Expected Behavior</Label>
              <Textarea
                id="expected_behavior"
                {...form.register('expected_behavior')}
                placeholder="What should have happened?"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="actual_behavior">Actual Behavior</Label>
              <Textarea
                id="actual_behavior"
                {...form.register('actual_behavior')}
                placeholder="What actually happened?"
                rows={3}
              />
            </div>
          </div>

          {/* Device Information */}
          <div className="space-y-4">
            <Label className="text-base">Device Information (Optional)</Label>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="os">Operating System</Label>
                <Input
                  id="os"
                  {...form.register('device_info.os')}
                  placeholder="e.g., Windows 10, iOS 15.0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="browser">Browser</Label>
                <Input
                  id="browser"
                  {...form.register('device_info.browser')}
                  placeholder="e.g., Chrome 96.0, Safari 15.0"
                />
              </div>
            </div>
          </div>

          {/* Attachments */}
          <div className="space-y-2">
            <Label>Attachments (Optional)</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-4">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                accept="image/*,video/*,.pdf,.doc,.docx"
              />
              <div className="text-center">
                <Paperclip className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-2">
                  Drag and drop files here or click to browse
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Choose Files
                </Button>
              </div>
            </div>
            {attachments.length > 0 && (
              <div className="space-y-2">
                <Label>Selected Files</Label>
                <div className="space-y-2">
                  {attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        {file.type.startsWith('image/') ? (
                          <Image className="h-5 w-5 text-blue-500" />
                        ) : file.type.startsWith('video/') ? (
                          <Video className="h-5 w-5 text-green-500" />
                        ) : (
                          <FileText className="h-5 w-5 text-muted-foreground" />
                        )}
                        <span className="text-sm truncate">{file.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {(file.size / 1024).toFixed(1)}KB
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAttachment(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1">
              Submit Report
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

const BugReportsPage: React.FC = () => {
  const { user } = useAuth()
  const { toast } = useToast()
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const { data: bugReports, refetch } = useGetBugReportsQuery({
    status: statusFilter === 'all' ? undefined : statusFilter,
    bug_type: typeFilter === 'all' ? undefined : typeFilter,
  })

  const [updateBugReport] = useUpdateBugReportMutation()

  const filteredReports = (bugReports || []).filter(report => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const userName = report.user?.full_name?.toLowerCase() || ''
      return (
        report.title.toLowerCase().includes(query) ||
        report.description.toLowerCase().includes(query) ||
        userName.includes(query)
      )
    }
    return true
  }) || []

  const handleUpdateBugReport = async (id: number, data: any) => {
    try {
      await updateBugReport({ id, data }).unwrap()
      toast({
        title: 'Report Updated',
        description: 'Bug report has been updated successfully.',
      })
      refetch()
    } catch (error) {
      toast({
        title: 'Update Failed',
        description: 'Failed to update bug report. Please try again.',
        variant: 'destructive',
      })
    }
  }

  // Statistics
  const stats = {
    total: bugReports?.length || 0,
    open: (bugReports || []).filter(r => r.status === 'open').length || 0,
    inProgress: (bugReports || []).filter(r => r.status === 'in_progress').length || 0,
    resolved: (bugReports || []).filter(r => r.status === 'resolved').length || 0,
    critical: (bugReports || []).filter(r => r.severity === 'critical').length || 0,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bug Reports</h1>
          <p className="text-muted-foreground">
            Track and manage bug reports and issues
          </p>
        </div>
        <CreateBugReportDialog onSuccess={() => refetch()} />
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <Bug className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.open}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.resolved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search bug reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="ui_bug">UI Bug</SelectItem>
                <SelectItem value="functionality_bug">Functionality Bug</SelectItem>
                <SelectItem value="performance_issue">Performance Issue</SelectItem>
                <SelectItem value="crash">Crash</SelectItem>
                <SelectItem value="feature_request">Feature Request</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bug Reports List */}
      <div className="space-y-4">
        {filteredReports.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Bug className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No bug reports found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery ? 'Try adjusting your search' : 'Create your first bug report to get started'}
                </p>
                <CreateBugReportDialog onSuccess={() => refetch()} />
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredReports.map((bugReport) => (
            <BugReportCard
              key={bugReport.id}
              bugReport={bugReport}
              onUpdate={handleUpdateBugReport}
              showActions={user?.role === 'admin'}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default BugReportsPage
