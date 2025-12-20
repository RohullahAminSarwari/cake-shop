import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import AdminDashboard from './pages/AdminDashboard'
import UserApprovals from './pages/UserApprovals'
import UserAccount from './pages/UserAccount'
import PublicGallery from './pages/PublicGallery'
import './App.css'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/users" element={<UserApprovals />} />
        <Route path="/account" element={<UserAccount />} />
        <Route path="/public" element={<PublicGallery />} />
      </Routes>
    </Layout>
  )
}

export default App

