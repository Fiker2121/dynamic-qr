import type { Metadata } from 'next';
import { PageHeader } from '@/components/dashboard/page-header';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/dashboard/theme-toggle';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'Settings' };
export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <PageHeader title="Settings" description="Your account and appearance." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>The email you sign in with.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="font-medium">{user?.email}</p>
            <p className="flex items-center gap-2 text-muted-foreground">
              Plan <Badge variant="secondary">Free</Badge>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Switch between dark and light themes.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between text-sm">
            Theme
            <ThemeToggle />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
