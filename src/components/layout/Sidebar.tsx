import { NavLink, useLocation } from 'react-router-dom'
import { useAppSelector } from '@/hooks/redux'
import { selectCurrentUser } from '@/store/slices/authSlice'
import { Button } from '@/components/ui/button'
import { Menu, Home, Building, Users, Calendar, BookOpen, User, BarChart3, FileText, AlertCircle, Settings, Smartphone, Folder, Tag } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

const NavItem = ({ to, label, icon: Icon, children }: {
  to: string;
  label: string;
  icon: any;
  children?: Array<{ name: string; href: string; icon: any }>
}) => {
  const location = useLocation()

  if (children) {
    return (
      <div>
        <div className={cn(
          'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground'
        )}>
          <Icon className="h-4 w-4" />
          <span>{label}</span>
        </div>
        <div className="ml-4 mt-1 space-y-1">
          {children.map((child) => (
            <NavLink
              key={child.href}
              to={child.href}
              className={cn(
                'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium',
                location.pathname === child.href
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <child.icon className="h-3 w-3" />
              <span>{child.name}</span>
            </NavLink>
          ))}
        </div>
      </div>
    )
  }

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
  const role: 'admin' | 'agent' | 'user' = (user?.role as any) || (user?.agent_id ? 'agent' : 'admin')

  const baseNav = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Properties', href: '/properties', icon: Building },
    { name: 'Visits', href: '/visits', icon: Calendar },
    { name: 'Bookings', href: '/bookings', icon: BookOpen },
  ]

  const adminExtras = [
    { name: 'Users', href: '/users', icon: Users },
    { name: 'Agents', href: '/agents', icon: User },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    {
      name: 'Admin Tools',
      href: '/admin',
      icon: Settings,
      children: [
        { name: 'Bug Reports', href: '/bug-reports', icon: AlertCircle },
        {
          name: 'Blogs',
          href: '/blogs',
          icon: FileText,
          children: [
            { name: 'All Posts', href: '/blogs', icon: FileText },
            { name: 'Categories', href: '/blogs/categories', icon: Folder },
            { name: 'Tags', href: '/blogs/tags', icon: Tag },
          ]
        },
        { name: 'Pages', href: '/pages', icon: FileText },
        { name: 'App Updates', href: '/app-updates', icon: Smartphone },
      ]
    }
  ]

  const profileItem = { name: 'My Profile', href: role === 'agent' ? '/agents/me' : '/profile', icon: User }

  const navigation = role === 'admin'
    ? [...baseNav, ...adminExtras, profileItem]
    : role === 'agent'
      ? [...baseNav, { name: 'Users', href: '/users', icon: Users }, profileItem]
      : [...baseNav, profileItem]

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
                      <NavItem
                        key={item.name}
                        to={item.href}
                        label={item.name}
                        icon={item.icon}
                        children={(item as any).children}
                      />
                    ))}
                  </nav>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </SheetContent>
      </Sheet>
      <div className="hidden md:block w-64 flex-shrink-0 border-r bg-background">
        <div className="h-full p-4">
          <div className="mb-6 text-lg font-semibold">360Ghar Portal</div>
          <nav className="space-y-2">
            {navigation.map((item) => (
              <NavItem
                key={item.name}
                to={item.href}
                label={item.name}
                icon={item.icon}
                children={(item as any).children}
              />
            ))}
          </nav>
        </div>
      </div>
    </>
  )
}

export default Sidebar
