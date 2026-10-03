'use client';

import { useTransition } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { DateRange } from '@/types/database';

const RANGES: Array<{ value: DateRange; label: string }> = [
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
  { value: 'all', label: 'All time' },
];

const ALL_CODES = 'all';

interface AnalyticsFiltersProps {
  range: DateRange;
  qrCodeId: string | null;
  qrOptions: Array<{ id: string; name: string }>;
}

export function AnalyticsFilters({ range, qrCodeId, qrOptions }: AnalyticsFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  function navigate(nextRange: DateRange, nextQr: string | null) {
    const params = new URLSearchParams();
    params.set('range', nextRange);
    if (nextQr) params.set('qr', nextQr);
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="space-y-1.5">
        <Label htmlFor="analytics-range" className="text-xs text-muted-foreground">Date range</Label>
        <Select value={range} onValueChange={(v) => navigate(v as DateRange, qrCodeId)}>
          <SelectTrigger id="analytics-range" className="w-full sm:w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            {RANGES.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="analytics-qr" className="text-xs text-muted-foreground">QR code</Label>
        <Select value={qrCodeId ?? ALL_CODES} onValueChange={(v) => navigate(range, v === ALL_CODES ? null : v)}>
          <SelectTrigger id="analytics-qr" className="w-full sm:w-56"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_CODES}>All QR codes</SelectItem>
            {qrOptions.map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <Button type="button" variant="outline" disabled={pending} onClick={() => startTransition(() => router.refresh())}>
        {pending ? <Loader2 className="animate-spin" /> : <RefreshCw />}
        Refresh
      </Button>
    </div>
  );
}
