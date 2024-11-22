import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import type { Client, Session, TherapyNote } from '../types';

interface StoreState {
  user: User | null;
  isInitialized: boolean;
  clients: Client[];
  sessions: Session[];
  notes: TherapyNote[];
  initialize: () => Promise<void>;
  setUser: (user: User | null) => Promise<void>;
  fetchData: () => Promise<void>;
  addClient: (client: Omit<Client, 'id' | 'created_at' | 'updated_at' | 'therapist_id'>) => Promise<void>;
  updateClient: (id: string, updates: Partial<Client>) => Promise<void>;
  addSession: (session: Omit<Session, 'id' | 'created_at' | 'updated_at' | 'therapist_id'>) => Promise<void>;
  updateSession: (id: string, updates: Partial<Session>) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
  addNote: (note: { content: string; client_id: string; session_id: string }) => Promise<void>;
}

export const useStore = create<StoreState>((set, get) => ({
  user: null,
  isInitialized: false,
  clients: [],
  sessions: [],
  notes: [],

  initialize: async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      
      if (session?.user) {
        await get().setUser(session.user);
      } else {
        await get().setUser(null);
      }
    } catch (error) {
      console.error('Error initializing store:', error);
      await get().setUser(null);
    } finally {
      set({ isInitialized: true });
    }
  },

  setUser: async (user) => {
    set({ user });
    if (user) {
      await get().fetchData();
    } else {
      set({ clients: [], sessions: [], notes: [] });
    }
  },

  fetchData: async () => {
    const { user } = get();
    if (!user) return;

    try {
      const [
        { data: clients, error: clientsError },
        { data: sessions, error: sessionsError },
        { data: notes, error: notesError }
      ] = await Promise.all([
        supabase
          .from('clients')
          .select('*')
          .eq('therapist_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('sessions')
          .select('*')
          .eq('therapist_id', user.id)
          .order('date', { ascending: true }),
        supabase
          .from('therapy_notes')
          .select('*')
          .eq('therapist_id', user.id)
          .order('created_at', { ascending: false })
      ]);

      if (clientsError) throw clientsError;
      if (sessionsError) throw sessionsError;
      if (notesError) throw notesError;

      set({
        clients: clients || [],
        sessions: sessions || [],
        notes: notes || []
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
  },

  addClient: async (clientData) => {
    const { user } = get();
    if (!user) throw new Error('Not authenticated');

    try {
      const { data, error } = await supabase
        .from('clients')
        .insert([{
          ...clientData,
          therapist_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to create client');

      set((state) => ({
        clients: [data, ...state.clients]
      }));

      return data;
    } catch (error) {
      console.error('Error adding client:', error);
      throw error;
    }
  },

  updateClient: async (id, updates) => {
    const { user } = get();
    if (!user) throw new Error('Not authenticated');

    try {
      const { data, error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', id)
        .eq('therapist_id', user.id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to update client');

      set((state) => ({
        clients: state.clients.map((client) =>
          client.id === id ? { ...client, ...data } : client
        )
      }));

      return data;
    } catch (error) {
      console.error('Error updating client:', error);
      throw error;
    }
  },

  addSession: async (sessionData) => {
    const { user } = get();
    if (!user) throw new Error('Not authenticated');

    try {
      const { data, error } = await supabase
        .from('sessions')
        .insert([{
          ...sessionData,
          therapist_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to create session');

      set((state) => ({
        sessions: [...state.sessions, data]
      }));

      return data;
    } catch (error) {
      console.error('Error adding session:', error);
      throw error;
    }
  },

  updateSession: async (id, updates) => {
    const { user } = get();
    if (!user) throw new Error('Not authenticated');

    try {
      const { data, error } = await supabase
        .from('sessions')
        .update(updates)
        .eq('id', id)
        .eq('therapist_id', user.id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to update session');

      set((state) => ({
        sessions: state.sessions.map((session) =>
          session.id === id ? { ...session, ...data } : session
        )
      }));

      return data;
    } catch (error) {
      console.error('Error updating session:', error);
      throw error;
    }
  },

  deleteSession: async (id) => {
    const { user } = get();
    if (!user) throw new Error('Not authenticated');

    try {
      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('id', id)
        .eq('therapist_id', user.id);

      if (error) throw error;

      set((state) => ({
        sessions: state.sessions.filter((session) => session.id !== id)
      }));
    } catch (error) {
      console.error('Error deleting session:', error);
      throw error;
    }
  },

  addNote: async (noteData) => {
    const { user } = get();
    if (!user) throw new Error('Not authenticated');

    try {
      const { data, error } = await supabase
        .from('therapy_notes')
        .insert([{
          ...noteData,
          therapist_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to create note');

      set((state) => ({
        notes: [data, ...state.notes]
      }));

      return data;
    } catch (error) {
      console.error('Error adding note:', error);
      throw error;
    }
  }
}));