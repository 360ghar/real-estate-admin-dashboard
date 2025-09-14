import { useGetPropertyQuery } from '@/store/services/propertiesApi'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Link } from 'react-router-dom'

const Item = ({ label, value }: { label: string; value?: any }) => (
  <div className="text-sm"><span className="text-slate-500">{label}: </span>{String(value ?? '-')}
  </div>
)

const PropertyDetail = ({ id }: { id: number }) => {
  const { data } = useGetPropertyQuery(id)
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Property Detail</h1>
        <Link to={`/properties/${id}`} className="rounded-md bg-black px-3 py-2 text-sm font-medium text-white hover:bg-black/90">Edit</Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{data?.title || 'Property'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2">
            <Item label="Type" value={data?.property_type} />
            <Item label="Purpose" value={data?.purpose} />
            <Item label="Price" value={data?.base_price ? `₹${data.base_price}` : '-'} />
            <Item label="Status" value={data?.status} />
            <Item label="City" value={data?.city} />
            <Item label="Locality" value={data?.locality} />
            <Item label="Latitude" value={(data as any)?.latitude} />
            <Item label="Longitude" value={(data as any)?.longitude} />
          </div>
          {data?.images && data.images.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
              {data.images.map((url) => (
                <img key={url} src={url} className="h-28 w-full rounded-md object-cover" />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default PropertyDetail

