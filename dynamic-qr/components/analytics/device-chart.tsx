'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Smartphone } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/empty-state';
import { formatNumber, formatPercentage } from '@/lib/utils';
import type { DeviceStat, DeviceType } from '@/types/database';

const COLORS: Record<DeviceType, string> = {
  mobile: 'hsl(var(--chart-1))',
  tablet: 'hsl(var(--chart-2))',
  desktop: 'hsl(var(--chart-3))',
  unknown: 'hsl(var(--muted-foreground))',
};

const LABELS: Record<DeviceType, string> = {
  mobile: 'Mobile',
  tablet: 'Tablet',
  desktop: 'Desktop',
  unknown: 'Unknown',
};

export function DeviceChart({ data }: { data: DeviceStat[] }) {
  const total = data.reduce((sum, item) => sum + item.scans, 0);
  const slices = data.filter((item) => item.scans > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Devices</CardTitle>
        <CardDescription>Device type detected from the scanner’s browser.</CardDescription>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <EmptyState icon={Smartphone} title="No scans yet" description="Share your QR code to start collecting analytics." />
        ) : (
          <div className="flex flex-col items-center gap-6 sm:flex-row">
            <div className="relative h-48 w-48 shrink-0" role="img" aria-label="Donut chart of scans by device type">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={slices} dataKey="scans" nameKey="device" innerRadius={58} outerRadius={88} paddingAngle={2} stroke="none">
                    {slices.map((item) => <Cell key={item.device} fill={COLORS[item.device]} />)}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 12, color: 'hsl(var(--popover-foreground))', fontSize: 12 }}
                    formatter={(value: number, _name: string, entry) => [value, LABELS[(entry.payload as DeviceStat).device]]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
                <div>
                  <p className="text-2xl font-semibold tabular-nums">{formatNumber(total)}</p>
                  <p className="text-xs text-muted-foreground">scans</p>
                </div>
              </div>
            </div>
            <ul className="w-full space-y-2">
              {data.map((item) => (
                <li key={item.device} className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[item.device] }} aria-hidden="true" />
                    {LABELS[item.device]}
                  </span>
                  <span className="tabular-nums text-muted-foreground">
                    {formatNumber(item.scans)} · {formatPercentage(item.percentage)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
