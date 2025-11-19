import { NavLink, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { LucideIcon } from 'lucide-react'

interface NavItemProps {
    to: string
    label: string
    icon: LucideIcon
    children?: Array<{ name: string; href: string; icon: LucideIcon }>
}

export const NavItem = ({ to, label, icon: Icon, children }: NavItemProps) => {
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
