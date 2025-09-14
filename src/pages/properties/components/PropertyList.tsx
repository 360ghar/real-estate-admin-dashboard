import { useMemo, useState } from 'react'
import { useAppSelector } from '@/hooks/redux'
import { selectCurrentUser } from '@/store/slices/authSlice'
import { useDeletePropertyMutation, useListPropertiesQuery, PropertyResponse, PropertySearchParams } from '@/store/services/propertiesApi'
import { Card } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import Pagination from '@/components/ui/pagination'
import { useToast } from '@/hooks/use-toast'
import { useDebounce } from '@/hooks/useDebounce'
import { useFilterPersistence } from '@/hooks/useFilterPersistence'
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
import { Eye, Edit, Trash2, Search, Filter, SortDesc, MapPin, RotateCcw, X } from 'lucide-react'
import {
  ColumnDef,
} from '@tanstack/react-table'

const PropertyList = () => {
  const user = useAppSelector(selectCurrentUser)
  const role = (user?.role as 'admin' | 'agent' | 'user') || (user?.agent_id ? 'agent' : 'admin')

  // Filter persistence
  const { filters, setFilters, clearFilters, hasActiveFilters } = useFilterPersistence({
    key: 'properties',
    defaultValue: {
      q: '',
      city: '',
      locality: '',
      propertyType: '',
      purpose: '',
      status: '',
      priceMin: '',
      priceMax: '',
      bedroomsMin: '',
      bedroomsMax: '',
      sortBy: 'newest',
      showFilters: false
    }
  })

  const [confirmId, setConfirmId] = useState<number | null>(null)
  const { toast } = useToast()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  // Debounced search terms
  const dq = useDebounce(filters.q, 300)
  const dcity = useDebounce(filters.city, 300)
  const dlocality = useDebounce(filters.locality, 300)

  const params = useMemo((): PropertySearchParams => {
    const base: PropertySearchParams = {
      page,
      limit: pageSize,
      sort_by: filters.sortBy,
    }

    if (dq) base.q = dq
    if (dcity) base.city = dcity
    if (dlocality) base.locality = dlocality
    if (filters.propertyType) base.property_type = [filters.propertyType]
    if (filters.purpose) base.purpose = filters.purpose
    if (filters.status) base.q = filters.status // Using q for status filter as per API
    if (filters.priceMin) base.price_min = Number(filters.priceMin)
    if (filters.priceMax) base.price_max = Number(filters.priceMax)
    if (filters.bedroomsMin) base.bedrooms_min = Number(filters.bedroomsMin)
    if (filters.bedroomsMax) base.bedrooms_max = Number(filters.bedroomsMax)

    if (role === 'agent' && user?.agent_id) base.exclude_swiped = false

    return base
  }, [
    page,
    pageSize,
    filters.sortBy,
    dq,
    dcity,
    dlocality,
    filters.propertyType,
    filters.purpose,
    filters.status,
    filters.priceMin,
    filters.priceMax,
    filters.bedroomsMin,
    filters.bedroomsMax,
    role,
    user?.agent_id
  ])

  const { data, isFetching, error } = useListPropertiesQuery(params)
  const [del] = useDeletePropertyMutation()

  const handleDelete = async (id: number) => {
    try {
      await del(id).unwrap()
      toast({ title: 'Deleted', description: 'Property removed' })
      setConfirmId(null)
    } catch (e: any) {
      toast({ title: 'Failed', description: e?.data?.detail || 'Try again', variant: 'destructive' })
    }
  }

  const columns: ColumnDef<PropertyResponse>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }) => <span className="text-muted-foreground">#{row.original.id}</span>,
    },
    {
      accessorKey: 'title',
      header: 'Property',
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="font-medium">{row.original.title}</div>
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {row.original.city}, {row.original.locality}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'property_type',
      header: 'Type',
      cell: ({ row }) => <Badge variant="secondary">{row.original.property_type}</Badge>,
    },
    {
      accessorKey: 'purpose',
      header: 'Purpose',
      cell: ({ row }) => (
        <Badge variant={row.original.purpose === 'buy' ? 'default' : 'outline'}>
          {row.original.purpose}
        </Badge>
      ),
    },
    {
      accessorKey: 'base_price',
      header: 'Price',
      cell: ({ row }) => (
        <div className="font-medium">
          ₹{row.original.base_price.toLocaleString('en-IN')}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.status === 'active' ? 'default' : 'secondary'}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Link to={`/properties/${row.original.id}/view`}>
            <Button variant="ghost" size="sm">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
          <Link to={`/properties/${row.original.id}`}>
            <Button variant="ghost" size="sm">
              <Edit className="h-4 w-4" />
            </Button>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <Trash2 className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setConfirmId(row.original.id)} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search properties..."
                value={filters.q}
                onChange={(e) => setFilters({ q: e.target.value })}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setFilters({ showFilters: !filters.showFilters })}
              className={hasActiveFilters ? 'border-primary text-primary' : ''}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2">
                  Active
                </Badge>
              )}
            </Button>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}
          <div className="w-40 ml-auto">
            <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(1) }}>
              <SelectTrigger>
                <SelectValue placeholder="Rows" />
              </SelectTrigger>
              <SelectContent>
                {[10,20,50].map(n => (
                  <SelectItem key={n} value={String(n)}>{n} / page</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

          {filters.showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-4 border-t">
              <Select value={filters.sortBy} onValueChange={(v) => setFilters({ sortBy: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="price_asc">Price: Low to High</SelectItem>
                  <SelectItem value="price_desc">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>

              <Input
                placeholder="City"
                value={filters.city}
                onChange={(e) => setFilters({ city: e.target.value })}
              />

              <Input
                placeholder="Locality"
                value={filters.locality}
                onChange={(e) => setFilters({ locality: e.target.value })}
              />

              <Select
                value={filters.propertyType}
                onValueChange={(v) => setFilters({ propertyType: v === 'all' ? '' : v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Property type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="villa">Villa</SelectItem>
                  <SelectItem value="plot">Plot</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.purpose}
                onValueChange={(v) => setFilters({ purpose: v === 'all' ? '' : v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Purpose" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="sale">For Sale</SelectItem>
                  <SelectItem value="rent">For Rent</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.status}
                onValueChange={(v) => setFilters({ status: v === 'all' ? '' : v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                  <SelectItem value="rented">Rented</SelectItem>
                </SelectContent>
              </Select>

              <Input
                type="number"
                placeholder="Min Price"
                value={filters.priceMin}
                onChange={(e) => setFilters({ priceMin: e.target.value })}
              />

              <Input
                type="number"
                placeholder="Max Price"
                value={filters.priceMax}
                onChange={(e) => setFilters({ priceMax: e.target.value })}
              />
            </div>
          )}
        </div>
      </Card>

      {/* Results */}
      <Card className="p-6">
        {isFetching ? (
          <div className="space-y-4">
            <div className="h-10 bg-muted animate-pulse rounded" />
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="text-lg font-medium mb-2">Failed to load properties</div>
            <div className="text-muted-foreground mb-4">
              Please check your connection and try again
            </div>
            <Button onClick={() => window.location.reload()}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        ) : !data?.results?.length ? (
          <div className="text-center py-8">
            <div className="text-lg font-medium mb-2">No properties found</div>
            <div className="text-muted-foreground mb-4">
              {hasActiveFilters
                ? 'Try adjusting your filters to see more results'
                : 'Get started by creating your first property'}
            </div>
            {hasActiveFilters ? (
              <Button variant="outline" onClick={clearFilters}>
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            ) : (
              <Link to="/properties/new">
                <Button>
                  Create Property
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, data.count || 0)} of {data.count || 0} properties
            </div>
            <DataTable
              columns={columns}
              data={data.results}
            />
            {data.count && data.count > pageSize && (
              <Pagination
                page={page}
                pageSize={pageSize}
                total={data.count}
                onChange={setPage}
              />
            )}
          </div>
        )}
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog open={!!confirmId} onOpenChange={() => setConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the property and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmId && handleDelete(confirmId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default PropertyList
