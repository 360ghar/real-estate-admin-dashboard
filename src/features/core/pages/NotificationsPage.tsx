import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { useSendMarketingBroadcastMutation, useSendMarketingToSegmentMutation } from '@/features/core/api/notificationsApi'
import { useListAgentsQuery } from '@/features/agents/api/agentsApi'

const NotificationsPage: React.FC = () => {
  const { toast } = useToast()

  const [broadcastType, setBroadcastType] = useState<string>('promotion_generic')
  const [broadcastTitle, setBroadcastTitle] = useState<string>('Latest offers from 360 Ghar')
  const [broadcastBody, setBroadcastBody] = useState<string>('')

  const [segmentType, setSegmentType] = useState<string>('promotion_generic')
  const [segmentTitle, setSegmentTitle] = useState<string>('Personalised update from 360 Ghar')
  const [segmentBody, setSegmentBody] = useState<string>('')
  const [segmentRole, setSegmentRole] = useState<'user' | 'agent' | 'admin' | 'all'>('user')
  const [segmentAgentId, setSegmentAgentId] = useState<number | 'all'>('all')

  const [sendBroadcast, sendBroadcastState] = useSendMarketingBroadcastMutation()
  const [sendSegment, sendSegmentState] = useSendMarketingToSegmentMutation()

  const agents = useListAgentsQuery({ include_inactive: false })

  const marketingTypes = [
    { value: 'promotion_generic', label: 'Promotion (generic)' },
    { value: 'discount_offer', label: 'Discount offer' },
    { value: 'win_back', label: 'Win-back' },
    { value: 'upsell_suggestion', label: 'Upsell suggestion' },
    { value: 'onboarding_nudge', label: 'Onboarding nudge' },
    { value: 'property_recommendation', label: 'Property recommendation' },
    { value: 'daily_digest', label: 'Daily digest' },
  ]

  const handleSendBroadcast = async () => {
    if (!broadcastBody.trim()) {
      toast({
        title: 'Message required',
        description: 'Please enter a message body for the broadcast.',
        variant: 'destructive',
      })
      return
    }
    try {
      const res = await sendBroadcast({
        typeKey: broadcastType,
        title: broadcastTitle,
        body: broadcastBody,
      }).unwrap()
      toast({
        title: 'Broadcast queued',
        description: `Requested: ${res.requested}, processed: ${res.processed}.`,
      })
      setBroadcastBody('')
    } catch (e: unknown) {
      toast({
        title: 'Failed to send broadcast',
        description: (e as any)?.data?.detail || 'Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleSendSegment = async () => {
    if (!segmentBody.trim()) {
      toast({
        title: 'Message required',
        description: 'Please enter a message body for the segment notification.',
        variant: 'destructive',
      })
      return
    }
    try {
      const res = await sendSegment({
        typeKey: segmentType,
        title: segmentTitle,
        body: segmentBody,
        filter: {
          role: segmentRole === 'all' ? undefined : segmentRole,
          agent_id: segmentAgentId === 'all' ? undefined : segmentAgentId,
          is_active: true,
        },
      }).unwrap()
      toast({
        title: 'Segment notification queued',
        description: `Requested: ${res.requested}, processed: ${res.processed}.`,
      })
      setSegmentBody('')
    } catch (e: unknown) {
      toast({
        title: 'Failed to send to segment',
        description: (e as any)?.data?.detail || 'Please try again.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Marketing Notifications</h1>
        <p className="text-muted-foreground">
          Send targeted or broadcast marketing messages to app users, respecting their
          notification preferences.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Broadcast to all users</CardTitle>
          <CardDescription>
            Send a single marketing notification to all active users. This will respect each
            user&apos;s marketing opt-in settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Notification type</Label>
              <Select value={broadcastType} onValueChange={setBroadcastType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {marketingTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Title</Label>
              <Input value={broadcastTitle} onChange={(e) => setBroadcastTitle(e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Message</Label>
            <Textarea
              rows={4}
              value={broadcastBody}
              onChange={(e) => setBroadcastBody(e.target.value)}
              placeholder="Write the broadcast message to send to all users…"
            />
          </div>
          <div className="flex justify-end">
            <Button
              type="button"
              onClick={handleSendBroadcast}
              disabled={sendBroadcastState.isLoading}
            >
              {sendBroadcastState.isLoading ? 'Sending…' : 'Send broadcast'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Targeted segment</CardTitle>
          <CardDescription>
            Send marketing notifications to a filtered audience (by role and/or assigned agent).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label>User role</Label>
              <Select
                value={segmentRole}
                onValueChange={(v) => setSegmentRole(v as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All roles</SelectItem>
                  <SelectItem value="user">Users</SelectItem>
                  <SelectItem value="agent">Agents</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Assigned agent (optional)</Label>
              <Select
                value={segmentAgentId === 'all' ? 'all' : String(segmentAgentId)}
                onValueChange={(v) => setSegmentAgentId(v === 'all' ? 'all' : Number(v))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All agents" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All agents</SelectItem>
                  {(agents.data?.results || []).map((a) => (
                    <SelectItem key={a.id} value={String(a.id)}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Notification type</Label>
              <Select value={segmentType} onValueChange={setSegmentType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {marketingTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Title</Label>
            <Input value={segmentTitle} onChange={(e) => setSegmentTitle(e.target.value)} />
          </div>
          <div>
            <Label>Message</Label>
            <Textarea
              rows={4}
              value={segmentBody}
              onChange={(e) => setSegmentBody(e.target.value)}
              placeholder="Describe the offer or message for this segment…"
            />
          </div>
          <div className="flex justify-end">
            <Button
              type="button"
              onClick={handleSendSegment}
              disabled={sendSegmentState.isLoading}
            >
              {sendSegmentState.isLoading ? 'Sending…' : 'Send to segment'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default NotificationsPage
