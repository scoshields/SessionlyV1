import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FileText, Calendar } from 'lucide-react';
import { format, startOfDay, endOfDay, parseISO } from 'date-fns';
import type { Session, TherapyNote } from '../types';
import { useStore } from '../store';

const noteSchema = z.object({
  content: z.string().min(1, 'Notes cannot be empty'),
  client_id: z.string(),
  session_id: z.string(),
});

type NoteFormData = z.infer<typeof noteSchema>;

interface Props {
  sessions: Session[];
  clients: any[];
  notes: TherapyNote[];
  onSubmit: (data: NoteFormData) => Promise<void>;
}

export const TherapyNotes: React.FC<Props> = ({ sessions, clients, notes, onSubmit }) => {
  const [selectedSession, setSelectedSession] = useState<string>('');
  const { updateSession } = useStore();

  const hasNotes = (sessionId: string) => {
    return notes.some(note => note.session_id === sessionId);
  };

  const incompleteSessions = sessions.filter(session => {
    const sessionDate = parseISO(session.date);
    const today = new Date();
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);
    return (
      sessionDate >= todayStart && 
      sessionDate <= todayEnd && 
      !hasNotes(session.id) &&
      session.status !== 'cancelled'
    );
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NoteFormData>({
    resolver: zodResolver(noteSchema),
  });

  const handleSessionSelect = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setSelectedSession(sessionId);
      reset({
        session_id: sessionId,
        client_id: session.client_id,
        content: ''
      });
    }
  };

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client ? `${client.first_name} ${client.last_name}` : 'Unknown Client';
  };

  const handleSubmitForm = async (data: NoteFormData) => {
    try {
      // Save the note
      await onSubmit(data);
      
      // Mark the session as completed
      await updateSession(data.session_id, { status: 'completed' });
      
      reset();
      setSelectedSession('');
    } catch (error) {
      console.error('Error submitting note:', error);
      throw error;
    }
  };

  if (incompleteSessions.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4 mb-8">
          <FileText className="h-8 w-8 text-indigo-600" />
          <h2 className="text-2xl font-bold text-gray-900">Session Notes</h2>
        </div>
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No pending notes for today</h3>
          <p className="mt-1 text-sm text-gray-500">
            All session notes have been completed
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4 mb-8">
        <FileText className="h-8 w-8 text-indigo-600" />
        <h2 className="text-2xl font-bold text-gray-900">Session Notes</h2>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Session
        </label>
        <div className="grid gap-3">
          {incompleteSessions.map((session) => (
            <button
              key={session.id}
              type="button"
              onClick={() => handleSessionSelect(session.id)}
              className={`flex items-center justify-between p-4 rounded-lg border ${
                selectedSession === session.id
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-indigo-200'
              }`}
            >
              <div className="flex flex-col">
                <span className="font-medium text-gray-900">
                  {getClientName(session.client_id)}
                </span>
                <span className="text-sm text-gray-500">
                  {format(parseISO(`${session.date}T${session.time}`), 'h:mm a')}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedSession && (
        <form onSubmit={handleSubmit(handleSubmitForm)} className="space-y-6">
          <input
            type="hidden"
            {...register('client_id')}
            value={incompleteSessions.find(s => s.id === selectedSession)?.client_id}
          />
          <input
            type="hidden"
            {...register('session_id')}
            value={selectedSession}
          />

          <div>
            <textarea
              {...register('content')}
              rows={12}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Enter your session notes here..."
            />
            {errors.content && (
              <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn"
            >
              {isSubmitting ? 'Saving...' : 'Save Notes'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};