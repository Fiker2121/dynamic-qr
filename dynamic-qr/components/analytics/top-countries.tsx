import { Globe2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/empty-state';
import { countryFlag, countryName } from '@/lib/qr/location';
import { formatNumber, formatPercentage } from '@/lib/utils';
import type { CountryStat } from '@/types/database';

export function TopCountries({ data }: { data: CountryStat[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Locations</CardTitle>
        <CardDescription>Country reported by your host or CDN. Never precise.</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <EmptyState icon={Globe2} title="No scans yet" description="Share your QR code to start collecting analytics." />
        ) : (
          <ol className="space-y-4">
            {data.map((item, index) => (
              <li key={item.country} className="space-y-1.5">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="w-4 text-right text-xs text-muted-foreground tabular-nums">{index + 1}</span>
                    <span aria-hidden="true">{countryFlag(item.country)}</span>
                    <span className="truncate font-medium">{countryName(item.country)}</span>
                    {item.country !== 'Unknown' && <span className="text-xs text-muted-foreground">{item.country}</span>}
                  </span>
                  <span className="shrink-0 tabular-nums text-muted-foreground">
                    {formatNumber(item.scans)} · {formatPercentage(item.percentage)}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted" aria-hidden="true">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(item.percentage, 2)}%` }} />
                </div>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
