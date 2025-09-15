import React, { useState } from 'react'
import { useAppSelector } from '@/hooks/redux'
import { selectCurrentUser } from '@/store/slices/authSlice'
import { useGetProfileQuery, useUpdatePreferencesMutation, useUpdateLocationMutation, UserPreferences } from '@/store/services/usersApi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import { MapPin, Save, Home, Building, Warehouse, Loader2 } from 'lucide-react'

const UserPreferencesPage = () => {
  const user = useAppSelector(selectCurrentUser)
  const { data: profile, isLoading: profileLoading } = useGetProfileQuery()
  const [updatePreferences, { isLoading: preferencesLoading }] = useUpdatePreferencesMutation()
  const [updateLocation, { isLoading: locationLoading }] = useUpdateLocationMutation()
  const { toast } = useToast()

  const [preferences, setPreferences] = useState<UserPreferences>({
    property_type: [],
    purpose: 'rent',
    location_preference: [],
    max_distance_km: 10,
  })

  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null)

  // Normalize preferences coming from backend (may contain nulls)
  const normalizePreferences = (p: any): UserPreferences => {
    const arr = (x: any) => (Array.isArray(x) ? x.filter(Boolean) : [])
    const num = (x: any) => (typeof x === 'number' && !Number.isNaN(x) ? x : undefined)
    const purpose = ['buy', 'rent', 'short_stay'].includes(p?.purpose) ? p.purpose : 'rent'
    return {
      property_type: arr(p?.property_type),
      purpose,
      budget_min: num(p?.budget_min),
      budget_max: num(p?.budget_max),
      bedrooms_min: num(p?.bedrooms_min),
      bedrooms_max: num(p?.bedrooms_max),
      area_min: num(p?.area_min),
      area_max: num(p?.area_max),
      location_preference: arr(p?.location_preference),
      max_distance_km: typeof p?.max_distance_km === 'number' && !Number.isNaN(p?.max_distance_km)
        ? p.max_distance_km
        : 10,
    }
  }

  // Initialize preferences from profile data
  React.useEffect(() => {
    const profileData = profile as any // Type assertion for profile data
    if (profileData?.preferences) {
      setPreferences(normalizePreferences(profileData.preferences))
    }
    if (profileData?.current_latitude && profileData?.current_longitude) {
      setLocation({
        latitude: profileData.current_latitude,
        longitude: profileData.current_longitude,
      })
    } else if (!location && profileData) {
      // Only set default location if no location is set and we have profile data
      setLocation({
        latitude: 19.0760,
        longitude: 72.8777,
      })
    }
  }, [profile, location])

  const handlePreferencesSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updatePreferences(preferences).unwrap()
      toast({
        title: 'Success',
        description: 'Preferences updated successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update preferences',
        variant: 'destructive',
      })
    }
  }

  const handleLocationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!location) {
      toast({
        title: 'Error',
        description: 'Location data is not available',
        variant: 'destructive',
      })
      return
    }
    try {
      await updateLocation(location).unwrap()
      toast({
        title: 'Success',
        description: 'Location updated successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update location',
        variant: 'destructive',
      })
    }
  }

  const togglePropertyType = (type: string) => {
    setPreferences(prev => ({
      ...prev,
      property_type: (prev.property_type || []).includes(type)
        ? (prev.property_type || []).filter(t => t !== type)
        : [...(prev.property_type || []), type]
    }))
  }

  const toggleLocationPreference = (location: string) => {
    setPreferences(prev => ({
      ...prev,
      location_preference: (prev.location_preference || []).includes(location)
        ? (prev.location_preference || []).filter(l => l !== location)
        : [...(prev.location_preference || []), location]
    }))
  }

  if (profileLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Preferences</h1>
          <p className="text-muted-foreground">Loading your preferences...</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-muted rounded w-1/4"></div>
                <div className="h-8 bg-muted rounded"></div>
                <div className="h-8 bg-muted rounded"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Preferences</h1>
        <p className="text-muted-foreground">
          Customize your property search preferences and location settings.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Property Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Property Preferences
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePreferencesSubmit} className="space-y-4">
              {/* Property Type */}
              <div>
                <Label className="text-sm font-medium">Property Type</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {[
                    { value: 'apartment', label: 'Apartment', icon: Building },
                    { value: 'house', label: 'House', icon: Home },
                    { value: 'builder_floor', label: 'Builder Floor', icon: Warehouse },
                    { value: 'room', label: 'Room', icon: Home },
                  ].map(({ value, label, icon: Icon }) => (
                    <div key={value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`property-type-${value}`}
                        checked={(preferences.property_type || []).includes(value)}
                        onCheckedChange={() => togglePropertyType(value)}
                      />
                      <Label htmlFor={`property-type-${value}`} className="flex items-center gap-2 text-sm">
                        <Icon className="h-4 w-4" />
                        {label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Purpose */}
              <div>
                <Label htmlFor="purpose">Purpose</Label>
                <Select value={preferences.purpose} onValueChange={(value) => setPreferences(prev => ({ ...prev, purpose: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rent">Rent</SelectItem>
                    <SelectItem value="buy">Buy</SelectItem>
                    <SelectItem value="short_stay">Short Stay</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Budget Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="budget_min">Min Budget (₹)</Label>
                  <Input
                    id="budget_min"
                    type="number"
                    value={preferences.budget_min ?? ''}
                    onChange={(e) => setPreferences(prev => ({ ...prev, budget_min: e.target.value === '' ? undefined : Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="budget_max">Max Budget (₹)</Label>
                  <Input
                    id="budget_max"
                    type="number"
                    value={preferences.budget_max ?? ''}
                    onChange={(e) => setPreferences(prev => ({ ...prev, budget_max: e.target.value === '' ? undefined : Number(e.target.value) }))}
                  />
                </div>
              </div>

              {/* Bedrooms Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bedrooms_min">Min Bedrooms</Label>
                  <Input
                    id="bedrooms_min"
                    type="number"
                    value={preferences.bedrooms_min ?? ''}
                    onChange={(e) => setPreferences(prev => ({ ...prev, bedrooms_min: e.target.value === '' ? undefined : Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="bedrooms_max">Max Bedrooms</Label>
                  <Input
                    id="bedrooms_max"
                    type="number"
                    value={preferences.bedrooms_max ?? ''}
                    onChange={(e) => setPreferences(prev => ({ ...prev, bedrooms_max: e.target.value === '' ? undefined : Number(e.target.value) }))}
                  />
                </div>
              </div>

              {/* Area Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="area_min">Min Area (sqft)</Label>
                  <Input
                    id="area_min"
                    type="number"
                    value={preferences.area_min ?? ''}
                    onChange={(e) => setPreferences(prev => ({ ...prev, area_min: e.target.value === '' ? undefined : Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="area_max">Max Area (sqft)</Label>
                  <Input
                    id="area_max"
                    type="number"
                    value={preferences.area_max ?? ''}
                    onChange={(e) => setPreferences(prev => ({ ...prev, area_max: e.target.value === '' ? undefined : Number(e.target.value) }))}
                  />
                </div>
              </div>

              {/* Max Distance */}
              <div>
                <Label htmlFor="max_distance">Max Distance (km)</Label>
                <Input
                  id="max_distance"
                  type="number"
                  value={preferences.max_distance_km ?? ''}
                  onChange={(e) => setPreferences(prev => ({ ...prev, max_distance_km: e.target.value === '' ? 0 : Number(e.target.value) }))}
                />
              </div>

              <Button type="submit" disabled={preferencesLoading} className="w-full">
                {preferencesLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                Save Preferences
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Location Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLocationSubmit} className="space-y-4">
              {/* Current Location */}
              <div>
                <Label className="text-sm font-medium">Current Location</Label>
                {location ? (
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <Label htmlFor="latitude" className="text-xs">Latitude</Label>
                      <Input
                        id="latitude"
                        type="number"
                        step="0.0001"
                        value={location.latitude}
                        onChange={(e) => setLocation(prev => prev ? ({ ...prev, latitude: Number(e.target.value) }) : null)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="longitude" className="text-xs">Longitude</Label>
                      <Input
                        id="longitude"
                        type="number"
                        step="0.0001"
                        value={location.longitude}
                        onChange={(e) => setLocation(prev => prev ? ({ ...prev, longitude: Number(e.target.value) }) : null)}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground mt-2">
                    Location data is loading...
                  </div>
                )}
              </div>

              {/* Preferred Locations */}
              <div>
                <Label className="text-sm font-medium">Preferred Locations</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Pune', 'Hyderabad'].map((city) => (
                    <div key={city} className="flex items-center space-x-2">
                      <Checkbox
                        id={`location-${city}`}
                        checked={(preferences.location_preference || []).includes(city)}
                        onCheckedChange={() => toggleLocationPreference(city)}
                      />
                      <Label htmlFor={`location-${city}`} className="text-sm">
                        {city}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Button type="submit" disabled={locationLoading} className="w-full">
                {locationLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <MapPin className="mr-2 h-4 w-4" />
                Update Location
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default UserPreferencesPage
