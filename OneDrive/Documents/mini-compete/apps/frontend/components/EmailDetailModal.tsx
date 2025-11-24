'use client';

import { MailboxEmail, markEmailAsRead } from '@/lib/api';
import { useState } from 'react';

interface EmailDetailModalProps {
  email: MailboxEmail | null;
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
}

export default function EmailDetailModal({
  email,
  onClose,
  onMarkAsRead,
}: EmailDetailModalProps) {
  const [isMarkingAsRead, setIsMarkingAsRead] = useState(false);

  if (!email) return null;

  const handleMarkAsRead = async () => {
    if (email.read) return;

    try {
      setIsMarkingAsRead(true);
      await markEmailAsRead(email.id);
      onMarkAsRead(email.id);
    } catch (error) {
      console.error('Failed to mark email as read:', error);
    } finally {
      setIsMarkingAsRead(false);
    }
  };

  // Mark as read when modal opens
  if (!email.read && !isMarkingAsRead) {
    handleMarkAsRead();
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{email.subject}</h2>
              <div className="text-sm text-gray-600">
                <div>
                  <span className="font-medium">From: </span>
                  <span>Mini Compete System</span>
                </div>
                <div>
                  <span className="font-medium">To: </span>
                  <span>{email.to}</span>
                </div>
                <div>
                  <span className="font-medium">Date: </span>
                  <span>{formatDate(email.sentAt)}</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="whitespace-pre-wrap text-gray-700">{email.body}</div>
        </div>

        <div className="p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

