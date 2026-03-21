import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Building2, FileUp, Users, Wrench } from 'lucide-react'
import { useUserRole } from '@/hooks/useUserRole'
import { useAppDispatch } from '@/hooks/redux'
import { setSelectedOwner } from '@/features/pm/slices/pmSlice'
import OwnerScopeGate from '@/features/pm/components/OwnerScopeGate'
import {
  type DocumentType,
  useGetPmDashboardActivityQuery,
  useGetPmDashboardOverviewQuery,
  useListMaintenanceRequestsQuery,
  useListPmDocumentsQuery,
  useUploadPmDocumentMutation,
} from '@/features/pm/api/pmApi'
import { useGetUserQuery, useUpdateUserMutation } from '@/features/users/api/usersApi'
import AssignAgent from '@/features/users/components/assign/AssignAgent'
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

const formatINR = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)

const kycStatuses = ['unknown', 'pending', 'verified', 'rejected'] as const
type KycStatus = (typeof kycStatuses)[number]

export default function PmOwnerDetailPage() {
  const { ownerId } = useParams()
  const ownerUserId = Number(ownerId)
  const { role } = useUserRole()
  const dispatch = useAppDispatch()
  const { toast } = useToast()

  const owner = useGetUserQuery(ownerUserId, { skip: !ownerUserId })
  const overview = useGetPmDashboardOverviewQuery({ owner_id: ownerUserId }, { skip: !ownerUserId })
  const activity = useGetPmDashboardActivityQuery({ owner_id: ownerUserId, limit: 20 }, { skip: !ownerUserId })

  const maintenance = useListMaintenanceRequestsQuery(
    { owner_id: ownerUserId, limit: 10, offset: 0 },
    { skip: !ownerUserId },
  )

  const kycDocs = useListPmDocumentsQuery(
    { owner_id: ownerUserId, user_id: ownerUserId, limit: 10, offset: 0 },
    { skip: !ownerUserId },
  )

  const [uploadDoc, uploadDocState] = useUploadPmDocumentMutation()
  const [updateUser, updateUserState] = useUpdateUserMutation()

  useEffect(() => {
    if (role === 'agent' && owner.data) {
      dispatch(setSelectedOwner({ id: owner.data.id, label: owner.data.full_name || owner.data.phone || `Owner #${owner.data.id}` }))
    }
  }, [dispatch, owner.data, role])

  const kycStatus: KycStatus = useMemo(() => {
    const prefs = owner.data?.preferences as unknown as Record<string, unknown> | undefined
    const raw = prefs?.pm_kyc_status ?? prefs?.kyc_status
    if (typeof raw === 'string' && (kycStatuses as readonly string[]).includes(raw)) return raw as KycStatus
    return 'unknown'
  }, [owner.data?.preferences])

  const setKycStatus = async (next: KycStatus) => {
    if (!owner.data) return
    const currentPrefs = (owner.data.preferences as unknown as Record<string, unknown> | undefined) ?? {}
    try {
      await updateUser({
        id: owner.data.id,
        data: { preferences: { ...currentPrefs, pm_kyc_status: next } },
      }).unwrap()
      toast({ title: 'Updated', description: 'KYC status updated.' })
    } catch (e: unknown) {
      toast({ title: 'Failed', description: getErrorMessage(e, 'Could not update KYC status.'), variant: 'destructive' })
    }
  }

  const [uploadOpen, setUploadOpen] = useState(false)
  const [docType, setDocType] = useState<DocumentType>('id_proof')
  const [docTitle, setDocTitle] = useState('KYC Document')
  const [docFile, setDocFile] = useState<File | null>(null)

  const submitKycUpload = async () => {
    if (!docFile) {
      toast({ title: 'Missing file', description: 'Choose a file to upload.', variant: 'destructive' })
      return
    }
    try {
      const fd = new FormData()
      fd.append('file', docFile)
      fd.append('document_type', docType)
      fd.append('title', docTitle)
      fd.append('owner_id', String(ownerUserId))
      fd.append('user_id', String(ownerUserId))
      fd.append('shared_with_agent', 'true')
      await uploadDoc(fd).unwrap()
      toast({ title: 'Uploaded', description: 'Document uploaded successfully.' })
      setUploadOpen(false)
      setDocFile(null)
    } catch (e: unknown) {
      toast({ title: 'Upload failed', description: getErrorMessage(e, 'Please try again.'), variant: 'destructive' })
    }
  }

  if (!ownerUserId || Number.isNaN(ownerUserId)) {
    return <div className="text-sm text-muted-foreground">Invalid owner id.</div>
  }

  return (
    <OwnerScopeGate allowAllOwners>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">
              {owner.data?.full_name || owner.data?.phone || `Owner #${ownerUserId}`}
            </h1>
            <p className="text-sm text-muted-foreground">Owner portfolio overview and operations.</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">ID: {ownerUserId}</Badge>
            <Badge variant="secondary">{role === 'admin' ? 'Admin view' : 'Agent view'}</Badge>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Managed Properties</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {overview.isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold">{overview.data?.total_properties ?? 0}</div>
              )}
              <Button asChild variant="link" className="h-auto p-0 text-xs mt-2">
                <Link to="/pm/properties">View properties</Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Outstanding Rent</CardTitle>
              <span className="text-muted-foreground">₹</span>
            </CardHeader>
            <CardContent>
              {overview.isLoading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <div className="text-2xl font-bold">{formatINR(overview.data?.outstanding_rent_total ?? 0)}</div>
              )}
              <Button asChild variant="link" className="h-auto p-0 text-xs mt-2">
                <Link to="/pm/rent-ledger">Open rent ledger</Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">KYC Status</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Badge variant={kycStatus === 'verified' ? 'default' : kycStatus === 'pending' ? 'secondary' : 'outline'}>
                {kycStatus}
              </Badge>
              {role === 'admin' ? (
                <Select value={kycStatus} onValueChange={(v) => { void setKycStatus(v as KycStatus) }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Set KYC status" />
                  </SelectTrigger>
                  <SelectContent>
                    {kycStatuses.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="text-xs text-muted-foreground">Only admins can update KYC status.</div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Open Maintenance</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {maintenance.isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{maintenance.data?.length ?? 0}</div>
              )}
              <Button asChild variant="link" className="h-auto p-0 text-xs mt-2">
                <Link to="/pm/maintenance">View maintenance</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {activity.isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              ) : activity.data?.length ? (
                <div className="space-y-2">
                  {activity.data.map((a, idx) => (
                    <div key={`${a.type}-${a.at}-${idx}`} className="flex items-center justify-between gap-4 text-sm">
                      <div className="min-w-0">
                        <span className="font-medium">{a.type}</span>
                        {a.status ? <span className="text-muted-foreground"> • {a.status}</span> : null}
                        {a.amount ? <span className="text-muted-foreground"> • {formatINR(a.amount)}</span> : null}
                      </div>
                      <div className="shrink-0 text-xs text-muted-foreground">
                        {new Date(a.at).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">No recent activity.</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>KYC Documents</CardTitle>
              <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" disabled={role !== 'admin'}>
                    <FileUp className="mr-2 h-4 w-4" />
                    Upload
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Upload KYC Document</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Document type</Label>
                      <Select value={docType} onValueChange={(v) => setDocType(v as DocumentType)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="id_proof">ID Proof</SelectItem>
                          <SelectItem value="address_proof">Address Proof</SelectItem>
                          <SelectItem value="income_proof">Income Proof</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input value={docTitle} onChange={(e) => setDocTitle(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>File</Label>
                      <Input type="file" onChange={(e) => setDocFile(e.target.files?.[0] ?? null)} />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setUploadOpen(false)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={() => { void submitKycUpload() }}
                        disabled={uploadDocState.isLoading || !docFile}
                      >
                        {uploadDocState.isLoading ? 'Uploading…' : 'Upload'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="space-y-2">
              {kycDocs.isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : kycDocs.data?.length ? (
                <div className="space-y-2">
                  {kycDocs.data.map((d) => (
                    <div key={d.id} className="flex items-center justify-between gap-3 text-sm">
                      <div className="min-w-0">
                        <div className="truncate font-medium">{d.title}</div>
                        <div className="truncate text-xs text-muted-foreground">{d.document_type}</div>
                      </div>
                      <Button asChild variant="outline" size="sm">
                        <a href={d.file_url} target="_blank" rel="noreferrer">
                          View
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">No KYC documents.</div>
              )}
              {role !== 'admin' ? (
                <div className="text-xs text-muted-foreground">Only admins can upload KYC documents.</div>
              ) : null}
              {updateUserState.isLoading ? (
                <div className="text-xs text-muted-foreground">Updating KYC status…</div>
              ) : null}
            </CardContent>
          </Card>
        </div>

        {role === 'admin' ? (
          <Card>
            <CardHeader>
              <CardTitle>Relationship Manager</CardTitle>
            </CardHeader>
            <CardContent>
              <AssignAgent userId={ownerUserId} />
            </CardContent>
          </Card>
        ) : null}
      </div>
    </OwnerScopeGate>
  )
}
