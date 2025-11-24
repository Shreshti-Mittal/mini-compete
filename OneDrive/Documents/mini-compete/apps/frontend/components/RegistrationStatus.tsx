'use client';

interface RegistrationStatusProps {
  isRegistered: boolean;
  isRegistering: boolean;
  error: string | null;
  canRegister: boolean;
  onRegister: () => void;
}

export default function RegistrationStatus({
  isRegistered,
  isRegistering,
  error,
  canRegister,
  onRegister,
}: RegistrationStatusProps) {
  if (isRegistered) {
    return (
      <div className="w-full px-4 py-3 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center gap-2">
          <svg
            className="w-5 h-5 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span className="text-green-800 font-medium">Already Registered</span>
        </div>
      </div>
    );
  }

  if (isRegistering) {
    return (
      <div className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center justify-center gap-2">
          <svg
            className="animate-spin h-5 w-5 text-blue-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="text-blue-800 font-medium">Registering...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-2">
        <div className="w-full px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
        {canRegister && (
          <button
            onClick={onRegister}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Try Again
          </button>
        )}
      </div>
    );
  }

  if (canRegister) {
    return (
      <button
        onClick={onRegister}
        disabled={isRegistering}
        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Register Now
      </button>
    );
  }

  return null;
}

