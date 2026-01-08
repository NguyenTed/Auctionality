/**
 * Countdown Clock Component
 * Displays a real-time countdown timer in Catawiki style
 */

import { useEffect, useState } from "react";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

interface CountdownClockProps {
  endTime: string | null | undefined;
  onEnd?: () => void;
  className?: string;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

export default function CountdownClock({
  endTime,
  onEnd,
  className = "",
}: CountdownClockProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining | null>(null);

  useEffect(() => {
    if (!endTime) {
      setTimeRemaining(null);
      return;
    }

    const calculateTimeRemaining = (): TimeRemaining | null => {
      const now = Date.now();
      const end = new Date(endTime).getTime();
      const diff = end - now;

      if (diff <= 0) {
        if (onEnd) onEnd();
        return null;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      return { days, hours, minutes, seconds, total: diff };
    };

    // Calculate immediately
    setTimeRemaining(calculateTimeRemaining());

    // Update every second
    const interval = setInterval(() => {
      const remaining = calculateTimeRemaining();
      setTimeRemaining(remaining);
      if (!remaining) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime, onEnd]);

  if (!timeRemaining) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <AccessTimeIcon className="text-gray-400" fontSize="small" />
        <span className="text-lg font-semibold text-gray-500">Auction Ended</span>
      </div>
    );
  }

  const isUrgent = timeRemaining.total < 3600000; // Less than 1 hour
  const isVeryUrgent = timeRemaining.total < 300000; // Less than 5 minutes

  return (
    <div className={`${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <AccessTimeIcon
          className={isUrgent ? "text-red-500 animate-pulse" : "text-orange-600"}
          fontSize="small"
        />
        <p className="text-sm font-semibold text-gray-700">Time Remaining</p>
      </div>
      <div
        className={`
          flex items-center gap-2
          ${isVeryUrgent ? "text-red-600" : isUrgent ? "text-orange-600" : "text-gray-900"}
          font-bold
        `}
      >
        {timeRemaining.days > 0 && (
          <>
            <div className="flex flex-col items-center bg-white/80 rounded-lg px-3 py-2 min-w-[60px]">
              <span className="text-2xl leading-none">{String(timeRemaining.days).padStart(2, "0")}</span>
              <span className="text-xs text-gray-600 mt-1">day{timeRemaining.days !== 1 ? "s" : ""}</span>
            </div>
            <span className="text-xl">:</span>
          </>
        )}
        <div className="flex flex-col items-center bg-white/80 rounded-lg px-3 py-2 min-w-[60px]">
          <span className="text-2xl leading-none">{String(timeRemaining.hours).padStart(2, "0")}</span>
          <span className="text-xs text-gray-600 mt-1">hour{timeRemaining.hours !== 1 ? "s" : ""}</span>
        </div>
        <span className="text-xl">:</span>
        <div className="flex flex-col items-center bg-white/80 rounded-lg px-3 py-2 min-w-[60px]">
          <span className="text-2xl leading-none">{String(timeRemaining.minutes).padStart(2, "0")}</span>
          <span className="text-xs text-gray-600 mt-1">min</span>
        </div>
        <span className="text-xl">:</span>
        <div className="flex flex-col items-center bg-white/80 rounded-lg px-3 py-2 min-w-[60px]">
          <span className="text-2xl leading-none">{String(timeRemaining.seconds).padStart(2, "0")}</span>
          <span className="text-xs text-gray-600 mt-1">sec</span>
        </div>
      </div>
    </div>
  );
}

