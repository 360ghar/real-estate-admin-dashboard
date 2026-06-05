import { useNavigate } from 'react-router-dom'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { useUserRole } from '@/hooks/useUserRole'
import {
  BarChart3,
  Bell,
  BookOpen,
  Building,
  Calendar,
  CalendarPlus,
  ClipboardList,
  FileText,
  HelpCircle,
  Home,
  Plus,
  UserCog,
  Users,
} from 'lucide-react'

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate()
  const { role } = useUserRole()
  const isAdmin = role === 'admin'

  const go = (path: string) => {
    onOpenChange(false)
    navigate(path)
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search pages and actions…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigate">
          <CommandItem onSelect={() => go('/dashboard')}>
            <Home className="h-4 w-4" />
            Dashboard
          </CommandItem>
          <CommandItem onSelect={() => go('/properties')}>
            <Building className="h-4 w-4" />
            Properties
          </CommandItem>
          <CommandItem onSelect={() => go('/pm/dashboard')}>
            <ClipboardList className="h-4 w-4" />
            Property Management
          </CommandItem>
          <CommandItem onSelect={() => go('/visits')}>
            <Calendar className="h-4 w-4" />
            Visits
          </CommandItem>
          <CommandItem onSelect={() => go('/bookings')}>
            <BookOpen className="h-4 w-4" />
            Bookings
          </CommandItem>
          <CommandItem onSelect={() => go('/users')}>
            <Users className="h-4 w-4" />
            Users
          </CommandItem>
          {isAdmin && (
            <>
              <CommandItem onSelect={() => go('/agents')}>
                <UserCog className="h-4 w-4" />
                Agents
              </CommandItem>
              <CommandItem onSelect={() => go('/analytics')}>
                <BarChart3 className="h-4 w-4" />
                Analytics
              </CommandItem>
              <CommandItem onSelect={() => go('/notifications')}>
                <Bell className="h-4 w-4" />
                Notifications
              </CommandItem>
              <CommandItem onSelect={() => go('/blogs')}>
                <FileText className="h-4 w-4" />
                Blog
              </CommandItem>
              <CommandItem onSelect={() => go('/faqs')}>
                <HelpCircle className="h-4 w-4" />
                FAQs
              </CommandItem>
            </>
          )}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Quick actions">
          <CommandItem onSelect={() => go('/properties/new')}>
            <Plus className="h-4 w-4" />
            New property
          </CommandItem>
          <CommandItem onSelect={() => go('/visits/new')}>
            <CalendarPlus className="h-4 w-4" />
            Schedule visit
          </CommandItem>
          {isAdmin && (
            <CommandItem onSelect={() => go('/agents/new')}>
              <Plus className="h-4 w-4" />
              New agent
            </CommandItem>
          )}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
