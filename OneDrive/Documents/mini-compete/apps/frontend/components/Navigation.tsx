'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useMailboxNotifications } from '@/hooks/useMailboxNotifications';

export default function Navigation() {
  const { user, logout, isLoading } = useAuth();
  const { unreadCount } = useMailboxNotifications();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-xl font-bold text-blue-600">
              Mini Compete
            </Link>
            <Link
              href="/competitions"
              className="text-gray-700 hover:text-blue-600 transition"
            >
              Competitions
            </Link>
            {user && user.role === 'ORGANIZER' && (
              <Link
                href="/dashboard/organizer"
                className="text-gray-700 hover:text-blue-600 transition"
              >
                My Competitions
              </Link>
            )}
            {user && user.role === 'PARTICIPANT' && (
              <Link
                href="/dashboard/participant"
                className="text-gray-700 hover:text-blue-600 transition"
              >
                My Registrations
              </Link>
            )}
            {user && (
              <Link
                href="/mailbox"
                className="relative text-gray-700 hover:text-blue-600 transition"
              >
                <span className="flex items-center gap-1">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  Mailbox
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </span>
              </Link>
            )}
          </div>

          <div className="flex items-center gap-4">
            {isLoading ? (
              <span className="text-gray-600">Loading...</span>
            ) : user ? (
              <>
                <span className="text-sm text-gray-700">Welcome, {user.name}</span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

