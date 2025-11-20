import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { useGetProfileQuery, useUpdateProfileMutation, useUpdatePreferencesMutation, useUpdateLocationMutation } from '@/features/users/api/usersApi'
import { useGetAssignedAgentQuery } from '@/features/agents/api/agentsApi'
import { Phone, Mail, MapPin } from 'lucide-react'
import { PropertyPurpose } from '@/types'

const profileSchema = z.object({
  full_name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  date_of_birth: z.string().optional(),
  bio: z.string().optional(),
})

const preferencesSchema = z.object({
  property_type: z.array(z.string()),
  purpose: z.enum(['buy', 'rent', 'short_stay']).optional(),
  budget_min: z.coerce.number().optional(),
  budget_max: z.coerce.number().optional(),
  bedrooms_min: z.coerce.number().optional(),
  bedrooms_max: z.coerce.number().optional(),
  area_min: z.coerce.number().optional(),
  area_max: z.coerce.number().optional(),
  location_preference: z.array(z.string()),
  max_distance_km: z.coerce.number().optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>
type PreferencesFormData = z.infer<typeof preferencesSchema>

const UserProfilePage: React.FC = () => {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'location'>('profile')
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<string[]>([])

  // Fetch user profile
  const { data: profile, isLoading: profileLoading } = useGetProfileQuery()
  const { data: assignedAgent } = useGetAssignedAgentQuery()

  // Mutations
  const [updateProfile, { isLoading: updatingProfile }] = useUpdateProfileMutation()
  const [updatePreferences, { isLoading: updatingPreferences }] = useUpdatePreferencesMutation()
  const [updateLocation, { isLoading: updatingLocation }] = useUpdateLocationMutation()

  // Forms
  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: '',
      email: '',
      phone: '',
      date_of_birth: '',
      bio: '',
    },
  })

  const preferencesForm = useForm<PreferencesFormData>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      property_type: [],
      purpose: 'rent',
      budget_min: 0,
      budget_max: 0,
      bedrooms_min: 0,
      bedrooms_max: 0,
      area_min: 0,
      area_max: 0,
      location_preference: [],
      max_distance_km: 10,
    },
  })

  React.useEffect(() => {
    if (profile) {
      profileForm.reset({
        full_name: profile.full_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        date_of_birth: profile.date_of_birth || '',
        bio: '', // bio is not in User type, assuming it might be added or just ignored
      })

      if (profile.preferences) {
        setSelectedLocations(profile.preferences.location_preference || [])
        setSelectedPropertyTypes(profile.preferences.property_type || [])

        // Type-safe reset for preferences
        const prefs = profile.preferences
        preferencesForm.reset({
          property_type: prefs.property_type || [],
          purpose: (prefs.purpose as 'buy' | 'rent' | 'short_stay') || 'rent',
          budget_min: prefs.budget_min || 0,
          budget_max: prefs.budget_max || 0,
          bedrooms_min: prefs.bedrooms_min || 0,
          bedrooms_max: prefs.bedrooms_max || 0,
          area_min: prefs.area_min || 0,
          area_max: prefs.area_max || 0,
          location_preference: prefs.location_preference || [],
          max_distance_km: prefs.max_distance_km || 10,
        })
      }
    }
  }, [profile, profileForm, preferencesForm])

  const handleProfileSubmit = async (data: ProfileFormData) => {
    try {
      await updateProfile(data).unwrap()
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully.',
      })
    } catch (error) {
      toast({
        title: 'Update Failed',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handlePreferencesSubmit = async (data: PreferencesFormData) => {
    try {
      await updatePreferences({
        ...data,
        purpose: data.purpose as PropertyPurpose,
        property_type: selectedPropertyTypes,
        location_preference: selectedLocations,
      }).unwrap()
      toast({
        title: 'Preferences Updated',
        description: 'Your preferences have been saved successfully.',
      })
    } catch (error) {
      toast({
        title: 'Update Failed',
        description: 'Failed to update preferences. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleLocationUpdate = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            await updateLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            }).unwrap()
            toast({
              title: 'Location Updated',
              description: 'Your location has been updated successfully.',
            })
          } catch (error) {
            toast({
              title: 'Update Failed',
              description: 'Failed to update location. Please try again.',
              variant: 'destructive',
            })
          }
        },
        (error) => {
          toast({
            title: 'Location Error',
            description: 'Unable to get your location. Please enable location services.',
            variant: 'destructive',
          })
        }
      )
    } else {
      toast({
        title: 'Not Supported',
        description: 'Geolocation is not supported by your browser.',
        variant: 'destructive',
      })
    }
  }

  const addLocation = (location: string) => {
    if (location && !selectedLocations.includes(location)) {
      setSelectedLocations([...selectedLocations, location])
    }
  }

  const removeLocation = (location: string) => {
    setSelectedLocations(selectedLocations.filter(l => l !== location))
  }

  const togglePropertyType = (type: string) => {
    setSelectedPropertyTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Profile</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">
                {profile?.full_name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{profile?.full_name}</h2>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {profile?.email}
                </div>
                {profile?.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    {profile.phone}
                  </div>
                )}
              </div>
              {assignedAgent && (
                <div className="mt-2">
                  <Badge variant="secondary">
                    Assigned Agent: {assignedAgent.name}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex space-x-1 border-b">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'profile'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Profile Information
        </button>
        <button
          onClick={() => setActiveTab('preferences')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'preferences'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Preferences
        </button>
        <button
          onClick={() => setActiveTab('location')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'location'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Location Settings
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'profile' && (
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    {...profileForm.register('full_name')}
                    placeholder="Enter your full name"
                  />
                  {profileForm.formState.errors.full_name && (
                    <p className="text-sm text-red-500">
                      {profileForm.formState.errors.full_name.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...profileForm.register('email')}
                    placeholder="Enter your email"
                  />
                  {profileForm.formState.errors.email && (
                    <p className="text-sm text-red-500">
                      {profileForm.formState.errors.email.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    {...profileForm.register('phone')}
                    placeholder="Enter your phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date_of_birth">Date of Birth</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    {...profileForm.register('date_of_birth')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  {...profileForm.register('bio')}
                  placeholder="Tell us about yourself..."
                  rows={4}
                />
              </div>

              <Button type="submit" disabled={updatingProfile}>
                {updatingProfile ? 'Updating...' : 'Save Changes'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {activeTab === 'preferences' && (
        <Card>
          <CardHeader>
            <CardTitle>Property Preferences</CardTitle>
            <CardDescription>Tell us what kind of properties you're interested in</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={preferencesForm.handleSubmit(handlePreferencesSubmit)} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium">Property Types</Label>
                  <p className="text-sm text-muted-foreground">Select the types of properties you're interested in</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {['house', 'apartment', 'builder_floor', 'room'].map((type) => (
                      <Badge
                        key={type}
                        variant={selectedPropertyTypes.includes(type) ? "default" : "outline"}
                        className="cursor-pointer capitalize"
                        onClick={() => togglePropertyType(type)}
                      >
                        {type.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Purpose</Label>
                    <Select
                      value={preferencesForm.watch('purpose')}
                      onValueChange={(value) => preferencesForm.setValue('purpose', value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select purpose" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="buy">Buy</SelectItem>
                        <SelectItem value="rent">Rent</SelectItem>
                        <SelectItem value="short_stay">Short Stay</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Maximum Distance (km)</Label>
                    <Input
                      type="number"
                      {...preferencesForm.register('max_distance_km', { valueAsNumber: true })}
                      placeholder="10"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Budget Range</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        {...preferencesForm.register('budget_min', { valueAsNumber: true })}
                        placeholder="Min"
                      />
                      <span>-</span>
                      <Input
                        type="number"
                        {...preferencesForm.register('budget_max', { valueAsNumber: true })}
                        placeholder="Max"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Bedrooms</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        {...preferencesForm.register('bedrooms_min', { valueAsNumber: true })}
                        placeholder="Min"
                      />
                      <span>-</span>
                      <Input
                        type="number"
                        {...preferencesForm.register('bedrooms_max', { valueAsNumber: true })}
                        placeholder="Max"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Area (sqft)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        {...preferencesForm.register('area_min', { valueAsNumber: true })}
                        placeholder="Min"
                      />
                      <span>-</span>
                      <Input
                        type="number"
                        {...preferencesForm.register('area_max', { valueAsNumber: true })}
                        placeholder="Max"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-base font-medium">Preferred Locations</Label>
                  <p className="text-sm text-muted-foreground">Add cities or localities you prefer</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedLocations.map((location) => (
                      <Badge key={location} variant="secondary">
                        {location}
                        <button
                          type="button"
                          className="ml-2 text-xs"
                          onClick={() => removeLocation(location)}
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="Add a location"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addLocation(e.currentTarget.value)
                          e.currentTarget.value = ''
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const input = document.querySelector('input[placeholder="Add a location"]') as HTMLInputElement
                        if (input?.value) {
                          addLocation(input.value)
                          input.value = ''
                        }
                      }}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>

              <Button type="submit" disabled={updatingPreferences}>
                {updatingPreferences ? 'Saving...' : 'Save Preferences'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {activeTab === 'location' && (
        <Card>
          <CardHeader>
            <CardTitle>Location Settings</CardTitle>
            <CardDescription>Manage your location preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">Current Location</h3>
                  <p className="text-sm text-muted-foreground">
                    {profile?.current_latitude && profile?.current_longitude
                      ? `${profile.current_latitude.toFixed(4)}, ${profile.current_longitude.toFixed(4)}`
                      : 'No location set'}
                  </p>
                </div>
                <Button
                  onClick={handleLocationUpdate}
                  disabled={updatingLocation}
                  variant="outline"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  {updatingLocation ? 'Updating...' : 'Update Location'}
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Member Since</span>
                      <span className="text-sm">
                        {profile?.created_at
                          ? new Date(profile.created_at).toLocaleDateString()
                          : 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Account Status</span>
                      <Badge variant={profile?.is_active ? "default" : "secondary"}>
                        {profile?.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Verified</span>
                      <Badge variant={profile?.is_verified ? "default" : "outline"}>
                        {profile?.is_verified ? "Verified" : "Not Verified"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Privacy Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Show Phone Number</span>
                      <Switch defaultChecked={profile?.privacy_settings?.show_phone} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Show Email</span>
                      <Switch defaultChecked={profile?.privacy_settings?.show_email} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Location Tracking</span>
                      <Switch defaultChecked={profile?.privacy_settings?.allow_location_tracking} />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default UserProfilePage
