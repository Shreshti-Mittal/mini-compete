import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to Mini Compete
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Discover and participate in exciting competitions. Join as a participant or organize your own events.
          </p>
          <div className="flex gap-4 justify-center mb-12">
            <Link
              href="/competitions"
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-lg font-medium"
            >
              Browse Competitions
            </Link>
            <Link
              href="/login"
              className="px-8 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition text-lg font-medium"
            >
              Login
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Participate</h3>
              <p className="text-gray-600">
                Join competitions, showcase your skills, and compete with others.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Organize</h3>
              <p className="text-gray-600">
                Create and manage your own competitions. Set capacity, deadlines, and more.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Compete</h3>
              <p className="text-gray-600">
                Track your progress, see rankings, and win amazing prizes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

