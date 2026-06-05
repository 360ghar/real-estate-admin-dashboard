import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { useGetProfileQuery, useUpdateProfileMutation, useUpdatePreferencesMutation, useUpdateLocationMutation } from '@/features/users/api/usersApi'
import { useGetAssignedAgentQuery } from '@/features/agents/api/agentsApi'
import { Mail, Phone } from 'lucide-react'
import { userProfileSchema, userPreferencesSchema, type UserProfileFormValues, type UserPreferencesFormValues } from '@/features/users/validations'
import ProfileTab from '@/features/users/components/ProfileTab'
import PreferencesTab from '@/features/users/components/PreferencesTab'
import LocationTab from '@/features/users/components/LocationTab'

const UserProfilePage: React.FC = () => {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'location'>('profile')
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<string[]>([])
  const allowedPurposes = ['buy', 'rent', 'short_stay'] as const
  const isPurpose = (value: string): value is UserPreferencesFormValues['purpose'] =>
    allowedPurposes.includes(value as UserPreferencesFormValues['purpose'])

  const { data: profile, isLoading: profileLoading } = useGetProfileQuery()
  const { data: assignedAgent } = useGetAssignedAgentQuery()
  const [updateProfile, { isLoading: updatingProfile }] = useUpdateProfileMutation()
  const [updatePreferences, { isLoading: updatingPreferences }] = useUpdatePreferencesMutation()
  const [updateLocation, { isLoading: updatingLocation }] = useUpdateLocationMutation()

  const profileForm = useForm<UserProfileFormValues>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: { full_name: profile?.full_name || '', email: profile?.email || '', phone: profile?.phone || '', date_of_birth: profile?.date_of_birth || '' },
  })

  const preferencesForm = useForm<UserPreferencesFormValues>({
    resolver: zodResolver(userPreferencesSchema),
    defaultValues: {
      property_type: profile?.preferences?.property_type || [], purpose: profile?.preferences?.purpose || 'rent',
      budget_min: profile?.preferences?.budget_min || 0, budget_max: profile?.preferences?.budget_max || 0,
      bedrooms_min: profile?.preferences?.bedrooms_min || 0, bedrooms_max: profile?.preferences?.bedrooms_max || 0,
      area_min: profile?.preferences?.area_min || 0, area_max: profile?.preferences?.area_max || 0,
      location_preference: profile?.preferences?.location_preference || [], max_distance_km: profile?.preferences?.max_distance_km || 10,
    },
  })

  React.useEffect(() => {
    if (profile) {
      profileForm.reset({ full_name: profile.full_name || '', email: profile.email || '', phone: profile.phone || '', date_of_birth: profile.date_of_birth || '' })
      if (profile.preferences) {
        setSelectedLocations(profile.preferences.location_preference || [])
        setSelectedPropertyTypes(profile.preferences.property_type || [])
        preferencesForm.reset({ ...profile.preferences })
      }
    }
  }, [profile, profileForm, preferencesForm])

  const handleProfileSubmit = async (data: UserProfileFormValues) => {
    try {
      await updateProfile(data).unwrap()
      toast({ title: 'Profile Updated', description: 'Your profile has been updated successfully.' })
    } catch { toast({ title: 'Update Failed', description: 'Failed to update profile. Please try again.', variant: 'destructive' }) }
  }

  const handlePreferencesSubmit = async (data: UserPreferencesFormValues) => {
    try {
      await updatePreferences({ ...data, property_type: selectedPropertyTypes, location_preference: selectedLocations }).unwrap()
      toast({ title: 'Preferences Updated', description: 'Your preferences have been saved successfully.' })
    } catch { toast({ title: 'Update Failed', description: 'Failed to update preferences. Please try again.', variant: 'destructive' }) }
  }

  const handleLocationUpdate = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          void updateLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude }).unwrap()
            .then(() => toast({ title: 'Location Updated', description: 'Your location has been updated successfully.' }))
            .catch(() => toast({ title: 'Update Failed', description: 'Failed to update location. Please try again.', variant: 'destructive' }))
        },
        () => toast({ title: 'Location Error', description: 'Unable to get your location. Please enable location services.', variant: 'destructive' })
      )
    } else { toast({ title: 'Not Supported', description: 'Geolocation is not supported by your browser.', variant: 'destructive' }) }
  }

  const addLocation = (location: string) => { if (location && !selectedLocations.includes(location)) setSelectedLocations([...selectedLocations, location]) }
  const removeLocation = (location: string) => setSelectedLocations(selectedLocations.filter(l => l !== location))
  const togglePropertyType = (type: string) => setSelectedPropertyTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type])

  if (profileLoading) {
    return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div></div>
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Profile</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">{profile?.full_name?.charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{profile?.full_name}</h2>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                <div className="flex items-center gap-1"><Mail className="h-4 w-4" />{profile?.email}</div>
                {profile?.phone && <div className="flex items-center gap-1"><Phone className="h-4 w-4" />{profile.phone}</div>}
              </div>
              {assignedAgent && <div className="mt-2"><Badge variant="secondary">Assigned Agent: {assignedAgent.user?.full_name}</Badge></div>}
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="flex space-x-1 border-b">
        {(['profile', 'preferences', 'location'] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === tab ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
            {tab === 'profile' ? 'Profile Information' : tab === 'preferences' ? 'Preferences' : 'Location Settings'}
          </button>
        ))}
      </div>
      {activeTab === 'profile' && (
        <ProfileTab profileForm={profileForm}
          onSubmit={(e) => { e.preventDefault(); void profileForm.handleSubmit(handleProfileSubmit)(e) }}
          updating={updatingProfile} />
      )}
      {activeTab === 'preferences' && (
        <PreferencesTab preferencesForm={preferencesForm} selectedPropertyTypes={selectedPropertyTypes}
          selectedLocations={selectedLocations} isPurpose={isPurpose} togglePropertyType={togglePropertyType}
          addLocation={addLocation} removeLocation={removeLocation}
          onSubmit={(e) => { e.preventDefault(); void preferencesForm.handleSubmit(handlePreferencesSubmit)(e) }}
          updating={updatingPreferences} />
      )}
      {activeTab === 'location' && (
        <LocationTab profile={profile} updatingLocation={updatingLocation} handleLocationUpdate={handleLocationUpdate} />
      )}
    </div>
  )
}

export default UserProfilePage
