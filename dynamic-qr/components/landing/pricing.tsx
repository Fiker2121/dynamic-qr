import Link from 'next/link';
import { Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PLANS } from '@/lib/plans';
import { cn } from '@/lib/utils';

export function Pricing() {
  return (
    <section id="pricing" className="container py-16 sm:py-24">
      <div className="mx-auto max-w-2xl space-y-3 text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Simple pricing</h2>
        <p className="text-muted-foreground">Start free. Billing isn’t connected yet, so every account starts on the Free plan.</p>
      </div>
      <div className="mx-auto mt-10 grid max-w-4xl gap-6 md:grid-cols-2">
        {PLANS.map((plan) => (
          <div key={plan.id} className={cn('flex flex-col rounded-3xl border p-7', plan.highlighted ? 'border-primary bg-primary/10 shadow-xl shadow-primary/10' : 'bg-card')}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{plan.name}</h3>
              {plan.highlighted && <Badge>Most complete</Badge>}
            </div>
            <p className="mt-4 flex items-baseline gap-1">
              <span className="text-4xl font-bold tracking-tight">${plan.price}</span>
              <span className="text-sm text-muted-foreground">/ month</span>
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
            <ul className="mt-6 flex-1 space-y-3">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2.5 text-sm">
                  <Check className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button asChild size="lg" variant={plan.highlighted ? 'default' : 'outline'} className="mt-8">
              <Link href="/signup">Get started</Link>
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}
