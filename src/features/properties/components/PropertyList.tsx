import { useMemo, useState, useEffect } from 'react'
import { useUserRole } from '@/hooks/useUserRole'
import { useDeletePropertyMutation, useSearchPropertiesQuery, useUpdatePropertyMutation, type PropertySearchParams } from '@/features/properties/api/propertiesApi'
import type { PropertyStatus } from '@/types/pm'
import { useGetAmenitiesQuery } from '@/features/core/api/amenitiesApi'
import { Card } from '@/components/ui/card'
import { ResponsiveDataTable } from '@/components/ui/responsive-data-table'
import { useNavigate } from 'react-router-dom'
import Pagination from '@/components/ui/pagination'
import { useToast } from '@/hooks/use-toast'
import { useDebounce } from '@/hooks/useDebounce'
import { useFilterPersistence } from '@/hooks/useFilterPersistence'
import { useIsMobile } from '@/hooks/useMediaQuery'
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
import { LoadingState } from '@/components/ui/loading-state'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorState } from '@/components/ui/error-state'
import { motion } from 'framer-motion'
import { getErrorMessage } from '@/lib/errors'
import { PropertyColumns, renderPropertyCard } from '@/features/properties/components/PropertyColumns'
import { PropertyFilters, type PropertyFiltersState } from '@/features/properties/components/PropertyFilters'

const PropertyList = () => {
  const { user, role } = useUserRole()
  const isMobile = useIsMobile()
  const navigate = useNavigate()

  // Filter persistence - add new fields
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
      amenities: [] as number[],
      radius: '',
      sortBy: 'newest',
      showFilters: false
    }
  })

  const [selectedAmenities, setSelectedAmenities] = useState<number[]>(filters.amenities || [])

  useEffect(() => {
    setFilters({ amenities: selectedAmenities })
  }, [selectedAmenities, setFilters])

  const { data: amenitiesData } = useGetAmenitiesQuery()

  const amenities = useMemo(() => amenitiesData || [], [amenitiesData])

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
    if (filters.status) base.status = filters.status
    if (filters.priceMin) base.price_min = Number(filters.priceMin)
    if (filters.priceMax) base.price_max = Number(filters.priceMax)
    if (filters.bedroomsMin) base.bedrooms_min = Number(filters.bedroomsMin)
    if (filters.bedroomsMax) base.bedrooms_max = Number(filters.bedroomsMax)
    if (selectedAmenities.length > 0) {
      const selectedAmenityTitles = selectedAmenities
        .map((amenityId) => amenities.find((amenity) => amenity.id === amenityId))
        .map((amenity) => amenity?.title || amenity?.name)
        .filter((value): value is string => Boolean(value))
      if (selectedAmenityTitles.length > 0) {
        base.amenities = selectedAmenityTitles
      }
    }
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
    amenities,
    filters.radius,
    role,
    user?.agent_id
  ])

  const { data, isFetching, error, refetch } = useSearchPropertiesQuery(params)
  const [del] = useDeletePropertyMutation()
  const [updateProperty] = useUpdatePropertyMutation()

  const handleDelete = async (id: number) => {
    try {
      await del(id).unwrap()
      toast({ title: 'Deleted', description: 'Property removed' })
      setConfirmId(null)
    } catch (e: unknown) {
      toast({ title: 'Failed', description: getErrorMessage(e, 'Try again'), variant: 'destructive' })
    }
  }

  const handleSetStatus = async (id: number, status: PropertyStatus) => {
    try {
      await updateProperty({ id, data: { status, is_available: status === 'available' } }).unwrap()
      toast({ title: 'Status updated', description: `Property #${id} marked ${status.replace(/_/g, ' ')}.` })
    } catch (e: unknown) {
      toast({ title: 'Update failed', description: getErrorMessage(e, 'Try again'), variant: 'destructive' })
    }
  }

  const columns = PropertyColumns({ setConfirmId, onSetStatus: (id, status) => void handleSetStatus(id, status) })

  // Count active filters
  const activeFilterCount = [
    filters.city,
    filters.locality,
    filters.propertyType,
    filters.purpose,
    filters.priceMin,
    filters.priceMax,
    filters.bedroomsMin,
    filters.bedroomsMax,
    filters.radius,
    selectedAmenities.length > 0 ? 'amenities' : '',
  ].filter(Boolean).length

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card className="p-4 md:p-6">
        <PropertyFilters
          filters={filters as unknown as PropertyFiltersState}
          setFilters={(patch) => setFilters(patch as Partial<typeof filters>)}
          clearFilters={clearFilters}
          hasActiveFilters={hasActiveFilters}
          selectedAmenities={selectedAmenities}
          handleAmenityToggle={handleAmenityToggle}
          amenities={amenities}
          activeFilterCount={activeFilterCount}
          pageSize={pageSize}
          onPageSizeChange={(size) => { setPageSize(size); setPage(1) }}
        />
      </Card>

      {/* Results */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="p-4 md:p-6">
          {isFetching ? (
            <LoadingState type={isMobile ? 'cards' : 'card'} rows={5} />
          ) : error ? (
            <ErrorState
              title="Failed to load properties"
              error={error}
              onRetry={() => void refetch()}
            />
          ) : !data?.properties?.length ? (
            <EmptyState
              title="No properties found"
              description={
                hasActiveFilters
                  ? 'Try adjusting your filters to see more results'
                  : 'Get started by creating your first property'
              }
              action={
                hasActiveFilters
                  ? { label: 'Clear Filters', onClick: clearFilters, variant: 'outline' }
                  : { label: 'Create Property', onClick: () => navigate('/properties/new') }
              }
            />
          ) : (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, data.total || 0)} of {data.total || 0} properties
              </div>
              <ResponsiveDataTable
                columns={columns}
                data={data.properties}
                mobileCardRender={(property) => renderPropertyCard(property, setConfirmId)}
              />
              {data.total && data.total > pageSize && (
                <Pagination
                  page={page}
                  pageSize={pageSize}
                  total={data.total}
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
              onClick={() => {
                if (confirmId) {
                  void handleDelete(confirmId)
                }
              }}
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
