import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { selectCurrentUser, clearCredentials } from '@/features/auth/slices/authSlice'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { User, Settings, LogOut } from 'lucide-react'
import { ModeToggle } from '@/components/common/mode-toggle'

const TopBar = () => {
  const user = useAppSelector(selectCurrentUser)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const logout = () => {
    dispatch(clearCredentials())
    navigate('/login', { replace: true })
  }

  return (
    <header className="flex items-center justify-between border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-muted-foreground">
            Welcome back{user?.full_name ? `, ${user.full_name}` : ''}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <ModeToggle />
        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-3 rounded-full px-3 py-2 h-auto hover:bg-accent">
              <Avatar className="h-9 w-9 ring-2 ring-primary/10">
                <AvatarFallback className="text-sm font-semibold bg-primary/10 text-primary">
                  {user?.full_name ? user.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <div className="text-sm font-medium">{user?.full_name || 'User'}</div>
                <div className="text-xs text-muted-foreground">
                  {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : (user?.agent_id ? 'Agent' : 'Administrator')}
                </div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.full_name || 'User'}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email || user?.phone || 'No contact info'}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/users/preferences" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Preferences
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="flex items-center gap-2 text-red-600 focus:text-red-600">
              <LogOut className="h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

export default TopBar
