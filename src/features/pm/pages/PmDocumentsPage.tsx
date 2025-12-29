import { useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { FileUp, FolderOpen } from 'lucide-react'
import OwnerScopeGate from '@/features/pm/components/OwnerScopeGate'
import { useUserRole } from '@/hooks/useUserRole'
import { useAppSelector } from '@/hooks/redux'
import { selectSelectedOwnerId } from '@/features/pm/slices/pmSlice'
import {
  type Document,
  type DocumentType,
  type DocumentUpdate,
  useListPmDocumentsQuery,
  useUpdatePmDocumentMutation,
  useUploadPmDocumentMutation,
} from '@/features/pm/api/pmApi'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { getErrorMessage } from '@/lib/errors'

export default function PmDocumentsPage() {
  const { role } = useUserRole()
  const selectedOwnerId = useAppSelector(selectSelectedOwnerId)
  const { toast } = useToast()

  const ownerId = selectedOwnerId
  const canUpload = role !== 'admin' || Boolean(ownerId)

  const [docTypeFilter, setDocTypeFilter] = useState<DocumentType | ''>('')
  const [limit, setLimit] = useState(50)
  const [offset, setOffset] = useState(0)

  const docs = useListPmDocumentsQuery(
    { owner_id: ownerId, document_type: docTypeFilter || undefined, limit, offset },
    { skip: role === 'agent' && !ownerId },
  )

  const [uploadDoc, uploadDocState] = useUploadPmDocumentMutation()
  const [updateDoc, updateDocState] = useUpdatePmDocumentMutation()

  const columns = useMemo<ColumnDef<Document>[]>(() => {
    return [
      {
        accessorKey: 'title',
        header: 'Document',
        cell: ({ row }) => (
          <div className="min-w-0">
            <div className="truncate font-medium">{row.original.title}</div>
            <div className="truncate text-xs text-muted-foreground">{row.original.document_type} • Doc #{row.original.id}</div>
          </div>
        ),
      },
      {
        id: 'linked',
        header: 'Linked',
        cell: ({ row }) => (
          <div className="text-xs text-muted-foreground">
            {row.original.property_id ? `P#${row.original.property_id} ` : ''}
            {row.original.lease_id ? `L#${row.original.lease_id} ` : ''}
            {row.original.user_id ? `U#${row.original.user_id} ` : ''}
          </div>
        ),
      },
      {
        id: 'sharing',
        header: 'Sharing',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Badge variant={row.original.shared_with_agent ? 'default' : 'outline'}>agent</Badge>
            <Badge variant={row.original.shared_with_tenant ? 'default' : 'outline'}>tenant</Badge>
          </div>
        ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            <Button asChild variant="outline" size="sm">
              <a href={row.original.file_url} target="_blank" rel="noreferrer">
                View
              </a>
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">Edit</Button>
              </DialogTrigger>
              <DialogContent className="max-w-xl">
                <DialogHeader>
                  <DialogTitle>Edit document</DialogTitle>
                </DialogHeader>
                <DocumentEditForm
                  doc={row.original}
                  onSubmit={async (payload) => {
                    try {
                      await updateDoc({ document_id: row.original.id, payload }).unwrap()
                      toast({ title: 'Updated', description: 'Document updated.' })
                    } catch (e: unknown) {
                      toast({ title: 'Failed', description: getErrorMessage(e, 'Could not update document.'), variant: 'destructive' })
                    }
                  }}
                  isSubmitting={updateDocState.isLoading}
                />
              </DialogContent>
            </Dialog>
          </div>
        ),
      },
    ]
  }, [toast, updateDoc, updateDocState.isLoading])

  // Upload modal state
  const [uploadOpen, setUploadOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [docType, setDocType] = useState<DocumentType>('other')
  const [title, setTitle] = useState('')
  const [propertyId, setPropertyId] = useState('')
  const [leaseId, setLeaseId] = useState('')
  const [userId, setUserId] = useState('')
  const [shareAgent, setShareAgent] = useState(true)
  const [shareTenant, setShareTenant] = useState(false)

  const submitUpload = async () => {
    if (!file || !title) {
      toast({ title: 'Missing fields', description: 'File and title are required.', variant: 'destructive' })
      return
    }
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('document_type', docType)
      fd.append('title', title)
      if (ownerId) fd.append('owner_id', String(ownerId))
      if (propertyId) fd.append('property_id', propertyId)
      if (leaseId) fd.append('lease_id', leaseId)
      if (userId) fd.append('user_id', userId)
      fd.append('shared_with_agent', String(shareAgent))
      fd.append('shared_with_tenant', String(shareTenant))
      await uploadDoc(fd).unwrap()
      toast({ title: 'Uploaded', description: 'Document uploaded.' })
      setUploadOpen(false)
      setFile(null)
      setTitle('')
      setPropertyId('')
      setLeaseId('')
      setUserId('')
    } catch (e: unknown) {
      toast({ title: 'Upload failed', description: getErrorMessage(e, 'Please try again.'), variant: 'destructive' })
    }
  }

  const canPrev = offset > 0
  const canNext = (docs.data?.length ?? 0) >= limit

  return (
    <OwnerScopeGate>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
            <p className="text-sm text-muted-foreground">Upload, link, and manage sharing for documents.</p>
          </div>
          <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
            <DialogTrigger asChild>
              <Button disabled={!canUpload}>
                <FileUp className="mr-2 h-4 w-4" />
                Upload
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Upload document</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label>File</Label>
                  <Input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={docType} onValueChange={(v) => setDocType(v as DocumentType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lease_agreement">lease_agreement</SelectItem>
                      <SelectItem value="id_proof">id_proof</SelectItem>
                      <SelectItem value="address_proof">address_proof</SelectItem>
                      <SelectItem value="income_proof">income_proof</SelectItem>
                      <SelectItem value="inspection_report">inspection_report</SelectItem>
                      <SelectItem value="receipt">receipt</SelectItem>
                      <SelectItem value="invoice">invoice</SelectItem>
                      <SelectItem value="property_deed">property_deed</SelectItem>
                      <SelectItem value="insurance_policy">insurance_policy</SelectItem>
                      <SelectItem value="other">other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Property ID (optional)</Label>
                  <Input value={propertyId} onChange={(e) => setPropertyId(e.target.value)} placeholder="e.g. 123" />
                </div>
                <div className="space-y-2">
                  <Label>Lease ID (optional)</Label>
                  <Input value={leaseId} onChange={(e) => setLeaseId(e.target.value)} placeholder="e.g. 55" />
                </div>
                <div className="space-y-2">
                  <Label>User ID (optional)</Label>
                  <Input value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="e.g. owner user id" />
                </div>
                <div className="space-y-2">
                  <Label>Share with agent</Label>
                  <div className="flex items-center justify-between rounded-md border px-3 py-2">
                    <span className="text-sm text-muted-foreground">Agent can access</span>
                    <Switch checked={shareAgent} onCheckedChange={setShareAgent} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Share with tenant</Label>
                  <div className="flex items-center justify-between rounded-md border px-3 py-2">
                    <span className="text-sm text-muted-foreground">Tenant can access</span>
                    <Switch checked={shareTenant} onCheckedChange={setShareTenant} />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setUploadOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => { void submitUpload() }} disabled={uploadDocState.isLoading}>
                  {uploadDocState.isLoading ? 'Uploading…' : 'Upload'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        {role === 'admin' && !ownerId ? (
          <div className="text-sm text-muted-foreground">
            Select an owner from the top bar to upload documents into the correct portfolio.
          </div>
        ) : null}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Document Vault</CardTitle>
            <Badge variant="secondary" className="h-fit">
              <FolderOpen className="mr-1 h-3 w-3" />
              {docs.data?.length ?? 0} shown
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-3">
              <Select value={docTypeFilter} onValueChange={(v) => { setDocTypeFilter(v as DocumentType | ''); setOffset(0) }}>
                <SelectTrigger>
                  <SelectValue placeholder="Document type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  <SelectItem value="lease_agreement">lease_agreement</SelectItem>
                  <SelectItem value="id_proof">id_proof</SelectItem>
                  <SelectItem value="address_proof">address_proof</SelectItem>
                  <SelectItem value="income_proof">income_proof</SelectItem>
                  <SelectItem value="inspection_report">inspection_report</SelectItem>
                  <SelectItem value="receipt">receipt</SelectItem>
                  <SelectItem value="invoice">invoice</SelectItem>
                  <SelectItem value="property_deed">property_deed</SelectItem>
                  <SelectItem value="insurance_policy">insurance_policy</SelectItem>
                  <SelectItem value="other">other</SelectItem>
                </SelectContent>
              </Select>
              <Select value={String(limit)} onValueChange={(v) => { setLimit(Number(v)); setOffset(0) }}>
                <SelectTrigger>
                  <SelectValue placeholder="Page size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {docs.isLoading ? (
              <div className="text-sm text-muted-foreground">Loading…</div>
            ) : docs.data?.length ? (
              <>
                <DataTable columns={columns} data={docs.data} />
                <div className="flex items-center justify-between pt-2">
                  <div className="text-xs text-muted-foreground">
                    Offset {offset} • Limit {limit}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!canPrev}
                      onClick={() => setOffset(Math.max(0, offset - limit))}
                    >
                      Prev
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!canNext}
                      onClick={() => setOffset(offset + limit)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <EmptyState title="No documents" description="Upload a document to get started." />
            )}
          </CardContent>
        </Card>
      </div>
    </OwnerScopeGate>
  )
}

function DocumentEditForm({
  doc,
  onSubmit,
  isSubmitting,
}: {
  doc: Document
  onSubmit: (payload: DocumentUpdate) => Promise<void>
  isSubmitting: boolean
}) {
  const [title, setTitle] = useState(doc.title)
  const [shareAgent, setShareAgent] = useState(doc.shared_with_agent)
  const [shareTenant, setShareTenant] = useState(doc.shared_with_tenant)

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Title</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Share with agent</Label>
          <div className="flex items-center justify-between rounded-md border px-3 py-2">
            <span className="text-sm text-muted-foreground">Agent can access</span>
            <Switch checked={shareAgent} onCheckedChange={setShareAgent} />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Share with tenant</Label>
          <div className="flex items-center justify-between rounded-md border px-3 py-2">
            <span className="text-sm text-muted-foreground">Tenant can access</span>
            <Switch checked={shareTenant} onCheckedChange={setShareTenant} />
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        <Button
          onClick={() => {
            const payload: DocumentUpdate = {
              title,
              shared_with_agent: shareAgent,
              shared_with_tenant: shareTenant,
            }
            void onSubmit(payload)
          }}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </div>
  )
}
