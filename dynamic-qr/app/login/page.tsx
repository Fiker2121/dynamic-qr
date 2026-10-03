import type { Metadata } from 'next';
import { Brand } from '@/components/dashboard/brand';
import { AuthForm } from '@/components/auth/auth-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = { title: 'Sign in' };

export default function LoginPage({ searchParams }: { searchParams: { next?: string; error?: string } }) {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex justify-center"><Brand /></div>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Sign in</CardTitle>
            <CardDescription>Welcome back. Pick up where you left off.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {searchParams.error === 'confirmation' && (
              <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm">
                That confirmation link is invalid or expired. Sign up again to get a new one.
              </p>
            )}
            <AuthForm mode="login" next={searchParams.next} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
