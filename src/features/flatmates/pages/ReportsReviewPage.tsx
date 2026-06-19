import React, { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RotateCcw } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { formatDateTime } from '@/lib/format'
import { AlertTriangle, CheckCircle2, Shield, Flag, MessageSquare } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { getErrorMessage } from '@/lib/errors'
import { LoadingState } from '@/components/ui/loading-state'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { EmptyState } from '@/components/ui/empty-state'
import { useGetPendingReportsQuery, useModerateReportMutation } from '../api/flatmatesApi'
import type { FlatmatesReport } from '../types'

const reasonLabels: Record<string, string> = {
  spam: 'Spam',
  fake_profile: 'Fake Profile',
  abuse: 'Abuse/Harassment',
  inappropriate: 'Inappropriate Content',
  other: 'Other',
}

const statusLabels: Record<string, string> = {
  open: 'Open',
  reviewed: 'Reviewed',
  dismissed: 'Dismissed',
  actioned: 'Actioned',
}

export function ReportsReviewPage() {
  const { toast } = useToast()
  const [selectedReport, setSelectedReport] = useState<FlatmatesReport | null>(null)
  const [action, setAction] = useState<'dismiss' | 'warn_user' | 'suspend_user' | 'escalate'>('dismiss')
  const [notes, setNotes] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const { data, isLoading, error, refetch } = useGetPendingReportsQuery({
    status: 'open',
  })
  const [moderateReport, { isLoading: isModerating }] =
    useModerateReportMutation()

  const handleModerate = (report: FlatmatesReport) => {
    setSelectedReport(report)
    setIsDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!selectedReport) return
    try {
      await moderateReport({
        reportId: selectedReport.id,
        payload: { action, notes: notes.trim() || undefined },
      }).unwrap()
      toast({ title: 'Report moderated successfully' })
      setIsDialogOpen(false)
      setNotes('')
    } catch (err) {
      toast({
        title: 'Failed to moderate report',
        description: getErrorMessage(err),
        variant: 'destructive',
      })
    }
  }

  const getReasonBadge = (reason: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      spam: 'secondary',
      fake_profile: 'destructive',
      abuse: 'destructive',
      inappropriate: 'destructive',
      other: 'outline',
    }
    return (
      <Badge variant={variants[reason] || 'outline'}>
        {reasonLabels[reason] || reason}
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingState type="spinner" />
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold">Error Loading Reports</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-destructive">
            {getErrorMessage(error, 'Failed to load reports')}
          </p>
          <Button variant="outline" onClick={() => void refetch()}><RotateCcw className="mr-2 h-4 w-4" />Retry</Button>
        </CardContent>
      </Card>
    )
  }

  const reports = data?.items || []

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">User Reports Review</h1>
          <p className="text-muted-foreground mt-1">
            Review and take action on user safety reports
          </p>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          {reports.length} Pending
        </Badge>
      </div>

      {reports.length === 0 ? (
        <EmptyState
          icon={<CheckCircle2 className="h-12 w-12" />}
          title="All reports reviewed"
          description="All reports have been reviewed."
        />
      ) : (
        <div className="grid gap-4">
          {reports.map((report) => (
            <Card key={report.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">Report #{report.id}</h3>
                      {getReasonBadge(report.reason)}
                      <Badge variant="outline">
                        {statusLabels[report.status]}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Reported by: {report.reporter?.full_name || 'Anonymous'} • 
                      Reported: {report.reported_user?.full_name || 'Unknown User'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleModerate(report)}
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Review
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {report.description && (
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Flag className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <p className="text-sm">{report.description}</p>
                      </div>
                    </div>
                  )}
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Reporter:</span>
                      <p className="font-medium">{report.reporter?.email || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Reported User:</span>
                      <p className="font-medium">{report.reported_user?.email || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Reported:</span>
                      <p className="font-medium">
                        {formatDateTime(report.created_at)}
                      </p>
                    </div>
                  </div>
                  {report.conversation_id && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MessageSquare className="h-4 w-4" />
                      <span>Conversation ID: {report.conversation_id}</span>
                    </div>
                  )}
                  {report.property_id && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Property ID: {report.property_id}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Moderate User Report</DialogTitle>
          </DialogHeader>
          
          {selectedReport && (
            <div className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Report ID:</span>
                  <span className="font-medium">#{selectedReport.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Reason:</span>
                  <span className="font-medium">{reasonLabels[selectedReport.reason]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Reporter:</span>
                  <span className="font-medium">{selectedReport.reporter?.full_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Reported User:</span>
                  <span className="font-medium">{selectedReport.reported_user?.full_name}</span>
                </div>
                {selectedReport.description && (
                  <div className="pt-2 border-t">
                    <p className="text-sm">{selectedReport.description}</p>
                  </div>
                )}
              </div>

              <div>
                <Label>Action</Label>
                <Select
                  value={action}
                  onValueChange={(v) => setAction(v as 'dismiss' | 'warn_user' | 'suspend_user' | 'escalate')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dismiss">Dismiss - No action needed</SelectItem>
                    <SelectItem value="warn_user">
                      <span className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />
                        Warn User - Send warning notification
                      </span>
                    </SelectItem>
                    <SelectItem value="suspend_user">
                      <span className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-red-500 dark:text-red-400" />
                        Suspend User - Temporary account suspension
                      </span>
                    </SelectItem>
                    <SelectItem value="escalate">
                      <span className="flex items-center gap-2">
                        <Flag className="h-4 w-4 text-orange-500 dark:text-orange-400" />
                        Escalate - Requires senior review
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes">Admin Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Document your decision and reasoning..."
                  rows={4}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => void handleSubmit()}
              disabled={isModerating}
            >
              {isModerating ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2 inline-flex" />
                  Processing...
                </>
              ) : (
                <>Submit Decision</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ReportsReviewPage
