import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import OwnerScopeGate from '@/features/pm/components/OwnerScopeGate'

export default function PmSettingsPage() {
  const { toast } = useToast()

  const [paymentDueDay, setPaymentDueDay] = useState(1)
  const [gracePeriodDays, setGracePeriodDays] = useState(5)
  const [lateFeeAmount, setLateFeeAmount] = useState(0)
  const [lateFeePercentage, setLateFeePercentage] = useState(0)

  const [notifyLeaseExpiry, setNotifyLeaseExpiry] = useState(true)
  const [notifyRentOverdue, setNotifyRentOverdue] = useState(true)
  const [notifyMaintenance, setNotifyMaintenance] = useState(true)
  const [notifyApplication, setNotifyApplication] = useState(true)

  const handleSave = () => {
    toast({ title: 'Settings saved', description: 'PM portal settings have been updated.' })
  }

  return (
    <OwnerScopeGate>
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">PM Settings</h1>
          <p className="text-sm text-muted-foreground">
            Configure property management portal defaults.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Payment & Late Fees</CardTitle>
            <CardDescription>
              Default payment terms for new leases and properties.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="paymentDueDay">Payment Due Day</Label>
                <Input
                  id="paymentDueDay"
                  type="number"
                  min={1}
                  max={28}
                  value={paymentDueDay}
                  onChange={(e) => setPaymentDueDay(Number(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">
                  Day of month rent is due (1-28).
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="gracePeriodDays">Grace Period (days)</Label>
                <Input
                  id="gracePeriodDays"
                  type="number"
                  min={0}
                  max={30}
                  value={gracePeriodDays}
                  onChange={(e) => setGracePeriodDays(Number(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">
                  Days after due date before late fees apply.
                </p>
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="lateFeeAmount">Fixed Late Fee</Label>
                <Input
                  id="lateFeeAmount"
                  type="number"
                  min={0}
                  value={lateFeeAmount}
                  onChange={(e) => setLateFeeAmount(Number(e.target.value))}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lateFeePercentage">Late Fee Percentage (%)</Label>
                <Input
                  id="lateFeePercentage"
                  type="number"
                  min={0}
                  max={100}
                  step={0.1}
                  value={lateFeePercentage}
                  onChange={(e) => setLateFeePercentage(Number(e.target.value))}
                  placeholder="0"
                />
                <p className="text-xs text-muted-foreground">
                  Percentage of monthly rent, applied if fixed fee is 0.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Notification Preferences</CardTitle>
            <CardDescription>
              Choose which PM events trigger in-app notifications.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Lease Expiry Warnings</Label>
                <p className="text-xs text-muted-foreground">
                  Notify when leases are approaching expiry.
                </p>
              </div>
              <Switch checked={notifyLeaseExpiry} onCheckedChange={setNotifyLeaseExpiry} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Rent Overdue Alerts</Label>
                <p className="text-xs text-muted-foreground">
                  Notify when rent payments become overdue.
                </p>
              </div>
              <Switch checked={notifyRentOverdue} onCheckedChange={setNotifyRentOverdue} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Maintenance Request Updates</Label>
                <p className="text-xs text-muted-foreground">
                  Notify on new or updated maintenance requests.
                </p>
              </div>
              <Switch checked={notifyMaintenance} onCheckedChange={setNotifyMaintenance} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Application Decisions</Label>
                <p className="text-xs text-muted-foreground">
                  Notify when rental applications are submitted or decided.
                </p>
              </div>
              <Switch checked={notifyApplication} onCheckedChange={setNotifyApplication} />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} className="rounded-cohere-pill px-6">
            Save Settings
          </Button>
        </div>
      </div>
    </OwnerScopeGate>
  )
}
