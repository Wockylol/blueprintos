import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import { Users, DollarSign, CheckCircle2, Clock } from 'lucide-react';

type Client = {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
  status: string;
};

export function ClientCRMSection() {
  const { profile } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    if (!profile?.workspace_id) return;

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('workspace_id', profile.workspace_id)
      .eq('role', 'client')
      .order('created_at', { ascending: false });

    if (data) {
      setClients(data.map(d => ({
        ...d,
        status: 'Active'
      })));
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="text-white">Loading clients...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Client CRM</h2>
        <p className="text-gray-400">Manage your clients and track their progress</p>
      </div>

      {clients.length === 0 ? (
        <div className="card-glass p-12 text-center">
          <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No clients yet</h3>
          <p className="text-gray-400">Clients will appear here once they enroll in your programs</p>
        </div>
      ) : (
        <div className="card-glass">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-700">
                  <th className="text-left p-4 text-sm font-semibold text-gray-400">Client</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-400">Status</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-400">Progress</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-400">Revenue</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-400">Joined</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id} className="border-b border-dark-700 hover:bg-dark-800/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-blue rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {client.full_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="text-white font-medium">{client.full_name}</div>
                          <div className="text-sm text-gray-400">{client.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-3 py-1 bg-primary-500/20 text-primary-400 rounded-full text-sm">
                        {client.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-dark-700 h-2 rounded-full overflow-hidden">
                          <div className="bg-gradient-blue h-full" style={{ width: '0%' }} />
                        </div>
                        <span className="text-sm text-gray-400">0%</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-white">$0</span>
                    </td>
                    <td className="p-4">
                      <span className="text-gray-400 text-sm">
                        {new Date(client.created_at).toLocaleDateString()}
                      </span>
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
