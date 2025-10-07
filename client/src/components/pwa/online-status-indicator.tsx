import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/use-online-status';

interface OnlineStatusIndicatorProps {
  showWhenOnline?: boolean;
  position?: 'top' | 'bottom';
}

export const OnlineStatusIndicator: React.FC<OnlineStatusIndicatorProps> = ({
  showWhenOnline = false,
  position = 'top',
}) => {
  const { isOnline, wasOffline } = useOnlineStatus();

  const shouldShow = !isOnline || (wasOffline && showWhenOnline);
  if (!shouldShow) return null;

  const positionClasses = position === 'top' ? 'top-4' : 'bottom-4';

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed ${positionClasses} left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg shadow-lg z-50 flex items-center gap-2 transition-all ${
        isOnline ? 'bg-green-500' : 'bg-red-500'
      } text-white`}
    >
      {isOnline ? (
        <Wifi size={18} aria-hidden="true" />
      ) : (
        <WifiOff size={18} aria-hidden="true" />
      )}
      <span className="text-sm font-medium">
        {isOnline ? 'Back online' : 'You are offline'}
      </span>
    </div>
  );
};