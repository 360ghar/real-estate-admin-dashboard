import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Filter } from 'lucide-react'

type FilterControlsProps = Omit<import('./PropertyFilters').PropertyFiltersProps, 'pageSize' | 'onPageSizeChange' | 'activeFilterCount'>

const FilterControls: React.FC<FilterControlsProps> = ({
  filters,
  setFilters,
  selectedAmenities,
  handleAmenityToggle,
  amenities,
}) => (
  <>
    <div className="mb-4">
      <label className="text-sm font-medium mb-1 block">Sort</label>
      <Select value={filters.sortBy} onValueChange={(v) => setFilters({ sortBy: v })}>
        <SelectTrigger><SelectValue placeholder="Sort by" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Newest First</SelectItem><SelectItem value="distance">Distance</SelectItem>
          <SelectItem value="price_low">Price: Low to High</SelectItem><SelectItem value="price_high">Price: High to Low</SelectItem>
          <SelectItem value="popular">Popular</SelectItem><SelectItem value="relevance">Relevance</SelectItem>
        </SelectContent>
      </Select>
    </div>
    <div className="mb-4">
      <label className="text-sm font-medium mb-1 block">Location</label>
      <Input placeholder="City" value={filters.city} onChange={(e) => setFilters({ city: e.target.value })} />
      <Input placeholder="Locality" value={filters.locality} onChange={(e) => setFilters({ locality: e.target.value })} className="mt-2" />
    </div>
    <div className="mb-4">
      <label className="text-sm font-medium mb-1 block">Property Type</label>
      <Select value={filters.propertyType} onValueChange={(v) => setFilters({ propertyType: v === 'all' ? '' : v })}>
        <SelectTrigger><SelectValue placeholder="All Types" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem><SelectItem value="apartment">Apartment</SelectItem>
          <SelectItem value="house">House</SelectItem><SelectItem value="builder_floor">Builder Floor</SelectItem><SelectItem value="room">Room</SelectItem>
        </SelectContent>
      </Select>
    </div>
    <div className="mb-4">
      <label className="text-sm font-medium mb-1 block">Purpose</label>
      <Select value={filters.purpose} onValueChange={(v) => setFilters({ purpose: v === 'all' ? '' : v })}>
        <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem><SelectItem value="buy">Buy</SelectItem>
          <SelectItem value="rent">Rent</SelectItem><SelectItem value="short_stay">Short Stay</SelectItem>
        </SelectContent>
      </Select>
    </div>
    <div className="mb-4">
      <label className="text-sm font-medium mb-1 block">Price Range</label>
      <div className="grid grid-cols-2 gap-2">
        <Input type="number" placeholder="Min" value={filters.priceMin} onChange={(e) => setFilters({ priceMin: e.target.value })} />
        <Input type="number" placeholder="Max" value={filters.priceMax} onChange={(e) => setFilters({ priceMax: e.target.value })} />
      </div>
    </div>
    <div className="mb-4">
      <label className="text-sm font-medium mb-1 block">Bedrooms</label>
      <div className="grid grid-cols-2 gap-2">
        <Input type="number" placeholder="Min" value={filters.bedroomsMin} onChange={(e) => setFilters({ bedroomsMin: e.target.value })} />
        <Input type="number" placeholder="Max" value={filters.bedroomsMax} onChange={(e) => setFilters({ bedroomsMax: e.target.value })} />
      </div>
    </div>
    <div className="mb-4">
      <label className="text-sm font-medium mb-1 block">Amenities</label>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="w-full justify-start">
            <Filter className="h-4 w-4 mr-2" />{selectedAmenities.length > 0 ? `${selectedAmenities.length} selected` : 'Select amenities'}
          </Button>
        </SheetTrigger>
        <SheetContent className="w-[400px]">
          <SheetHeader><SheetTitle>Select Amenities</SheetTitle><SheetDescription>Choose amenities to filter properties.</SheetDescription></SheetHeader>
          <div className="py-4 space-y-2 max-h-[300px] overflow-y-auto">
            {amenities.map((amenity) => (
              <div key={amenity.id} className="flex items-center space-x-2 p-2 hover:bg-accent rounded">
                <Checkbox id={`amenity-${amenity.id}`} checked={selectedAmenities.includes(amenity.id)} onCheckedChange={() => handleAmenityToggle(amenity.id)} />
                <label htmlFor={`amenity-${amenity.id}`} className="text-sm leading-none flex-1 cursor-pointer">{amenity.title || amenity.name}</label>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
    <div className="mb-4">
      <label className="text-sm font-medium mb-1 block">Search Radius</label>
      <Input type="number" placeholder="Radius (km)" value={filters.radius} onChange={(e) => setFilters({ radius: e.target.value })} />
    </div>
  </>
)

export default FilterControls
