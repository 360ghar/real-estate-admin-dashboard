import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { clearCredentials, selectCurrentUser } from '@/store/slices/authSlice'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

const TopBar = () => {
  const user = useAppSelector(selectCurrentUser)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const logout = () => {
    dispatch(clearCredentials())
    navigate('/login', { replace: true })
  }

  return (
    <header className="flex items-center justify-between border-b bg-white px-4 py-3">
      <div className="text-sm text-slate-500">Welcome back{user?.full_name ? `, ${user.full_name}` : ''}</div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2 rounded-full px-2 py-1">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{user?.full_name ? user.full_name[0] : 'U'}</AvatarFallback>
            </Avatar>
            <span className="text-sm">{user?.full_name || user?.phone || 'User'}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/profile">Profile</Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}

export default TopBar
