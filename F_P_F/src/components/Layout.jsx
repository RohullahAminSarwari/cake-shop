import { AuthProvider } from '../contexts/AuthContext';
import NavBar from './NavBar';

export default function Layout({ children }) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <main>{children}</main>
      </div>
    </AuthProvider>
  );
}
