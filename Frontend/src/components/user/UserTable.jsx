import Table from '../common/Table'

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Actions' },
]

function UserTable({ users, onEdit, onDelete }) {
  return (
    <Table columns={columns}>
      {users.map((user) => (
        <tr key={user.id || user.email}>
          <td className="border-b border-slate-100 px-4 py-6">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-600">
                {user.name.charAt(0)}
              </div>
              <span className="font-semibold text-[#0F172A]">{user.name}</span>
            </div>
          </td>
          <td className="border-b border-slate-100 px-4 py-6 text-slate-500">{user.email}</td>
          <td className="border-b border-slate-100 px-4 py-6">
            <span className="rounded-lg bg-[#EEF2FF] px-3 py-1 text-sm font-medium text-[#1E3A8A]">
              {user.role}
            </span>
          </td>
          <td className="border-b border-slate-100 px-4 py-6">
            <span
              className={`inline-flex items-center gap-2 text-sm font-medium ${
                user.status === 'Active' ? 'text-[#14B8A6]' : 'text-slate-400'
              }`}
            >
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  user.status === 'Active' ? 'bg-[#14B8A6]' : 'bg-slate-300'
                }`}
              />
              {user.status}
            </span>
          </td>
          <td className="border-b border-slate-100 px-4 py-6">
            <div className="flex items-center gap-4 text-slate-400">
              <button type="button" onClick={() => onEdit(user)} className="transition hover:text-[#1E3A8A]">
                <i className="ri-edit-box-line text-lg" aria-hidden="true" />
              </button>
              <button type="button" onClick={() => onDelete(user)} className="transition hover:text-red-500">
                <i className="ri-delete-bin-6-line text-lg" aria-hidden="true" />
              </button>
            </div>
          </td>
        </tr>
      ))}
    </Table>
  )
}

export default UserTable
