import React, { useState } from 'react';
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  parseISO,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Edit2, Trash2 } from 'lucide-react';
import { Session } from '../types';
import { useStore } from '../store';

interface Props {
  sessions: Session[];
  clients: any[];
  onEditSession: (session: Session) => void;
}

type ViewType = 'week' | 'month';

export const SessionCalendar: React.FC<Props> = ({ sessions, clients, onEditSession }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<ViewType>('week');
  const { deleteSession } = useStore();

  const getDaysInView = () => {
    switch (viewType) {
      case 'week':
        return eachDayOfInterval({
          start: startOfWeek(currentDate, { weekStartsOn: 1 }),
          end: endOfWeek(currentDate, { weekStartsOn: 1 }),
        });
      case 'month':
        return eachDayOfInterval({
          start: startOfMonth(currentDate),
          end: endOfMonth(currentDate),
        });
    }
  };

  const navigate = (direction: 'prev' | 'next') => {
    switch (viewType) {
      case 'week':
        setCurrentDate(direction === 'prev' ? subWeeks(currentDate, 1) : addWeeks(currentDate, 1));
        break;
      case 'month':
        setCurrentDate(
          direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1)
        );
        break;
    }
  };

  const days = getDaysInView();

  const getSessionsForDay = (date: Date) => {
    return sessions.filter((session) => {
      const sessionDate = parseISO(session.date);
      return isSameDay(sessionDate, date);
    });
  };

  const getClientName = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    return client ? `${client.first_name} ${client.last_name}` : 'Unknown Client';
  };

  const formatSessionTime = (timeString: string) => {
    try {
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(hours, 10));
      date.setMinutes(parseInt(minutes, 10));
      return format(date, 'h:mm a');
    } catch (error) {
      console.error('Error formatting time:', error);
      return timeString;
    }
  };

  const getSessionColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 text-green-700';
      case 'cancelled':
        return 'bg-red-50 text-red-700';
      default:
        return 'bg-indigo-50 text-indigo-700';
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (window.confirm('Are you sure you want to delete this session?')) {
      try {
        await deleteSession(sessionId);
      } catch (error) {
        console.error('Error deleting session:', error);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 flex items-center justify-between border-b">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewType('week')}
              className={`px-3 py-1 rounded-full text-sm ${
                viewType === 'week'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewType('month')}
              className={`px-3 py-1 rounded-full text-sm ${
                viewType === 'month'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              Month
            </button>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigate('prev')}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <CalendarIcon className="h-5 w-5 text-gray-600" />
          </button>
          <button
            onClick={() => navigate('next')}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
          <div
            key={day}
            className="bg-gray-50 p-2 text-center text-sm font-medium text-gray-500"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {days.map((day) => {
          const daySessions = getSessionsForDay(day);
          const isToday = isSameDay(day, new Date());
          const isCurrentMonth = isSameMonth(day, currentDate);

          return (
            <div
              key={day.toISOString()}
              className={`min-h-[120px] bg-white p-2 ${
                !isCurrentMonth ? 'bg-gray-50' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-sm ${
                    isToday
                      ? 'flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white'
                      : isCurrentMonth
                      ? 'text-gray-900'
                      : 'text-gray-400'
                  }`}
                >
                  {format(day, 'd')}
                </span>
              </div>
              <div className="mt-2 space-y-1">
                {daySessions.map((session) => (
                  <div
                    key={session.id}
                    className={`group relative flex items-center rounded-lg p-2 text-sm ${getSessionColor(session.status)}`}
                  >
                    <div className="flex-1">
                      <p className="font-medium">
                        {formatSessionTime(session.time)}
                      </p>
                      <p>{getClientName(session.client_id)}</p>
                    </div>
                    <div className="absolute right-2 top-2 hidden space-x-1 group-hover:flex">
                      <button
                        onClick={() => onEditSession(session)}
                        className="p-1 hover:text-indigo-600"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSession(session.id)}
                        className="p-1 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};