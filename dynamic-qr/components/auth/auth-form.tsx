'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/browser';
import { flattenZodErrors, signInSchema, signUpSchema } from '@/lib/qr/validators';

interface AuthFormProps {
  mode: 'login' | 'signup';
  next?: string;
}

export function AuthForm({ mode, next }: AuthFormProps) {
  const router = useRouter();
  const isSignUp = mode === 'signup';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);

  const destination = next && next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});

    const parsed = (isSignUp ? signUpSchema : signInSchema).safeParse({ email, password });
    if (!parsed.success) {
      setErrors(flattenZodErrors(parsed.error));
      return;
    }

    setLoading(true);
    const supabase = createClient();

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        });
        if (error) {
          setErrors({ form: error.message });
          toast.error('We couldn’t create your account.');
          return;
        }
        if (data.session) {
          toast.success('Account created');
          router.push('/dashboard');
          router.refresh();
        } else {
          setConfirmationSent(true);
        }
        return;
      }

      const { error } = await supabase.auth.signInWithPassword(parsed.data);
      if (error) {
        setErrors({ form: 'Email or password is incorrect.' });
        toast.error('We couldn’t sign you in.');
        return;
      }
      toast.success('Signed in');
      router.push(destination);
      router.refresh();
    } catch {
      setErrors({ form: 'We couldn’t reach the server. Check your connection and try again.' });
    } finally {
      setLoading(false);
    }
  }

  if (confirmationSent) {
    return (
      <div role="status" className="space-y-3 rounded-xl border border-success/40 bg-success/10 p-5">
        <p className="flex items-center gap-2 font-medium"><CheckCircle2 className="h-5 w-5 text-success" aria-hidden="true" />Check your email</p>
        <p className="text-sm text-muted-foreground">
          We sent a confirmation link to <span className="font-medium text-foreground">{email}</span>. Open it to finish creating your account, then sign in.
        </p>
        <Button asChild variant="outline"><Link href="/login">Go to sign in</Link></Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com"
          aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'email-error' : undefined} />
        {errors.email && <p id="email-error" className="text-sm text-destructive">{errors.email}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" autoComplete={isSignUp ? 'new-password' : 'current-password'} value={password} onChange={(e) => setPassword(e.target.value)}
          aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? 'password-error' : isSignUp ? 'password-hint' : undefined} />
        {errors.password ? (
          <p id="password-error" className="text-sm text-destructive">{errors.password}</p>
        ) : isSignUp ? (
          <p id="password-hint" className="text-xs text-muted-foreground">Use at least 8 characters.</p>
        ) : null}
      </div>
      {errors.form && <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm">{errors.form}</p>}
      <Button type="submit" className="w-full" size="lg" disabled={loading}>
        {loading && <Loader2 className="animate-spin" />}
        {isSignUp ? 'Create account' : 'Sign in'}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        {isSignUp ? 'Already have an account? ' : 'New to Dynamic QR? '}
        <Link href={isSignUp ? '/login' : '/signup'} className="font-medium text-foreground underline underline-offset-4">
          {isSignUp ? 'Sign in' : 'Create an account'}
        </Link>
      </p>
    </form>
  );
}
