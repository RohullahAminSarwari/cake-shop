import NavBar from './NavBar'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <NavBar />
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  )
}

