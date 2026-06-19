import { useState } from 'react'
import { useGetRecommendationsQuery } from '@/features/properties/api/propertiesApi'
import { useSwipePropertyMutation } from '@/features/swipes/api/swipesApi'
import SwipeCard from '../components/SwipeCard'
import { Button } from '@/components/ui/button'
import { RotateCcw } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { LoadingState } from '@/components/ui/loading-state'
import { ErrorState } from '@/components/ui/error-state'
import { AnimatePresence } from 'framer-motion'
import { getErrorMessage } from '@/lib/errors'

const SwipePage = () => {
    const { toast } = useToast()
    const [currentIndex, setCurrentIndex] = useState(0)
    const { data: recommendations, isLoading, isError, refetch } = useGetRecommendationsQuery({ limit: 10 })
    const [swipeProperty] = useSwipePropertyMutation()

    const handleSwipe = async (direction: 'left' | 'right') => {
        const items = recommendations?.items ?? []
        if (!items[currentIndex]) return

        const property = items[currentIndex]
        const isLiked = direction === 'right'

        try {
            const result = await swipeProperty({
                property_id: property.id,
                is_liked: isLiked,
            }).unwrap()

            // Optimistic update: move to next card only after success
            setCurrentIndex((prev) => prev + 1)

            if (result.match) {
                toast({
                    title: "It's a Match!",
                    description: `You matched with ${property.title}`,
                    variant: "default",
                })
            }
        } catch (error) {
            toast({
                title: "Swipe failed",
                description: getErrorMessage(error, 'Something went wrong. Please try again.'),
                variant: "destructive",
            })
        }
    }

    const reset = () => {
        setCurrentIndex(0)
        void refetch()
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
                <LoadingState type="spinner" />
            </div>
        )
    }

    if (isError) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
                <ErrorState title="Failed to load recommendations" onRetry={() => void refetch()} />
            </div>
        )
    }

    const currentProperties = recommendations?.items ?? []
    const isFinished = currentIndex >= currentProperties.length

    return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] overflow-hidden relative">
            <div className="absolute top-4 text-center z-10">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Discover Properties</h1>
                <p className="text-muted-foreground">Swipe right to like, left to pass</p>
            </div>

            <div className="relative w-full max-w-[400px] h-[500px] sm:h-[600px] flex items-center justify-center">
                <AnimatePresence>
                    {!isFinished && currentProperties[currentIndex] && (
                        <SwipeCard
                            key={currentProperties[currentIndex].id}
                            property={currentProperties[currentIndex]}
                            onSwipe={(direction) => { void handleSwipe(direction) }}
                        />
                    )}
                </AnimatePresence>

                {isFinished && (
                    <div className="text-center space-y-4 p-8 bg-card rounded-xl border shadow-lg">
                        <div className="text-2xl font-semibold">No more properties!</div>
                        <p className="text-muted-foreground">
                            You've gone through all the recommendations for now.
                        </p>
                        <Button onClick={reset} className="gap-2">
                            <RotateCcw className="h-4 w-4" />
                            Start Over
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default SwipePage
