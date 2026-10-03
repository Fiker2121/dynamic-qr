import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';

export interface StatItem {
  label: string;
  value: string;
  description: string;
  icon: LucideIcon;
}

export function StatCards({ items }: { items: StatItem[] }) {
  return (
    <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map(({ label, value, description, icon: Icon }) => (
        <Card key={label} className="p-5">
          <div className="flex items-center justify-between">
            <dt className="text-sm text-muted-foreground">{label}</dt>
            <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </div>
          <dd className="mt-3 text-3xl font-semibold tracking-tight tabular-nums">{value}</dd>
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        </Card>
      ))}
    </dl>
  );
}
