import { useAppSelector } from '@/hooks/redux'
import { selectCurrentUser } from '@/features/auth/slices/authSlice'
import { Home, Building, Users, Calendar, BookOpen, User, BarChart3, FileText, AlertCircle, Settings, Smartphone, Folder, Tag, Bell, Heart } from 'lucide-react'
import { NavItem } from './NavItem'

export const SidebarContent = () => {
    const user = useAppSelector(selectCurrentUser)
    const role = (user?.role as 'admin' | 'agent' | 'user') || (user?.agent_id ? 'agent' : 'admin')

    const baseNav = [
        { name: 'Dashboard', href: '/dashboard', icon: Home },
        { name: 'Properties', href: '/properties', icon: Building },
        { name: 'Visits', href: '/visits', icon: Calendar },
        { name: 'Bookings', href: '/bookings', icon: BookOpen },
        { name: 'Discover', href: '/swipes', icon: Heart },
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
                { name: 'Notifications', href: '/notifications', icon: Bell },
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
        <div className="h-full p-4">
            <div className="mb-6 text-lg font-semibold">360 Ghar</div>
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
    )
}
