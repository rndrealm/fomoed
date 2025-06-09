'use client';

import { useNotificationSubscription } from '@/lib/hooks/use-notification-subscription';

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  useNotificationSubscription();
  return <>{children}</>;
} 