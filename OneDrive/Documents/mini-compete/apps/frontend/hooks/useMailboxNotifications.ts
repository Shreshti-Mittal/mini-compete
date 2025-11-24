import { useState, useEffect } from 'react';
import { getUnreadCount } from '@/lib/api';

export const useMailboxNotifications = () => {
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchCount = async () => {
    try {
      const data = await getUnreadCount();
      setUnreadCount(data.count);
    } catch (error) {
      // Silently fail
      console.error('Failed to fetch unread count:', error);
    }
  };

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 30000); // Poll every 30s

    return () => clearInterval(interval);
  }, []);

  return { unreadCount, refresh: fetchCount };
};

