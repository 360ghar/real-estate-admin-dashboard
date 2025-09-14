import { useMemo, useState } from 'react'
import { useAppSelector } from '@/hooks/redux'
import { selectCurrentUser } from '@/store/slices/authSlice'
import { useDeletePropertyMutation, useListPropertiesQuery } from '@/store/services/propertiesApi'
import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import Pagination from '@/components/ui/pagination'
import { useToast } from '@/hooks/use-toast'
import { useDebounce } from '@/hooks/useDebounce'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

const PropertyList = () => {
  const user = useAppSelector(selectCurrentUser)
  const role = user?.agent_id ? 'agent' : 'admin'
  const [q, setQ] = useState('')
  const [city, setCity] = useState('')
  const [status, setStatus] = useState('')
  const [confirmId, setConfirmId] = useState<number | null>(null)
  const { toast } = useToast()
  const [page, setPage] = useState(1)
  const pageSize = 10

  const dq = useDebounce(q)
  const dcity = useDebounce(city)
  const params = useMemo(() => {
    const base: any = {}
    if (dq) base.q = dq
    if (dcity) base.city = dcity
    if (status) base.status = status
    if (role === 'agent' && user?.agent_id) base.agent_id = user.agent_id
    return base
  }, [dq, dcity, status, role, user?.agent_id])

  const { data, isFetching } = useListPropertiesQuery({ ...params, page, page_size: pageSize })
  const [del, delState] = useDeletePropertyMutation()

  const onDelete = async (id: number) => {
    try {
      await del(id).unwrap()
      toast({ title: 'Deleted', description: 'Property removed successfully' })
    } catch (e: any) {
      toast({ title: 'Delete failed', description: e?.data?.detail || 'Please try again', variant: 'destructive' })
    } finally {
      setConfirmId(null)
    }
  }

  return (
    <>
      <Card>
        <div className="mb-4 grid gap-3 md:grid-cols-4">
          <Input placeholder="Search" value={q} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQ(e.target.value)} />
          <Input placeholder="City" value={city} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCity(e.target.value)} />
          <Select value={status} onValueChange={(v) => setStatus(v === 'all' ? '' : v)}>
            <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="rented">Rented</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => { /* state change triggers refetch */ }} disabled={isFetching}>Filter</Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Purpose</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isFetching && (!data || !data.results) && (
              <>
                {Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={`sk-${i}`}>
                    <TableCell colSpan={7}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  </TableRow>
                ))}
              </>
            )}
            {data?.results?.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{p.title}</TableCell>
                <TableCell>{p.type || '-'}</TableCell>
                <TableCell>{p.purpose || '-'}</TableCell>
                <TableCell>{p.price ? `₹${p.price}` : '-'}</TableCell>
                <TableCell>{p.city || '-'}</TableCell>
                <TableCell>{p.status || '-'}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Link className="text-blue-600 hover:underline" to={`/properties/${p.id}/view`}>View</Link>
                    <Link className="text-blue-600 hover:underline" to={`/properties/${p.id}`}>Edit</Link>
                    <button className="text-red-600 hover:underline" onClick={() => setConfirmId(p.id)}>
                      Delete
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!isFetching && (!data?.results || data.results.length === 0) && (
              <TableRow>
                <TableCell className="text-slate-500" colSpan={7}>No properties found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <Pagination page={page} pageSize={pageSize} total={data?.count} onChange={setPage} />
      </Card>

      <AlertDialog open={confirmId !== null} onOpenChange={(o) => !o && setConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete property?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirmId && onDelete(confirmId)} disabled={delState.isLoading}>
              {delState.isLoading ? 'Deleting…' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default PropertyList
