import { useState, useEffect } from 'react';
import { User, Users, Calendar, Mail, Phone, Loader2 } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/admin/users`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: 'admin', password: 'admin123' }),
        }
      );
      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-black to-purple-900/20 border border-purple-500/30 rounded-2xl p-12">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-400 mx-auto mb-4 animate-spin" />
          <p className="text-gray-400 text-lg">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-white mb-2 flex items-center gap-3">
            <Users className="w-8 h-8 text-purple-400" />
            User Management
          </h1>
          <p className="text-gray-400">
            Total Registered Users: <span className="text-purple-400">{users.length}</span>
          </p>
        </div>
      </div>

      {users.length === 0 ? (
        <div className="bg-gradient-to-br from-black to-purple-900/20 border border-purple-500/30 rounded-2xl p-12 text-center">
          <User className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No users registered yet.</p>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-black to-purple-900/20 border border-purple-500/30 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-purple-900/40 border-b border-purple-500/30">
                <tr>
                  <th className="px-6 py-4 text-left text-sm text-gray-300">#</th>
                  <th className="px-6 py-4 text-left text-sm text-gray-300">Name</th>
                  <th className="px-6 py-4 text-left text-sm text-gray-300">Email</th>
                  <th className="px-6 py-4 text-left text-sm text-gray-300">Phone</th>
                  <th className="px-6 py-4 text-left text-sm text-gray-300">Joined</th>
                  <th className="px-6 py-4 text-left text-sm text-gray-300">Last Sign In</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr 
                    key={user.id} 
                    className="border-b border-purple-500/10 hover:bg-purple-900/20 transition-colors"
                  >
                    <td className="px-6 py-4 text-gray-400">{index + 1}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-purple-400" />
                        <span className="text-white">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-purple-400" />
                        <span className="text-purple-300">{user.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-purple-400" />
                        <span className="text-gray-300">{user.phone || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-purple-400" />
                        <span className="text-gray-400 text-sm">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">
                      {user.lastSignIn 
                        ? new Date(user.lastSignIn).toLocaleDateString() 
                        : <span className="text-gray-600">Never</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
