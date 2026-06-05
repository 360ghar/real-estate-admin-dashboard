import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { getErrorMessage } from '@/lib/errors'
import { LoadingState } from '@/components/ui/loading-state'
import { EmptyState } from '@/components/ui/empty-state'
import { ModerationActionDialog } from '../components/ModerationActionDialog'
import { ModerationListingCard } from '../components/ModerationListingCard'
import { useGetPendingListingsQuery, useModerateListingMutation } from '../api/flatmatesApi'
import type { FlatmatesListing, ModerationAction } from '../types'

type ListingAction = ModerationAction['action']

export function ModerationQueuePage() {
  const { toast } = useToast()
  const [selectedListing, setSelectedListing] = useState<FlatmatesListing | null>(null)
  const [action, setAction] = useState<ListingAction>('approve')
  const [reason, setReason] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const { data, isLoading, error } = useGetPendingListingsQuery({
    status: 'pending_review',
  })
  const [moderateListing, { isLoading: isModerating }] =
    useModerateListingMutation()

  const handleModerate = (listing: FlatmatesListing) => {
    setSelectedListing(listing)
    setIsDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!selectedListing) return
    try {
      await moderateListing({
        listingId: selectedListing.id,
        payload: { action, reason: reason.trim() || undefined },
      }).unwrap()
      toast({ title: 'Listing moderated successfully' })
      setIsDialogOpen(false)
      setReason('')
    } catch (err) {
      toast({
        title: 'Failed to moderate listing',
        description: getErrorMessage(err),
        variant: 'destructive',
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingState type="spinner" />
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold">Error Loading Queue</h2>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">
            {getErrorMessage(error, 'Failed to load moderation queue')}
          </p>
        </CardContent>
      </Card>
    )
  }

  const listings = data?.listings || []

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Flatmates Listing Moderation</h1>
          <p className="text-muted-foreground mt-1">
            Review and approve/reject flatmate listings
          </p>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          {listings.length} Pending
        </Badge>
      </div>

      {listings.length === 0 ? (
        <EmptyState
          icon={<CheckCircle2 className="h-12 w-12" />}
          title="All caught up!"
          description="No pending listings to review."
        />
      ) : (
        <div className="grid gap-4">
          {listings.map((listing) => (
            <ModerationListingCard key={listing.id} listing={listing} onReview={handleModerate} />
          ))}
        </div>
      )}

      <ModerationActionDialog
        open={isDialogOpen}
        selectedListing={selectedListing}
        action={action}
        reason={reason}
        isModerating={isModerating}
        onOpenChange={setIsDialogOpen}
        onActionChange={setAction}
        onReasonChange={setReason}
        onSubmit={() => void handleSubmit()}
      />
    </div>
  )
}

export default ModerationQueuePage
