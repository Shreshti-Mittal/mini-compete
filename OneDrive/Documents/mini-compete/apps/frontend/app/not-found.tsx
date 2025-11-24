import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-9xl font-bold text-blue-600 mb-4">404</h1>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Go Home
          </Link>
          <div className="flex gap-4 justify-center">
            <Link
              href="/competitions"
              className="text-blue-600 hover:text-blue-800 transition"
            >
              Browse Competitions
            </Link>
            <Link
              href="/login"
              className="text-blue-600 hover:text-blue-800 transition"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

