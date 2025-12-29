import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FileUp, RefreshCw, ShieldX } from 'lucide-react'
import {
  type DocumentType,
  type LeaseRenew,
  useGetPmLeaseQuery,
  useRenewPmLeaseMutation,
  useTerminatePmLeaseMutation,
  useUploadPmDocumentMutation,
  useUploadSignedPmLeaseMutation,
} from '@/features/pm/api/pmApi'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { getErrorMessage } from '@/lib/errors'

export default function PmLeaseDetailPage() {
  const { leaseId } = useParams()
  const leaseIdNum = Number(leaseId)
  const { toast } = useToast()

  const lease = useGetPmLeaseQuery(leaseIdNum, { skip: !leaseIdNum })
  const [terminateLease, terminateState] = useTerminatePmLeaseMutation()
  const [renewLease, renewState] = useRenewPmLeaseMutation()
  const [uploadDoc, uploadDocState] = useUploadPmDocumentMutation()
  const [uploadSigned, uploadSignedState] = useUploadSignedPmLeaseMutation()

  const [uploadOpen, setUploadOpen] = useState(false)
  const [signedFile, setSignedFile] = useState<File | null>(null)
  const [signedByOwner, setSignedByOwner] = useState<'yes' | 'no'>('yes')
  const [signedByTenant, setSignedByTenant] = useState<'yes' | 'no'>('no')

  const submitSignedUpload = async () => {
    if (!lease.data) return
    if (!signedFile) {
      toast({ title: 'Missing file', description: 'Choose a signed lease PDF.', variant: 'destructive' })
      return
    }
    try {
      const fd = new FormData()
      fd.append('file', signedFile)
      fd.append('document_type', 'lease_agreement' satisfies DocumentType)
      fd.append('title', `Signed lease #${lease.data.id}`)
      fd.append('owner_id', String(lease.data.owner_id))
      fd.append('property_id', String(lease.data.property_id))
      fd.append('lease_id', String(lease.data.id))
      fd.append('shared_with_agent', 'true')
      fd.append('shared_with_tenant', 'true')

      const doc = await uploadDoc(fd).unwrap()
      await uploadSigned({
        lease_id: lease.data.id,
        payload: {
          lease_document_id: doc.id,
          signed_by_owner: signedByOwner === 'yes',
          signed_by_tenant: signedByTenant === 'yes',
        },
      }).unwrap()
      toast({ title: 'Uploaded', description: 'Signed lease attached.' })
      setUploadOpen(false)
      setSignedFile(null)
    } catch (e: unknown) {
      toast({ title: 'Upload failed', description: getErrorMessage(e, 'Please try again.'), variant: 'destructive' })
    }
  }

  const [renewOpen, setRenewOpen] = useState(false)
  const [renewStart, setRenewStart] = useState('')
  const [renewEnd, setRenewEnd] = useState('')
  const [renewRent, setRenewRent] = useState('')
  const [renewDeposit, setRenewDeposit] = useState('')
  const [makeActive, setMakeActive] = useState<'yes' | 'no'>('no')

  const submitRenew = async () => {
    if (!lease.data) return
    if (!renewStart || !renewEnd) {
      toast({ title: 'Missing fields', description: 'Start and end dates are required.', variant: 'destructive' })
      return
    }
    const payload: LeaseRenew = {
      start_date: renewStart,
      end_date: renewEnd,
      monthly_rent: renewRent ? Number(renewRent) : undefined,
      security_deposit: renewDeposit ? Number(renewDeposit) : undefined,
      make_active: makeActive === 'yes',
    } as unknown as LeaseRenew

    try {
      await renewLease({ lease_id: lease.data.id, payload }).unwrap()
      toast({ title: 'Renewed', description: 'New lease created.' })
      setRenewOpen(false)
    } catch (e: unknown) {
      toast({ title: 'Failed', description: getErrorMessage(e, 'Could not renew lease.'), variant: 'destructive' })
    }
  }

  const canTerminate = lease.data?.status !== 'terminated'

  const headerTitle = useMemo(() => {
    if (lease.isLoading) return 'Loading…'
    if (!lease.data) return `Lease #${leaseIdNum}`
    return `Lease #${lease.data.id}`
  }, [lease.data, lease.isLoading, leaseIdNum])

  if (!leaseIdNum || Number.isNaN(leaseIdNum)) {
    return <div className="text-sm text-muted-foreground">Invalid lease id.</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">{headerTitle}</h1>
          <p className="text-sm text-muted-foreground">
            Property #{lease.data?.property_id} • Owner #{lease.data?.owner_id}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {lease.data ? <Badge variant="secondary">{lease.data.status}</Badge> : null}
          <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <FileUp className="mr-2 h-4 w-4" />
                Upload signed
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>Upload signed lease</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>PDF file</Label>
                  <Input type="file" accept="application/pdf" onChange={(e) => setSignedFile(e.target.files?.[0] ?? null)} />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Signed by owner</Label>
                    <Select value={signedByOwner} onValueChange={(v) => setSignedByOwner(v as 'yes' | 'no')}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Signed by tenant</Label>
                    <Select value={signedByTenant} onValueChange={(v) => setSignedByTenant(v as 'yes' | 'no')}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setUploadOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={() => { void submitSignedUpload() }}
                    disabled={uploadDocState.isLoading || uploadSignedState.isLoading || !signedFile}
                  >
                    {uploadDocState.isLoading || uploadSignedState.isLoading ? 'Uploading…' : 'Upload'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={renewOpen} onOpenChange={setRenewOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Renew
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>Renew lease</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Start date</Label>
                  <Input type="date" value={renewStart} onChange={(e) => setRenewStart(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>End date</Label>
                  <Input type="date" value={renewEnd} onChange={(e) => setRenewEnd(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Monthly rent (optional)</Label>
                  <Input value={renewRent} onChange={(e) => setRenewRent(e.target.value)} placeholder="e.g. 27000" />
                </div>
                <div className="space-y-2">
                  <Label>Security deposit (optional)</Label>
                  <Input value={renewDeposit} onChange={(e) => setRenewDeposit(e.target.value)} placeholder="e.g. 50000" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Make active</Label>
                  <Select value={makeActive} onValueChange={(v) => setMakeActive(v as 'yes' | 'no')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no">No (draft)</SelectItem>
                      <SelectItem value="yes">Yes (active)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setRenewOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => { void submitRenew() }} disabled={renewState.isLoading}>
                  {renewState.isLoading ? 'Renewing…' : 'Renew'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button
            variant="destructive"
            disabled={!canTerminate || terminateState.isLoading}
            onClick={() => {
              if (!lease.data) return
              const leaseIdToTerminate = lease.data.id
              void (async () => {
                try {
                  await terminateLease(leaseIdToTerminate).unwrap()
                  toast({ title: 'Terminated', description: 'Lease terminated.' })
                } catch (e: unknown) {
                  toast({ title: 'Failed', description: getErrorMessage(e, 'Could not terminate lease.'), variant: 'destructive' })
                }
              })()
            }}
          >
            <ShieldX className="mr-2 h-4 w-4" />
            Terminate
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {lease.isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            ) : lease.data ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Tenant</span>
                  <span className="font-medium">{lease.data.tenant_name || lease.data.tenant_phone || '—'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Term</span>
                  <span className="font-medium">
                    {new Date(lease.data.start_date).toLocaleDateString()} → {new Date(lease.data.end_date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Monthly rent</span>
                  <span className="font-medium">₹{lease.data.monthly_rent.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Security deposit</span>
                  <span className="font-medium">₹{lease.data.security_deposit.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Due day</span>
                  <span className="font-medium">{lease.data.payment_due_day}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Grace period</span>
                  <span className="font-medium">{lease.data.grace_period_days} days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Lease document</span>
                  {lease.data.lease_document_id ? (
                    <span className="font-medium">Document #{lease.data.lease_document_id}</span>
                  ) : (
                    <span className="text-muted-foreground">Not uploaded</span>
                  )}
                </div>
              </>
            ) : (
              <div className="text-muted-foreground">Not found.</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {lease.data ? (
              <>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link to={`/pm/properties/${lease.data.property_id}`}>Open property</Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link to="/pm/rent-ledger">Open rent ledger</Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link to="/pm/documents">Open documents</Link>
                </Button>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">—</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
