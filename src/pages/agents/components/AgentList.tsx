import { useState } from 'react'
import { useListAgentsQuery } from '@/store/services/agentsApi'
import { Card } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Edit, BarChart3 } from 'lucide-react'
import {
  ColumnDef,
} from '@tanstack/react-table'
import { AgentSummary } from '@/store/services/agentsApi'

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
      const isActive = row.getValue('is_active') as boolean | undefined
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
              <Link to={`/agents/${agent.id}`}>Edit</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to={`/agents/${agent.id}/stats`}>Stats</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

const AgentList = () => {
  const { data, isFetching } = useListAgentsQuery({ include_inactive: true })

  if (isFetching) {
    return (
      <Card>
        <div className="absolute inset-0 bg-muted/50 rounded-lg">
          <Skeleton className="h-full w-full" />
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <DataTable
        columns={agentColumns}
        data={data?.results || []}
      />
    </Card>
  )
}

export default AgentList
