import { useParams } from 'react-router-dom'
import UserList from './components/UserList'
import UserDetail from './components/UserDetail'

const UsersPage = ({ mode }: { mode?: 'detail' }) => {
  const params = useParams()
  if (mode === 'detail') {
    const id = Number(params.id)
    return <UserDetail id={id} />
  }
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Users</h1>
      <UserList />
    </div>
  )
}

export default UsersPage
