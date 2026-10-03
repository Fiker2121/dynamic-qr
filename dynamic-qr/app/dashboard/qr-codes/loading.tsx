import { Skeleton } from '@/components/ui/skeleton';

export default function QrCodesLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading QR codes">
      <Skeleton className="h-9 w-48" />
      <Skeleton className="h-10 w-full max-w-sm" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-52 rounded-2xl" />)}
      </div>
    </div>
  );
}
