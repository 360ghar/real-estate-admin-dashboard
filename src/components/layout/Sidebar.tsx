import { NavLink, useLocation } from 'react-router-dom'
import { useAppSelector } from '@/hooks/redux'
import { selectCurrentUser } from '@/store/slices/authSlice'
import { Button } from '@/components/ui/button'
import { Menu, Home, Building, Users, Calendar, BookOpen, User, BarChart3 } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

const NavItem = ({ to, label, icon: Icon }: { to: string; label: string; icon: any }) => {
  const location = useLocation()
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <NavLink
          to={to}
          className={cn(
            'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium',
            location.pathname === to
              ? 'bg-accent text-accent-foreground'
              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          )}
        >
          <Icon className="h-4 w-4" />
          <span>{label}</span>
        </NavLink>
      </TooltipTrigger>
      <TooltipContent side="right">
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  )
}

const Sidebar = () => {
  const user = useAppSelector(selectCurrentUser)
  const role = user?.agent_id ? 'agent' : 'admin'

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: role === 'agent' ? 'My Properties' : 'All Properties', href: '/properties', icon: Building },
    { name: role === 'agent' ? 'My Users' : 'All Users', href: '/users', icon: Users },
    { name: role === 'agent' ? 'My Visits' : 'All Visits', href: '/visits', icon: Calendar },
    { name: role === 'agent' ? 'My Bookings' : 'All Bookings', href: '/bookings', icon: BookOpen },
    ...(role === 'admin' ? [
      { name: 'Agents', href: '/agents', icon: User },
      { name: 'Analytics', href: '/analytics', icon: BarChart3 }
    ] : []),
  ]

  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <div className="h-full">
            <div className="mb-6 p-4 text-lg font-semibold border-b">360Ghar Portal</div>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="navigation">
                <AccordionTrigger className="px-4 py-2">Navigation</AccordionTrigger>
                <AccordionContent className="px-4">
                  <nav className="space-y-2">
                    {navigation.map((item) => (
                      <NavItem key={item.name} to={item.href} label={item.name} icon={item.icon} />
                    ))}
                  </nav>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </SheetContent>
      </Sheet>
      <div className="hidden md:block w-64 flex-shrink-0 border-r bg-white">
        <div className="h-full p-4">
          <div className="mb-6 text-lg font-semibold">360Ghar Portal</div>
          <nav className="space-y-2">
            {navigation.map((item) => (
              <NavItem key={item.name} to={item.href} label={item.name} icon={item.icon} />
            ))}
          </nav>
        </div>
      </div>
    </>
  )
}

export default Sidebar

