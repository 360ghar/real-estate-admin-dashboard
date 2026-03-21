import { useState, useEffect, useCallback } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronRight } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavChild {
    name: string
    href: string
    icon: LucideIcon
    children?: NavChild[]
}

export interface NavItemProps {
    to: string
    label: string
    icon: LucideIcon
    children?: NavChild[]
    depth?: number
}

const STORAGE_KEY = 'sidebar-expanded'

function getExpandedState(): Set<string> {
    try {
        const stored = localStorage.getItem(STORAGE_KEY)
        return stored ? new Set(JSON.parse(stored) as string[]) : new Set()
    } catch {
        return new Set()
    }
}

function saveExpandedState(expanded: Set<string>) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...expanded]))
}

function hasActiveChild(children: NavChild[], pathname: string): boolean {
    return children.some(child => 
        pathname === child.href || 
        pathname.startsWith(child.href + '/') ||
        (child.children && hasActiveChild(child.children, pathname))
    )
}

export const NavItem = ({ to, label, icon: Icon, children, depth = 0 }: NavItemProps) => {
    const location = useLocation()
    const isChildActive = children ? hasActiveChild(children, location.pathname) : false
    
    const [isOpen, setIsOpen] = useState(() => {
        const expanded = getExpandedState()
        return expanded.has(label) || isChildActive
    })

    useEffect(() => {
        if (isChildActive && !isOpen) {
            setIsOpen(true)
        }
    }, [isChildActive, isOpen])

    const handleToggle = useCallback((open: boolean) => {
        setIsOpen(open)
        const expanded = getExpandedState()
        if (open) {
            expanded.add(label)
        } else {
            expanded.delete(label)
        }
        saveExpandedState(expanded)
    }, [label])

    const isActive = location.pathname === to || location.pathname.startsWith(to + '/')
    const iconSize = depth === 0 ? 'h-4 w-4' : depth === 1 ? 'h-3.5 w-3.5' : 'h-3 w-3'
    const paddingLeft = depth === 0 ? 'pl-3' : depth === 1 ? 'pl-6' : 'pl-9'

    if (children && children.length > 0) {
        return (
            <Collapsible open={isOpen} onOpenChange={handleToggle}>
                <CollapsibleTrigger
                    className={cn(
                        'flex w-full items-center gap-2 rounded-md pr-3 py-2 text-sm font-medium transition-colors',
                        paddingLeft,
                        isChildActive
                            ? 'bg-accent/50 text-accent-foreground'
                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                >
                    <Icon className={iconSize} />
                    <span className="flex-1 text-left">{label}</span>
                    <ChevronRight 
                        className={cn(
                            'h-4 w-4 transition-transform duration-200',
                            isOpen && 'rotate-90'
                        )} 
                    />
                </CollapsibleTrigger>
                <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                    <div className="mt-1 space-y-1 border-l border-border/50 ml-5">
                        {children.map((child) => (
                            <NavItem
                                key={child.href}
                                to={child.href}
                                label={child.name}
                                icon={child.icon}
                                children={child.children}
                                depth={depth + 1}
                            />
                        ))}
                    </div>
                </CollapsibleContent>
            </Collapsible>
        )
    }

    return (
        <NavLink
            to={to}
            className={cn(
                'flex items-center gap-2 rounded-md pr-3 py-2 text-sm font-medium transition-colors',
                paddingLeft,
                isActive
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
        >
            <Icon className={iconSize} />
            <span>{label}</span>
        </NavLink>
    )
}
