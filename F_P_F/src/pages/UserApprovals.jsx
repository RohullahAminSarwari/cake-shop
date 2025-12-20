import { useState } from 'react'

const initialUsers = [
  { id: 1, name: 'Aisha Khan', email: 'aisha@example.com', status: 'pending' },
  { id: 2, name: 'Omar Li', email: 'omar@example.com', status: 'active' },
  { id: 3, name: 'Sara Ben', email: 'sara@example.com', status: 'pending' },
  { id: 4, name: 'Noor Ali', email: 'noor@example.com', status: 'rejected' },
]

export default function UserApprovals() {
  const [users, setUsers] = useState(initialUsers)

  const updateStatus = (id, status) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status } : u)))
  }

  const filtered = {
    pending: users.filter((u) => u.status === 'pending'),
    active: users.filter((u) => u.status === 'active'),
    rejected: users.filter((u) => u.status === 'rejected'),
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-500">User Management</p>
          <h1 className="text-2xl font-semibold text-slate-900">Approvals & Access</h1>
          <p className="text-sm text-slate-600">
            Review new accounts, approve or reject, and manage active users.
          </p>
        </div>
        <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-slate-800">
          Invite user
        </button>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        <UserColumn
          title="Pending approval"
          users={filtered.pending}
          action={(id) => (
            <div className="flex gap-2">
              <button
                onClick={() => updateStatus(id, 'active')}
                className="rounded-md bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700"
              >
                Approve
              </button>
              <button
                onClick={() => updateStatus(id, 'rejected')}
                className="rounded-md bg-rose-600 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-700"
              >
                Reject
              </button>
            </div>
          )}
        />

        <UserColumn
          title="Active users"
          users={filtered.active}
          action={(id) => (
            <button
              onClick={() => updateStatus(id, 'rejected')}
              className="rounded-md bg-amber-500 px-3 py-1 text-xs font-semibold text-white hover:bg-amber-600"
            >
              Disable
            </button>
          )}
        />

        <UserColumn
          title="Rejected"
          users={filtered.rejected}
          action={(id) => (
            <button
              onClick={() => updateStatus(id, 'pending')}
              className="rounded-md bg-slate-700 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-800"
            >
              Move to pending
            </button>
          )}
        />
      </div>
    </div>
  )
}

function UserColumn({ title, users, action }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-4 py-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
          {title}
        </h2>
      </div>
      <ul className="divide-y divide-slate-100">
        {users.length === 0 && (
          <li className="px-4 py-6 text-sm text-slate-500">No users in this list.</li>
        )}
        {users.map((user) => (
          <li
            key={user.id}
            className="flex items-start justify-between gap-3 px-4 py-3 text-sm"
          >
            <div>
              <p className="font-semibold text-slate-900">{user.name}</p>
              <p className="text-slate-600">{user.email}</p>
              <p className="mt-1 rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
                {user.status}
              </p>
            </div>
            {action(user.id)}
          </li>
        ))}
      </ul>
    </div>
  )
}

