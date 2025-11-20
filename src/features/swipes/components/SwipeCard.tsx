import { useState } from 'react'
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, Bed, Bath, Square, X, Heart, Info } from 'lucide-react'
import type { Property } from '@/types'
import { Link } from 'react-router-dom'

interface SwipeCardProps {
    property: Property
    onSwipe: (direction: 'left' | 'right') => void
}

const SwipeCard = ({ property, onSwipe }: SwipeCardProps) => {
    const [exitX, setExitX] = useState(0)
    const x = useMotionValue(0)
    const rotate = useTransform(x, [-200, 200], [-25, 25])
    const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0])

    const handleDragEnd = (_event: any, info: PanInfo) => {
        if (info.offset.x > 100) {
            setExitX(200)
            onSwipe('right')
        } else if (info.offset.x < -100) {
            setExitX(-200)
            onSwipe('left')
        }
    }

    const amenitiesList = property.amenities || []

    return (
        <motion.div
            style={{ x, rotate, opacity, position: 'absolute', width: '100%', maxWidth: '400px' }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, x: exitX }}
            transition={{ duration: 0.2 }}
            className="cursor-grab active:cursor-grabbing"
        >
            <Card className="overflow-hidden h-[600px] flex flex-col shadow-xl border-2">
                <div className="relative h-3/5 bg-muted">
                    <img
                        src={property.main_image_url || '/placeholder-property.jpg'}
                        alt={property.title}
                        className="w-full h-full object-cover pointer-events-none"
                    />
                    <div className="absolute top-4 left-4">
                        <Badge className="capitalize">{property.status}</Badge>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
                        <h2 className="text-2xl font-bold truncate">{property.title}</h2>
                        <p className="flex items-center text-sm opacity-90">
                            <MapPin className="h-4 w-4 mr-1" />
                            {[property.locality, property.city].filter(Boolean).join(', ')}
                        </p>
                    </div>
                </div>
                <CardContent className="flex-1 p-4 flex flex-col justify-between">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-2xl font-bold text-primary">
                                ₹{property.base_price.toLocaleString()}
                            </span>
                            <span className="text-sm text-muted-foreground capitalize">
                                {property.property_type.replace('_', ' ')} • {property.purpose.replace('_', ' ')}
                            </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="flex flex-col items-center p-2 bg-muted/50 rounded-lg">
                                <Bed className="h-5 w-5 mb-1 text-muted-foreground" />
                                <span className="text-sm font-medium">
                                    {property.bedrooms ?? '-'} Beds
                                </span>
                            </div>
                            <div className="flex flex-col items-center p-2 bg-muted/50 rounded-lg">
                                <Bath className="h-5 w-5 mb-1 text-muted-foreground" />
                                <span className="text-sm font-medium">
                                    {property.bathrooms ?? '-'} Baths
                                </span>
                            </div>
                            <div className="flex flex-col items-center p-2 bg-muted/50 rounded-lg">
                                <Square className="h-5 w-5 mb-1 text-muted-foreground" />
                                <span className="text-sm font-medium">{property.area_sqft ?? '-'} sqft</span>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {amenitiesList.slice(0, 3).map((amenity) => (
                                <Badge key={amenity.id} variant="secondary" className="text-xs">
                                    {amenity.title}
                                </Badge>
                            ))}
                            {amenitiesList.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                    +{amenitiesList.length - 3} more
                                </Badge>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-4 mt-4 justify-center">
                        <Button
                            size="lg"
                            variant="outline"
                            className="rounded-full h-14 w-14 border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                            onClick={() => {
                                setExitX(-200)
                                onSwipe('left')
                            }}
                        >
                            <X className="h-8 w-8" />
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="rounded-full h-14 w-14 border-blue-200 text-blue-500 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
                            asChild
                        >
                            <Link to={`/properties/${property.id}`}>
                                <Info className="h-8 w-8" />
                            </Link>
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="rounded-full h-14 w-14 border-green-200 text-green-500 hover:bg-green-50 hover:text-green-600 hover:border-green-300"
                            onClick={() => {
                                setExitX(200)
                                onSwipe('right')
                            }}
                        >
                            <Heart className="h-8 w-8 fill-current" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}

export default SwipeCard
