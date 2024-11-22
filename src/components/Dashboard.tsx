import React, { useState } from 'react';
import { Routes, Route, NavLink, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Brain, LogOut } from 'lucide-react';
import { ClientForm } from './ClientForm';
import { ClientList } from './ClientList';
import { ClientProfile } from './ClientProfile';
import { SessionCalendar } from './SessionCalendar';
import { TherapyNotes } from './TherapyNotes';
import { DashboardHome } from './DashboardHome';
import { useStore } from '../store';
import { supabase } from '../lib/supabase';

const ClientProfileWrapper = () => {
  const { id } = useParams();
  const { clients, sessions, notes } = useStore();
  const navigate = useNavigate();
  const client = clients.find(c => c.id === id);

  if (!client) {
    return <Navigate to="/dashboard/clients" />;
  }

  return (
    <ClientProfile
      client={client}
      sessions={sessions.filter(s => s.client_id === id)}
      notes={notes.filter(n => n.client_id === id)}
      onBack={() => navigate('/dashboard/clients')}
      onAddSession={useStore.getState().addSession}
      onUpdateSession={useStore.getState().updateSession}
    />
  );
};

export const Dashboard: React.FC = () => {
  const [showNewClient, setShowNewClient] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { clients, sessions, notes, setUser } = useStore();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      await setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Brain className="h-8 w-8 text-indigo-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">
                  SessionPro
                </span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <NavLink
                  to="/dashboard"
                  end
                  className={({ isActive }) =>
                    `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive
                        ? 'border-indigo-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`
                  }
                >
                  Dashboard
                </NavLink>
                <NavLink
                  to="/dashboard/clients"
                  className={({ isActive }) =>
                    `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive
                        ? 'border-indigo-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`
                  }
                >
                  Clients
                </NavLink>
                <NavLink
                  to="/dashboard/schedule"
                  className={({ isActive }) =>
                    `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive
                        ? 'border-indigo-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`
                  }
                >
                  Schedule
                </NavLink>
                <NavLink
                  to="/dashboard/notes"
                  className={({ isActive }) =>
                    `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive
                        ? 'border-indigo-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`
                  }
                >
                  Notes
                </NavLink>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleSignOut}
                className="ml-4 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md flex items-center"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<DashboardHome clients={clients} sessions={sessions} notes={notes} />} />
          <Route 
            path="/clients" 
            element={
              <div className="space-y-8">
                <ClientList 
                  clients={clients}
                  onSelectClient={(client) => navigate(`/dashboard/clients/${client.id}`)}
                />
                {showNewClient && (
                  <div className="mt-8 bg-white shadow rounded-lg p-6">
                    <ClientForm onSubmit={async (data) => {
                      await useStore.getState().addClient(data);
                      setShowNewClient(false);
                    }} />
                  </div>
                )}
                {!showNewClient && (
                  <div className="flex justify-end">
                    <button
                      onClick={() => setShowNewClient(true)}
                      className="btn"
                    >
                      Add Client
                    </button>
                  </div>
                )}
              </div>
            }
          />
          <Route path="/clients/:id" element={<ClientProfileWrapper />} />
          <Route 
            path="/schedule" 
            element={
              <SessionCalendar
                sessions={sessions}
                clients={clients}
                onEditSession={(session) => {
                  navigate(`/dashboard/clients/${session.client_id}`);
                }}
              />
            }
          />
          <Route 
            path="/notes" 
            element={
              <TherapyNotes
                sessions={sessions}
                clients={clients}
                notes={notes}
                onSubmit={useStore.getState().addNote}
              />
            }
          />
        </Routes>
      </div>
    </div>
  );
};