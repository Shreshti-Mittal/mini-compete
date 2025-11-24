'use client';

import { useState, useEffect } from 'react';
import { getMailbox, MailboxEmail, markEmailAsRead } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import EmailDetailModal from '@/components/EmailDetailModal';

export default function MailboxPage() {
  const { user } = useAuth();
  const [emails, setEmails] = useState<MailboxEmail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<MailboxEmail | null>(null);

  useEffect(() => {
    fetchMailbox();
  }, []);

  const fetchMailbox = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getMailbox();
      setEmails(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch mailbox');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailClick = async (email: MailboxEmail) => {
    setSelectedEmail(email);
    if (!email.read) {
      try {
        await markEmailAsRead(email.id);
        setEmails((prev) =>
          prev.map((e) => (e.id === email.id ? { ...e, read: true } : e))
        );
      } catch (error) {
        console.error('Failed to mark email as read:', error);
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getPreview = (body: string, maxLength: number = 50) => {
    return body.length > maxLength ? body.substring(0, maxLength) + '...' : body;
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-gray-900">Mailbox</h1>
              <button
                onClick={fetchMailbox}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition disabled:opacity-50"
              >
                {isLoading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>

        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading emails...</p>
            </div>
          ) : emails.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-600">No emails yet.</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="divide-y divide-gray-200">
                {emails.map((email) => (
                  <div
                    key={email.id}
                    onClick={() => handleEmailClick(email)}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition ${
                      !email.read ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        {!email.read && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p
                            className={`text-sm font-medium truncate ${
                              !email.read ? 'text-gray-900 font-bold' : 'text-gray-600'
                            }`}
                          >
                            {email.subject}
                          </p>
                          <p className="text-xs text-gray-500 ml-4">
                            {formatDate(email.sentAt)}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 mb-1">From: Mini Compete System</p>
                        <p
                          className={`text-sm truncate ${
                            !email.read ? 'text-gray-900' : 'text-gray-600'
                          }`}
                        >
                          {getPreview(email.body)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

        {selectedEmail && (
          <EmailDetailModal
            email={selectedEmail}
            onClose={() => setSelectedEmail(null)}
            onMarkAsRead={(id) => {
              setEmails((prev) =>
                prev.map((e) => (e.id === id ? { ...e, read: true } : e))
              );
            }}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}

