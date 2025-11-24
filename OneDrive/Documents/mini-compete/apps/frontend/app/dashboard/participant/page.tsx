'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { getMyRegistrations, UserRegistration } from '@/lib/api';
import StatusBadge from '@/components/StatusBadge';
import CountdownTimer from '@/components/CountdownTimer';

export default function ParticipantDashboard() {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState<UserRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getMyRegistrations();
      setRegistrations(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch registrations');
    } finally {
      setIsLoading(false);
    }
  };

  const isUpcoming = (deadline: string) => {
    return new Date(deadline) > new Date();
  };

  return (
    <ProtectedRoute allowedRoles={['PARTICIPANT']}>
      <div className="min-h-screen bg-gray-50">
        <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">My Registrations</h2>
              <button
                onClick={fetchRegistrations}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition disabled:opacity-50"
              >
                {isLoading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Loading registrations...</p>
              </div>
            ) : registrations.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <p className="text-gray-600 mb-4">You haven't registered for any competitions yet.</p>
                <Link
                  href="/competitions"
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Browse Competitions
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {registrations.map((registration) => {
                  const competition = registration.competition;
                  const upcoming = isUpcoming(competition.regDeadline);
                  const registrationDate = new Date(registration.registeredAt);

                  return (
                    <div
                      key={registration.id}
                      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-xl font-bold text-gray-900 flex-1">
                          {competition.title}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            upcoming
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {upcoming ? 'Upcoming' : 'Past'}
                        </span>
                      </div>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {competition.description}
                      </p>

                      {competition.tags && competition.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {competition.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="space-y-2 mb-4 text-sm">
                        <div>
                          <span className="text-gray-600">Registered: </span>
                          <span className="font-medium text-gray-900">
                            {registrationDate.toLocaleDateString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Organizer: </span>
                          <span className="font-medium text-gray-900">
                            {competition.organizer?.name || 'Unknown'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Deadline: </span>
                          <span className="font-medium text-gray-900">
                            {new Date(competition.regDeadline).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {upcoming && (
                        <div className="mb-4 pt-4 border-t border-gray-200">
                          <CountdownTimer deadline={competition.regDeadline} />
                        </div>
                      )}

                      <Link
                        href={`/competitions/${competition.id}`}
                        className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      >
                        View Details
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
