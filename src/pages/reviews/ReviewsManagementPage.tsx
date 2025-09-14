import React, { useState, useEffect } from 'react'
import { Star, Eye, MessageSquare, Flag, Check, X, Search, Filter, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import {
  useGetAllReviewsQuery,
  useModerateReviewMutation,
  useGetPropertyReviewStatsQuery
} from '@/store/services/reviewsApi'
import type { PropertyReview } from '@/types/api'

const ReviewsManagementPage: React.FC = () => {
  const { toast } = useToast()
  const [filters, setFilters] = useState({
    page: 1,
    page_size: 20,
    rating: '',
    is_verified: '',
    is_public: '',
    property_id: '',
    user_id: '',
    search: '',
    date_from: '',
    date_to: ''
  })

  const [selectedReview, setSelectedReview] = useState<PropertyReview | null>(null)
  const [statsPropertyId, setStatsPropertyId] = useState<number | null>(null)

  // API hooks
  const query = {
    page: filters.page,
    page_size: filters.page_size,
    rating: filters.rating ? Number(filters.rating) : undefined,
    is_verified: filters.is_verified === '' ? undefined : filters.is_verified === 'true',
    is_public: filters.is_public === '' ? undefined : filters.is_public === 'true',
    property_id: filters.property_id ? Number(filters.property_id) : undefined,
    user_id: filters.user_id ? Number(filters.user_id) : undefined,
    search: filters.search || undefined,
    date_from: filters.date_from || undefined,
    date_to: filters.date_to || undefined,
  }
  const { data: reviewsData, isLoading, refetch } = useGetAllReviewsQuery(query)
  const { data: statsData } = useGetPropertyReviewStatsQuery(statsPropertyId!, {
    skip: !statsPropertyId
  })
  const [moderateReview, { isLoading: isModerating }] = useModerateReviewMutation()

  const reviews = reviewsData?.results || []
  const totalReviews = reviewsData?.count || 0

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  const handleModerate = async (reviewId: number, updates: { is_verified?: boolean; is_public?: boolean }) => {
    try {
      await moderateReview({ reviewId, ...updates }).unwrap()
      toast({ title: 'Success', description: 'Review updated successfully' })
      refetch()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.data?.message || 'Failed to update review',
        variant: 'destructive'
      })
    }
  }

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ))
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'bg-green-100 text-green-800'
    if (rating >= 3) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const renderAspectRatings = (aspects?: PropertyReview['aspects']) => {
    if (!aspects) return null

    const aspectLabels: Record<string, string> = {
      cleanliness: 'Cleanliness',
      accuracy: 'Accuracy',
      communication: 'Communication',
      location: 'Location',
      check_in: 'Check-in',
      value: 'Value'
    }

    return (
      <div className="mt-3 space-y-2">
        <p className="text-sm font-medium">Aspect Ratings:</p>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(aspects).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between text-sm">
              <span>{aspectLabels[key] || key}:</span>
              <div className="flex items-center gap-1">
                <span className="font-medium">{value}</span>
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Reviews Management</h1>
          <p className="text-muted-foreground mt-2">Manage and moderate property reviews</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Reviews</p>
                <p className="text-2xl font-bold">{totalReviews}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Verified Reviews</p>
                <p className="text-2xl font-bold">
                  {reviews.filter(r => r.is_verified).length}
                </p>
              </div>
              <Check className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Verification</p>
                <p className="text-2xl font-bold">
                  {reviews.filter(r => !r.is_verified).length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Public Reviews</p>
                <p className="text-2xl font-bold">
                  {reviews.filter(r => r.is_public).length}
                </p>
              </div>
              <Eye className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reviews..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filters.rating} onValueChange={(value) => handleFilterChange('rating', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Ratings</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
                <SelectItem value="4">4 Stars</SelectItem>
                <SelectItem value="3">3 Stars</SelectItem>
                <SelectItem value="2">2 Stars</SelectItem>
                <SelectItem value="1">1 Star</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.is_verified} onValueChange={(value) => handleFilterChange('is_verified', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Verification status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All</SelectItem>
                <SelectItem value="true">Verified</SelectItem>
                <SelectItem value="false">Not Verified</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.is_public} onValueChange={(value) => handleFilterChange('is_public', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All</SelectItem>
                <SelectItem value="true">Public</SelectItem>
                <SelectItem value="false">Private</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <Input
              type="date"
              placeholder="From date"
              value={filters.date_from}
              onChange={(e) => handleFilterChange('date_from', e.target.value)}
            />
            <Input
              type="date"
              placeholder="To date"
              value={filters.date_to}
              onChange={(e) => handleFilterChange('date_to', e.target.value)}
            />
            <Input
              placeholder="Property ID"
              value={filters.property_id}
              onChange={(e) => handleFilterChange('property_id', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      {isLoading ? (
        <div className="text-center py-8">Loading reviews...</div>
      ) : !reviews.length ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No reviews found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3">
                      <Avatar>
                        <AvatarImage src={review.user.avatar_url} />
                        <AvatarFallback>
                          {review.user.first_name[0]}{review.user.last_name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{review.title}</h3>
                          <Badge className={getRatingColor(review.rating)}>
                            {getRatingStars(review.rating)}
                            <span className="ml-1">{review.rating}</span>
                          </Badge>
                          {review.is_verified ? (
                            <Badge variant="default"><Check className="h-3 w-3 mr-1" />Verified</Badge>
                          ) : (
                            <Badge variant="secondary">Pending</Badge>
                          )}
                          {review.is_public ? (
                            <Badge variant="outline"><Eye className="h-3 w-3 mr-1" />Public</Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground">Private</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {review.user.first_name} {review.user.last_name} • Property ID: {review.property_id}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(review.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedReview(review)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>{review.title}</DialogTitle>
                            <DialogDescription>
                              Review by {review.user.first_name} {review.user.last_name}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="flex items-center gap-2">
                              {getRatingStars(review.rating)}
                              <span className="text-sm text-muted-foreground">
                                • {formatDate(review.created_at)}
                              </span>
                            </div>
                            <p className="text-sm">{review.comment}</p>
                            {renderAspectRatings(review.aspects)}
                            {review.tags && review.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {review.tags.map((tag, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                      {!review.is_verified && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleModerate(review.id, { is_verified: true })}
                          disabled={isModerating}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      {review.is_public && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleModerate(review.id, { is_public: false })}
                          disabled={isModerating}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <p className="text-sm line-clamp-2">{review.comment}</p>

                  {renderAspectRatings(review.aspects)}

                  {/* Tags */}
                  {review.tags && review.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {review.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalReviews > filters.page_size && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            disabled={filters.page === 1}
            onClick={() => handleFilterChange('page', (filters.page - 1).toString())}
          >
            Previous
          </Button>
          <span className="py-2 px-4">
            Page {filters.page} of {Math.ceil(totalReviews / filters.page_size)}
          </span>
          <Button
            variant="outline"
            disabled={filters.page >= Math.ceil(totalReviews / filters.page_size)}
            onClick={() => handleFilterChange('page', (filters.page + 1).toString())}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}

export default ReviewsManagementPage
