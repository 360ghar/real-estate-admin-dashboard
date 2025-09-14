import { useListAgentsQuery } from '@/store/services/agentsApi'
import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Link } from 'react-router-dom'

const AgentList = () => {
  const { data, isFetching } = useListAgentsQuery({ include_inactive: true })
  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Users Assigned</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.results?.map((a) => (
            <TableRow key={a.id}>
              <TableCell>{a.name}</TableCell>
              <TableCell>{a.email || '-'}</TableCell>
              <TableCell>{a.phone || '-'}</TableCell>
              <TableCell>{a.is_active ? 'Active' : 'Inactive'}</TableCell>
              <TableCell>{a.users_assigned ?? '-'}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Link className="text-blue-600 hover:underline" to={`/agents/${a.id}`}>Edit</Link>
                  <Link className="text-blue-600 hover:underline" to={`/agents/${a.id}/stats`}>Stats</Link>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {!isFetching && (!data?.results || data.results.length === 0) && (
            <TableRow>
              <TableCell className="text-slate-500" colSpan={6}>No agents found.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  )
}

export default AgentList
