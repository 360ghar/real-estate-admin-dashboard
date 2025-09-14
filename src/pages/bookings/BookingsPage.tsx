import { useParams } from 'react-router-dom'
import BookingList from './components/BookingList'
import BookingDetail from './components/BookingDetail'

const BookingsPage = ({ mode }: { mode?: 'detail' }) => {
  const params = useParams()
  if (mode === 'detail') return <BookingDetail id={Number(params.id)} />
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Bookings</h1>
      <BookingList />
    </div>
  )
}

export default BookingsPage
