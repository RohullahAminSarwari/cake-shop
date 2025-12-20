import { useMemo } from 'react'

const stats = [
  { label: 'Pending Approvals', value: 4 },
  { label: 'Total Users', value: 128 },
  { label: 'Published Posts', value: 42 },
  { label: 'Media Items', value: 230 },
]

const tasks = [
  'Review new user signup requests',
  'Approve or reject latest uploads',
  'Update homepage featured items',
  'Send announcement to registered users',
]

export default function AdminDashboard() {
  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }, [])

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-slate-500">Admin Control Panel</p>
            <h1 className="text-2xl font-semibold text-slate-900">
              {greeting}, Admin
            </h1>
            <p className="text-sm text-slate-600">
              Manage users, content, and approvals from one place.
            </p>
          </div>
          <button className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-slate-800">
            Add New Content
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              Quick Actions
            </h2>
            <button className="text-sm font-medium text-slate-600 hover:text-slate-900">
              View all
            </button>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <QuickAction title="Approve pending users" body="4 requests waiting" />
            <QuickAction title="Moderate uploads" body="12 items pending review" />
            <QuickAction title="Publish announcement" body="Send a message to all users" />
            <QuickAction title="Manage public gallery" body="Curate what guests can see" />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Today&apos;s tasks</h2>
          <ul className="mt-3 space-y-2">
            {tasks.map((task) => (
              <li
                key={task}
                className="flex items-start gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-700"
              >
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
                {task}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

function QuickAction({ title, body }) {
  return (
    <button className="flex flex-col items-start rounded-lg border border-slate-200 bg-white px-4 py-3 text-left text-sm transition hover:-translate-y-0.5 hover:shadow">
      <span className="font-semibold text-slate-900">{title}</span>
      <span className="text-slate-600">{body}</span>
    </button>
  )
}

