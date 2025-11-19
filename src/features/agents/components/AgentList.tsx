import { useState } from 'react'
import { useListAgentsQuery } from '@/features/agents/api/agentsApi'
import { Card } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { EmptyState } from '@/components/ui/empty-state'
import { MoreHorizontal, Edit, BarChart3, Users, RotateCcw } from 'lucide-react'
import {
  ColumnDef,
} from '@tanstack/react-table'
import { AgentSummary } from '@/features/agents/api/agentsApi'

type Agent = AgentSummary

const agentColumns: ColumnDef<Agent>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'phone',
    header: 'Phone',
  },
  {
    accessorKey: 'is_active',
    header: 'Status',
    cell: ({ row }) => {
      const isActive = row.getValue('is_active')
      return <Badge variant={isActive ? 'default' : 'secondary'}>{isActive ? 'Active' : 'Inactive'}</Badge>
    },
  },
  {
    accessorKey: 'users_assigned',
    header: 'Users Assigned',
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const agent = row.original
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem asChild>
              <Link to={`/agents/${agent.id}`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to={`/agents/${agent.id}/stats`}>
                <BarChart3 className="h-4 w-4 mr-2" />
                Stats
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

const AgentList = () => {
  const { data, isFetching, error, refetch } = useListAgentsQuery({ include_inactive: true })

  if (isFetching) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <div className="h-10 bg-muted animate-pulse rounded" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <EmptyState
        icon={<RotateCcw className="h-12 w-12" />}
        title="Failed to load agents"
        description="Please check your connection and try again"
        action={{
          label: "Retry",
          onClick: () => refetch(),
          variant: "outline"
        }}
      />
    )
  }

  if (!data?.results?.length) {
    return (
      <EmptyState
        icon={<Users className="h-12 w-12" />}
        title="No agents found"
        description="Get started by creating your first agent"
        action={{
          label: "Create Agent",
          onClick: () => window.location.href = "/agents/new"
        }}
      />
    )
  }

  return (
    <Card>
      <DataTable
        columns={agentColumns}
        data={data.results}
      />
    </Card>
  )
}

export default AgentList