import { useState } from 'react'

export default function UserAccount() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [status, setStatus] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setStatus('pending')
    // Here you would call Laravel API to create the account
    setTimeout(() => {
      setStatus('submitted')
    }, 500)
  }

  return (
    <div className="mx-auto max-w-3xl rounded-xl bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">Create your account</h1>
      <p className="mt-1 text-sm text-slate-600">
        Submit your details. An admin will review and approve or delete the request.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Field label="Full name">
          <input
            required
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:border-slate-400 focus:outline-none"
            placeholder="Jane Doe"
          />
        </Field>

        <Field label="Email">
          <input
            required
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:border-slate-400 focus:outline-none"
            placeholder="you@example.com"
          />
        </Field>

        <Field label="Password">
          <input
            required
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:border-slate-400 focus:outline-none"
            placeholder="••••••••"
          />
        </Field>

        <button
          type="submit"
          className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          disabled={status === 'pending'}
        >
          {status === 'pending' ? 'Submitting...' : 'Submit for approval'}
        </button>

        {status === 'submitted' && (
          <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            Request sent! An admin will approve or delete your account.
          </p>
        )}
      </form>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <label className="block space-y-1 text-sm font-medium text-slate-700">
      <span>{label}</span>
      {children}
    </label>
  )
}

