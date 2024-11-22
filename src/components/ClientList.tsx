import React, { useState } from 'react';
import { format } from 'date-fns';
import { User, Mail, Phone, Calendar, ToggleLeft, ToggleRight } from 'lucide-react';
import { Client } from '../types';
import { useStore } from '../store';

interface Props {
  clients: Client[];
  onSelectClient: (client: Client) => void;
}

export const ClientList: React.FC<Props> = ({ clients, onSelectClient }) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { updateClient } = useStore();

  const filteredClients = clients
    .filter((client) => {
      if (filter === 'all') return true;
      return client.status === filter;
    })
    .filter((client) => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      const firstName = client.first_name?.toLowerCase() || '';
      const lastName = client.last_name?.toLowerCase() || '';
      const email = client.email?.toLowerCase() || '';
      
      return (
        firstName.includes(searchLower) ||
        lastName.includes(searchLower) ||
        email.includes(searchLower)
      );
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const toggleStatus = async (client: Client, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await updateClient(client.id, {
        status: client.status === 'active' ? 'inactive' : 'active',
      });
    } catch (error) {
      console.error('Error updating client status:', error);
    }
  };

  return (
    <div className="mt-8">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-medium text-gray-900">Client List</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-full text-sm ${
                filter === 'all'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-3 py-1 rounded-full text-sm ${
                filter === 'active'
                  ? 'bg-green-100 text-green-700'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilter('inactive')}
              className={`px-3 py-1 rounded-full text-sm ${
                filter === 'inactive'
                  ? 'bg-red-100 text-red-700'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              Inactive
            </button>
          </div>
        </div>
        <input
          type="text"
          placeholder="Search clients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-64 px-4 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map((client) => (
          <div
            key={client.id}
            onClick={() => onSelectClient(client)}
            className="border rounded-lg p-6 hover:shadow-lg transition-shadow bg-white relative group cursor-pointer"
          >
            <div className="absolute top-4 right-4">
              <button
                onClick={(e) => toggleStatus(client, e)}
                className="text-gray-400 hover:text-indigo-600 transition-colors"
                title={`Toggle status (currently ${client.status})`}
              >
                {client.status === 'active' ? (
                  <ToggleRight className="h-6 w-6" />
                ) : (
                  <ToggleLeft className="h-6 w-6" />
                )}
              </button>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                  <User className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-lg font-semibold text-gray-900 truncate">
                  {client.first_name} {client.last_name}
                </h4>
                <div className="mt-1 flex flex-col space-y-2">
                  {client.email && (
                    <div className="flex items-center text-sm text-gray-500">
                      <Mail className="h-4 w-4 mr-2" />
                      <span className="truncate">{client.email}</span>
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center text-sm text-gray-500">
                      <Phone className="h-4 w-4 mr-2" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Client since {format(new Date(client.created_at), 'MMM d, yyyy')}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  client.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {filteredClients.length === 0 && (
        <div className="text-center py-12">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No clients found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm
              ? 'Try adjusting your search terms'
              : 'Get started by adding a new client'}
          </p>
        </div>
      )}
    </div>
  );
};