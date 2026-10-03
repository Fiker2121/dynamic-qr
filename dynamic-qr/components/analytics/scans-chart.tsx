'use client';

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { BarChart3 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/empty-state';
import type { TimeSeriesPoint } from '@/types/database';

function formatDay(value: string, long = false): string {
  const date = new Date(`${value}T00:00:00.000Z`);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    ...(long ? { year: 'numeric' } : {}),
    timeZone: 'UTC',
  });
}

export function ScansChart({ data, description }: { data: TimeSeriesPoint[]; description?: string }) {
  const hasScans = data.some((point) => point.scans > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scans Over Time</CardTitle>
        <CardDescription>{description ?? 'Scans per day. Days are in UTC.'}</CardDescription>
      </CardHeader>
      <CardContent>
        {hasScans ? (
          <div className="h-64 w-full sm:h-72" role="img" aria-label="Line chart of scans per day">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tickFormatter={(v: string) => formatDay(v)} stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} minTickGap={28} />
                <YAxis allowDecimals={false} stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ stroke: 'hsl(var(--border))' }}
                  contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 12, color: 'hsl(var(--popover-foreground))', fontSize: 12 }}
                  labelFormatter={(v: string) => formatDay(v, true)}
                  formatter={(value: number) => [value, 'Scans']}
                />
                <Line type="monotone" dataKey="scans" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyState icon={BarChart3} title="No scans yet" description="Share your QR code to start collecting analytics." />
        )}
      </CardContent>
    </Card>
  );
}
