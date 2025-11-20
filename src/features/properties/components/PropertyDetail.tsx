import { useDeletePropertyMutation, useGetPropertyQuery } from '@/features/properties/api/propertiesApi'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Link, useNavigate } from 'react-router-dom'
import MapPreview from './parts/MapPreview'
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
import { useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { getErrorMessage } from '@/lib/error-utils'
import { useToast } from '@/hooks/use-toast'

const Item = ({ label, value }: { label: string; value?: any }) => (
  <div className="text-sm"><span className="text-muted-foreground">{label}: </span>{String(value ?? '-')}</div>
)

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <div className="font-medium text-sm text-muted-foreground mb-2">{children}</div>
)

const PropertyDetail = ({ id }: { id: number }) => {
  const { data, isLoading, error } = useGetPropertyQuery(id)
  const [openDelete, setOpenDelete] = useState(false)
  const [del, delState] = useDeletePropertyMutation()
  const navigate = useNavigate()
  const { toast } = useToast()

  const doDelete = async () => {
    try {
      await del(id).unwrap()
      setOpenDelete(false)
      navigate('/properties')
      toast({ title: 'Deleted', description: 'Property removed successfully' })
    } catch (e) {
      toast({ title: 'Error', description: getErrorMessage(e as any), variant: 'destructive' })
      setOpenDelete(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-1/3 bg-muted animate-pulse rounded" />
        <Card>
          <CardHeader>
            <div className="h-6 w-1/2 bg-muted animate-pulse rounded" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-3 md:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-4 w-full" />)}
            </div>
            <div className="h-48 w-full bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center">
        <p className="text-destructive mb-4">{getErrorMessage(error as any)}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Property Details</h1>
          <p className="text-sm text-muted-foreground">View complete information</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to={`/properties/${id}`}>Edit</Link>
          </Button>
          <Button variant="destructive" size="sm" onClick={() => setOpenDelete(true)} disabled={delState.isLoading}>
            {delState.isLoading ? 'Deleting…' : 'Delete'}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <span>{data.title}</span>
            <Badge variant={data.status === 'available' ? 'default' : 'secondary'} className="capitalize">{data.status}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overview */}
          <div className="grid gap-3 md:grid-cols-3">
            <Item label="Type" value={data.property_type?.replace('_', ' ')} />
            <Item label="Purpose" value={data.purpose?.replace('_', ' ')} />
            <Item label="Price" value={data.base_price ? `₹${data.base_price.toLocaleString('en-IN')}` : '-'} />
            <Item label="Created" value={data.created_at ? new Date(data.created_at).toLocaleDateString() : '-'} />
            <Item label="Liked" value={data.liked ? 'Yes' : 'No'} />
            <Item label="Next Visit" value={data.user_next_visit_date ? new Date(data.user_next_visit_date).toLocaleString() : '-'} />
          </div>

          {/* Location */}
          <div>
            <SectionTitle>Location</SectionTitle>
            <div className="grid gap-3 md:grid-cols-3">
              <Item label="City" value={data.city} />
              <Item label="Locality" value={data.locality} />
              <Item label="Pincode" value={data.pincode} />
              <Item label="Address" value={data.full_address} />
            </div>
            {(() => {
              const lat = data.latitude ?? data.location?.latitude
              const lng = data.longitude ?? data.location?.longitude
              if (lat !== undefined && lng !== undefined && lat !== null && lng !== null) {
                return (
                  <div className="mt-3">
                    <MapPreview lat={lat} lng={lng} height={220} />
                    <div className="mt-2 text-xs text-muted-foreground">
                      Lat: {lat}, Lng: {lng}
                    </div>
                  </div>
                )
              }
              return null
            })()}
          </div>

          {/* Specifications */}
          <div>
            <SectionTitle>Specifications</SectionTitle>
            <div className="grid gap-3 md:grid-cols-4">
              <Item label="Area (sqft)" value={data.area_sqft} />
              <Item label="Bedrooms" value={data.bedrooms} />
              <Item label="Bathrooms" value={data.bathrooms} />
              <Item label="Balconies" value={data.balconies} />
              <Item label="Parking" value={data.parking_spaces} />
              <Item label="Floor" value={data.floor_number} />
              <Item label="Total Floors" value={data.total_floors} />
              <Item label="Age (years)" value={data.age_of_property} />
              <Item label="Max Occupancy" value={data.max_occupancy} />
              <Item label="Min Stay (days)" value={data.minimum_stay_days} />
            </div>
          </div>

          {/* Owner */}
          <div>
            <SectionTitle>Owner</SectionTitle>
            <div className="grid gap-3 md:grid-cols-3">
              <Item label="Owner ID" value={data.owner_id} />
              <Item label="Name" value={data.owner_name} />
              <Item label="Contact" value={data.owner_contact} />
            </div>
          </div>

          {/* Amenities & Features */}
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <SectionTitle>Amenities</SectionTitle>
              {data.amenities && data.amenities.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {data.amenities.map((a) => (
                    <Badge key={a.id} variant="secondary" className="capitalize">
                      {a.title}
                    </Badge>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">No amenities listed</div>
              )}
            </div>
            <div>
              <SectionTitle>Features</SectionTitle>
              {data.features && data.features.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {data.features.map((f) => (
                    <Badge key={f} variant="outline" className="capitalize">{f.replace('_', ' ')}</Badge>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">No features listed</div>
              )}
            </div>
          </div>

          {/* Media */}
          {data.images && data.images.length > 0 && (
            <div>
              <SectionTitle>Media</SectionTitle>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {data.images.map((img) => (
                  <img
                    key={img.id}
                    src={img.image_url}
                    alt={img.caption || 'Property Image'}
                    className="h-28 w-full rounded-md object-cover border"
                  />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete property?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently remove the property.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={doDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default PropertyDetail
