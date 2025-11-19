import { useState, useEffect } from 'react'
import { useGetRecommendationsQuery } from '@/features/properties/api/propertiesApi'
import { useSwipePropertyMutation } from '@/features/swipes/api/swipesApi'
import SwipeCard from '../components/SwipeCard'
import { Button } from '@/components/ui/button'
import { RotateCcw, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { AnimatePresence } from 'framer-motion'

const SwipePage = () => {
    const { toast } = useToast()
    const [currentIndex, setCurrentIndex] = useState(0)
    const { data: properties, isLoading, refetch } = useGetRecommendationsQuery({ limit: 10 })
    const [swipeProperty] = useSwipePropertyMutation()

    const handleSwipe = async (direction: 'left' | 'right') => {
        if (!properties || !properties[currentIndex]) return

        const property = properties[currentIndex]
        const action = direction === 'right' ? 'like' : 'dislike'

        // Optimistic update: move to next card immediately
        setCurrentIndex((prev) => prev + 1)

        try {
            const result = await swipeProperty({
                property_id: property.id,
                action,
            }).unwrap()

            if (result.match) {
                toast({
                    title: "It's a Match!",
                    description: `You matched with ${property.title}`,
                    variant: "default", // You might want a special 'success' or 'match' variant
                })
            }
        } catch (error) {
            console.error('Swipe failed:', error)
            // Optionally revert index or show error, but for swipes it's usually better to ignore
        }
    }

    const reset = () => {
        setCurrentIndex(0)
        refetch()
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    const currentProperties = properties || []
    const isFinished = currentIndex >= currentProperties.length

    return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] overflow-hidden relative">
            <div className="absolute top-4 text-center z-10">
                <h1 className="text-3xl font-bold tracking-tight">Discover Properties</h1>
                <p className="text-muted-foreground">Swipe right to like, left to pass</p>
            </div>

            <div className="relative w-full max-w-[400px] h-[600px] flex items-center justify-center">
                <AnimatePresence>
                    {!isFinished && currentProperties[currentIndex] && (
                        <SwipeCard
                            key={currentProperties[currentIndex].id}
                            property={currentProperties[currentIndex]}
                            onSwipe={handleSwipe}
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
