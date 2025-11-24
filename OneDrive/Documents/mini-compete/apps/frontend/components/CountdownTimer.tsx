'use client';

import { useEffect, useState } from 'react';

interface CountdownTimerProps {
  deadline: string;
}

export default function CountdownTimer({ deadline }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    expired: boolean;
  } | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const deadlineTime = new Date(deadline).getTime();
      const difference = deadlineTime - now;

      if (difference <= 0) {
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          expired: true,
        };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
        expired: false,
      };
    };

    setTimeLeft(calculateTimeLeft());
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, [deadline]);

  if (!timeLeft) return null;

  if (timeLeft.expired) {
    return <span className="text-red-600 font-medium">Registration Closed</span>;
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-gray-600">Time remaining:</span>
      <div className="flex gap-1">
        {timeLeft.days > 0 && (
          <span className="font-semibold text-blue-600">
            {timeLeft.days}d {timeLeft.hours}h
          </span>
        )}
        {timeLeft.days === 0 && timeLeft.hours > 0 && (
          <span className="font-semibold text-blue-600">
            {timeLeft.hours}h {timeLeft.minutes}m
          </span>
        )}
        {timeLeft.days === 0 && timeLeft.hours === 0 && (
          <span className="font-semibold text-orange-600">
            {timeLeft.minutes}m {timeLeft.seconds}s
          </span>
        )}
      </div>
    </div>
  );
}

