'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { competitionsApi, registerForCompetition, checkRegistration } from '@/lib/api';
import { Competition } from '@/types/competition';
import { useAuth } from '@/contexts/AuthContext';
import { generateUUID } from '@/lib/utils';
import toast from 'react-hot-toast';
import StatusBadge from '@/components/StatusBadge';
import CountdownTimer from '@/components/CountdownTimer';
import RegistrationStatus from '@/components/RegistrationStatus';

export default function CompetitionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [competition, setCompetition] = useState<Competition | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  const [idempotencyKey, setIdempotencyKey] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchCompetition(params.id as string);
      if (user) {
        checkUserRegistration(params.id as string);
      }
    }
  }, [params.id, user]);

  const fetchCompetition = async (id: string) => {
    try {
      setIsLoading(true);
      const data = await competitionsApi.getById(id);
      setCompetition(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch competition');
    } finally {
      setIsLoading(false);
    }
  };

  const checkUserRegistration = async (competitionId: string) => {
    try {
      const result = await checkRegistration(competitionId);
      setIsRegistered(result.isRegistered);
    } catch (err) {
      // Silently fail - user might not be logged in
      setIsRegistered(false);
    }
  };

  const handleRegister = async () => {
    if (!competition || !user) return;

    // Generate idempotency key if not already set
    const key = idempotencyKey || generateUUID();
    if (!idempotencyKey) {
      setIdempotencyKey(key);
    }

    setIsRegistering(true);
    setRegistrationError(null);

    try {
      await registerForCompetition(competition.id, key);
      setIsRegistered(true);
      setRegistrationError(null);
      toast.success('Registration confirmed! Check your mailbox for confirmation email.');
      // Refresh competition data to update registration count
      await fetchCompetition(competition.id);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to register';
      setRegistrationError(errorMessage);
      toast.error(errorMessage);

      // If it's a conflict (already registered or full), check registration status
      if (errorMessage.includes('Already registered') || errorMessage.includes('full')) {
        await checkUserRegistration(competition.id);
      }
    } finally {
      setIsRegistering(false);
    }
  };

  const isOrganizer = competition?.organizerId === user?.id;
  const isParticipant = user?.role === 'PARTICIPANT';
  const canRegister =
    isParticipant &&
    !isRegistered &&
    competition &&
    competition.status === 'OPEN' &&
    !competition.isExpired &&
    (competition.seatsLeft || 0) > 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading competition details...</p>
      </div>
    );
  }

  if (error || !competition) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Competition not found'}</p>
          <button
            onClick={() => router.push('/competitions')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Competitions
          </button>
        </div>
      </div>
    );
  }

  const registrationCount = competition.registrationCount || 0;
  const seatsLeft = competition.seatsLeft || 0;
  const capacity = competition.capacity;
  const progressPercentage = capacity > 0 ? (registrationCount / capacity) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-800 mb-4"
          >
            ← Back
          </button>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{competition.title}</h1>
                <StatusBadge status={competition.status || 'OPEN'} />
              </div>
              <p className="text-gray-600">Organized by {competition.organizer?.name}</p>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{competition.description}</p>
            </div>

            {competition.tags && competition.tags.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {competition.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Competition Details</h2>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Capacity</dt>
                  <dd className="text-lg text-gray-900">{capacity} participants</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Registered</dt>
                  <dd className="text-lg text-gray-900">
                    {registrationCount} / {capacity}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Seats Available</dt>
                  <dd className="text-lg text-gray-900">{seatsLeft} seats left</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Registration Deadline</dt>
                  <dd className="text-lg text-gray-900">
                    {new Date(competition.regDeadline).toLocaleString()}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Registration Status</h3>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium text-gray-900">
                    {registrationCount} / {capacity}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      progressPercentage >= 100
                        ? 'bg-red-500'
                        : progressPercentage >= 80
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                  />
                </div>
              </div>

              <div className="mb-4 pt-4 border-t border-gray-200">
                <CountdownTimer deadline={competition.regDeadline} />
              </div>

              <RegistrationStatus
                isRegistered={isRegistered}
                isRegistering={isRegistering}
                error={registrationError}
                canRegister={canRegister}
                onRegister={handleRegister}
              />

              {isOrganizer && (
                <div className="space-y-2 pt-4 border-t border-gray-200">
                  <Link
                    href={`/competitions/${competition.id}/registrations`}
                    className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Manage Registrations
                  </Link>
                  <button
                    onClick={() => {
                      // Edit functionality will be added later
                      alert('Edit feature coming soon!');
                    }}
                    className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                  >
                    Edit Competition
                  </button>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Organizer</h3>
              <div>
                <p className="font-medium text-gray-900">{competition.organizer?.name}</p>
                <p className="text-sm text-gray-600">{competition.organizer?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

