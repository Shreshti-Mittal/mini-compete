import Link from 'next/link';
import { Competition } from '@/types/competition';
import StatusBadge from './StatusBadge';
import CountdownTimer from './CountdownTimer';

interface CompetitionCardProps {
  competition: Competition;
}

export default function CompetitionCard({ competition }: CompetitionCardProps) {
  const registrationCount = competition.registrationCount || 0;
  const seatsLeft = competition.seatsLeft || 0;
  const capacity = competition.capacity;
  const progressPercentage = capacity > 0 ? (registrationCount / capacity) * 100 : 0;

  return (
    <Link href={`/competitions/${competition.id}`}>
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 h-full flex flex-col">
        <div className="flex justify-between items-start mb-3 gap-2">
          <h3 className="text-xl font-bold text-gray-900 flex-1 min-w-0">
            <span className="block overflow-hidden text-ellipsis line-clamp-2">
              {competition.title}
            </span>
          </h3>
          <StatusBadge status={competition.status || 'OPEN'} />
        </div>

        <p className="text-gray-600 text-sm mb-4 min-h-[60px]">
          <span className="block overflow-hidden text-ellipsis line-clamp-3">
            {competition.description}
          </span>
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
            {competition.tags.length > 3 && (
              <span className="px-2 py-1 text-gray-500 text-xs">
                +{competition.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        <div className="mt-auto space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Registrations</span>
              <span className="font-medium text-gray-900">
                {registrationCount} / {capacity}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
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

          <div className="flex justify-between items-center text-sm">
            <div>
              <span className="text-gray-600">Organizer: </span>
              <span className="font-medium text-gray-900">
                {competition.organizer?.name || 'Unknown'}
              </span>
            </div>
          </div>

          {seatsLeft > 0 && seatsLeft <= 5 && (
            <div className="px-3 py-1 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
              Only {seatsLeft} {seatsLeft === 1 ? 'seat' : 'seats'} left!
            </div>
          )}

          <div className="pt-2 border-t border-gray-200">
            <CountdownTimer deadline={competition.regDeadline} />
          </div>
        </div>
      </div>
    </Link>
  );
}

