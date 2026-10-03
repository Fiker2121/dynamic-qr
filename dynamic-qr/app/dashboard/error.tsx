'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/empty-state';

export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('Dashboard error', error.digest);
  }, [error]);

  return (
    <EmptyState
      icon={AlertTriangle}
      title="We couldn’t load this page"
      description="Something went wrong while fetching your data. Try again in a moment."
      action={<Button onClick={reset}>Try again</Button>}
    />
  );
}
