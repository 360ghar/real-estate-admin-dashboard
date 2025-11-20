import { useMemo, useState, useEffect } from 'react'
import { useAppSelector } from '@/hooks/redux'
import { selectCurrentUser } from '@/features/auth/slices/authSlice'
import { useDeletePropertyMutation, useListPropertiesQuery } from '@/features/properties/api/propertiesApi'
import type { Property, PropertySearchParams } from '@/types'
import { useGetAmenitiesQuery } from '@/features/core/api/amenitiesApi'
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
import { LoadingState } from '@/components/ui/loading-state'
import { Checkbox } from '@/components/ui/checkbox'
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { motion } from 'framer-motion'

const PropertyList = () => {
  const user = useAppSelector(selectCurrentUser)
  const role = (user?.role as 'admin' | 'agent' | 'user') || (user?.agent_id ? 'agent' : 'admin')

  // Filter persistence - add new fields
  const { filters, setFilters, clearFilters, hasActiveFilters } = useFilterPersistence({
    key: 'properties',
    defaultValue: {
      q: '',
      city: '',
      locality: '',
      propertyType: '',
      purpose: '',
      priceMin: '',
      priceMax: '',
      bedroomsMin: '',
      bedroomsMax: '',
      amenities: [] as number[],
      radius: '',
      sortBy: 'newest',
      showFilters: false
    }
  })

  const [selectedAmenities, setSelectedAmenities] = useState<number[]>(filters.amenities || [])

  useEffect(() => {
    setFilters({ amenities: selectedAmenities })
  }, [selectedAmenities])

  const { data: amenitiesData } = useGetAmenitiesQuery()

  const amenities = amenitiesData || []

  const handleAmenityToggle = (amenityId: number) => {
    setSelectedAmenities(prev => 
      prev.includes(amenityId) 
        ? prev.filter(id => id !== amenityId)
        : [...prev, amenityId]
    )
  }

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
    if (filters.priceMin) base.price_min = Number(filters.priceMin)
    if (filters.priceMax) base.price_max = Number(filters.priceMax)
    if (filters.bedroomsMin) base.bedrooms_min = Number(filters.bedroomsMin)
    if (filters.bedroomsMax) base.bedrooms_max = Number(filters.bedroomsMax)
    if (selectedAmenities.length > 0) base.amenities = selectedAmenities.map(String)
    if (filters.radius) base.radius = Number(filters.radius)

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
    selectedAmenities,
    filters.radius,
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
    } catch (e: unknown) {
      toast({ title: 'Failed', description: (e as any)?.data?.detail || 'Try again', variant: 'destructive' })
    }
  }

  const columns: ColumnDef<Property>[] = [
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
        <Badge variant={row.original.status === 'available' ? 'default' : 'secondary'}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: 'distance',
      header: 'Distance',
      cell: ({ row }) => (
        <div className="text-sm">
          {(() => {
            const value = row.original.distance_km ?? (row.original as any).distance
            return value ? `${Number(value).toFixed(1)} km` : 'N/A'
          })()}
        </div>
      ),
    },
    {
      accessorKey: 'liked',
      header: 'Liked',
      cell: ({ row }) => (
        <Badge variant={row.original.liked ? 'default' : 'secondary'}>
          {row.original.liked ? 'Yes' : 'No'}
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
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 pt-4 border-t">
                <Select value={filters.sortBy} onValueChange={(v) => setFilters({ sortBy: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="price_low">Price: Low to High</SelectItem>
                    <SelectItem value="price_high">Price: High to Low</SelectItem>
                    <SelectItem value="popular">Popular</SelectItem>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="distance">Distance</SelectItem>
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
                    <SelectItem value="builder_floor">Builder Floor</SelectItem>
                    <SelectItem value="room">Room</SelectItem>
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
                    <SelectItem value="buy">Buy</SelectItem>
                    <SelectItem value="rent">Rent</SelectItem>
                    <SelectItem value="short_stay">Short Stay</SelectItem>
                  </SelectContent>
                </Select>

                {/* Add amenities sheet trigger */}
                <div>
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <Filter className="h-4 w-4 mr-2" />
                        Amenities ({selectedAmenities.length})
                      </Button>
                    </SheetTrigger>
                    <SheetContent className="w-[400px]">
                      <SheetHeader>
                        <SheetTitle>Select Amenities</SheetTitle>
                        <SheetDescription>
                          Choose amenities to filter properties.
                        </SheetDescription>
                      </SheetHeader>
                      <div className="py-4 space-y-2 max-h-[300px] overflow-y-auto">
                        {amenities.map((amenity) => (
                          <div key={amenity.id} className="flex items-center space-x-2 p-2 hover:bg-accent rounded">
                            <Checkbox
                              id={`amenity-${amenity.id}`}
                              checked={selectedAmenities.includes(amenity.id)}
                              onCheckedChange={() => handleAmenityToggle(amenity.id)}
                            />
                            <label
                              htmlFor={`amenity-${amenity.id}`}
                              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1 cursor-pointer"
                            >
                              {amenity.title || amenity.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>

                {/* Add radius input */}
                <Input
                  type="number"
                  placeholder="Search Radius (km)"
                  value={filters.radius}
                  onChange={(e) => setFilters({ radius: e.target.value })}
                />

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

                <Input
                  type="number"
                  placeholder="Min Bedrooms"
                  value={filters.bedroomsMin}
                  onChange={(e) => setFilters({ bedroomsMin: e.target.value })}
                />

                <Input
                  type="number"
                  placeholder="Max Bedrooms"
                  value={filters.bedroomsMax}
                  onChange={(e) => setFilters({ bedroomsMax: e.target.value })}
                />
              </div>
            </motion.div>
          )}
        </div>
      </Card>

      {/* Results */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="p-6">
          {isFetching ? (
            <LoadingState type="card" rows={5} />
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
      </motion.div>

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
