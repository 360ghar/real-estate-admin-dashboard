import { useMemo, useState } from 'react'
import { useAppSelector } from '@/hooks/redux'
import { selectCurrentUser } from '@/store/slices/authSlice'
import { useDeletePropertyMutation, useListPropertiesQuery } from '@/store/services/propertiesApi'
import { Card } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import Pagination from '@/components/ui/pagination'
import { useToast } from '@/hooks/use-toast'
import { useDebounce } from '@/hooks/useDebounce'
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Eye, Edit, Trash2 } from 'lucide-react'
import {
  ColumnDef,
} from '@tanstack/react-table'

type Property = {
  id: number
  title: string
  type?: string
  purpose?: string
  price?: number
  city?: string
  status?: string
  created_at?: string
}

const PropertyList = () => {
  const user = useAppSelector(selectCurrentUser)
  const role = user?.agent_id ? 'agent' : 'admin'
  const [q, setQ] = useState('')
  const [city, setCity] = useState('')
  const [status, setStatus] = useState('')
  const [confirmId, setConfirmId] = useState<number | null>(null)
  const { toast } = useToast()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

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

  const propertyColumns: ColumnDef<Property>[] = [
    {
      accessorKey: 'title',
      header: 'Title',
    },
    {
      accessorKey: 'type',
      header: 'Type',
    },
    {
      accessorKey: 'purpose',
      header: 'Purpose',
    },
    {
      accessorKey: 'price',
      header: 'Price',
      cell: ({ row }) => {
        const price = row.getValue('price') as number
        return <div>₹{price?.toLocaleString()}</div>
      },
    },
    {
      accessorKey: 'city',
      header: 'City',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string
        return (
          <Badge variant={status === 'available' ? 'default' : 'destructive'}>
            {status}
          </Badge>
        )
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const property = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem asChild>
                <Link to={`/properties/${property.id}/view`}>
                  <Eye className="mr-2 h-4 w-4" />
                  <span>View</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={`/properties/${property.id}`}>
                  <Edit className="mr-2 h-4 w-4" />
                  <span>Edit</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="focus:bg-destructive focus:text-destructive-foreground">
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

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
        <DataTable
          columns={propertyColumns}
          data={data?.results || []}
        />
        <Pagination
          page={page}
          pageSize={pageSize}
          total={data?.count}
          onChange={setPage}
        />
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
