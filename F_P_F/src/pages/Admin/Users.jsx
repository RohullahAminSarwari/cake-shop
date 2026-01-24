import { useEffect, useState } from 'react';
import api from '../../config/api';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'seller', // Default to Product Creator for new users
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users');
      // Handle different response formats
      const usersData = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setUsers(usersData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await api.put(`/admin/users/${editingUser.id}`, formData);
      } else {
        await api.post('/admin/users', formData);
      }
      setShowModal(false);
      setEditingUser(null);
      resetForm();
      fetchUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Failed to save user');
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      password: '',
      role: user.role || 'customer',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await api.delete(`/admin/users/${id}`);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'customer',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Users</h1>
          <p className="text-gray-600">Manage user accounts</p>
        </div>
        <button
          onClick={() => {
            setEditingUser(null);
            resetForm();
            setShowModal(true);
          }}
          className="btn-primary"
        >
          + Add User
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold">Name</th>
                  <th className="text-left py-4 px-6 font-semibold">Email</th>
                  <th className="text-left py-4 px-6 font-semibold">Role</th>
                  <th className="text-left py-4 px-6 font-semibold">Joined</th>
                  <th className="text-left py-4 px-6 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-12 text-gray-600">
                      No users found. Click "Add User" to get started.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="py-4 px-6 font-semibold">{user.name}</td>
                      <td className="py-4 px-6">{user.email}</td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                          user.role === 'seller' ? 'bg-green-100 text-green-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role === 'seller' ? 'Product Creator' : user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-600">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(user)}
                            className="text-blue-600 hover:text-blue-700 font-semibold"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="text-red-600 hover:text-red-700 font-semibold"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                {editingUser ? 'Edit User' : 'Add User'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingUser(null);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block font-semibold mb-2">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block font-semibold mb-2">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block font-semibold mb-2">
                  Password {!editingUser && '*'}
                </label>
                <input
                  type="password"
                  required={!editingUser}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input-field"
                  placeholder={editingUser ? "Leave empty to keep current" : ""}
                />
              </div>

              <div>
                <label className="block font-semibold mb-2">Role *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="input-field"
                >
                  <option value="seller">Product Creator</option>
                  <option value="admin">Admin</option>
                </select>
                <p className="text-sm text-gray-600 mt-1">
                  {formData.role === 'seller' && 'Can add and manage their own products'}
                  {formData.role === 'admin' && 'Full system access and user management'}
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  {editingUser ? 'Update' : 'Create'} User
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingUser(null);
                    resetForm();
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

