'use client';

import { useId } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ColorFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function ColorField({ label, value, onChange, error }: ColorFieldProps) {
  const id = useId();
  const isValid = /^#[0-9a-fA-F]{6}$/.test(value);

  return (
    <div className="space-y-2">
      <Label htmlFor={`${id}-hex`}>{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          aria-label={`${label} color picker`}
          value={isValid ? value : '#000000'}
          onChange={(event) => onChange(event.target.value)}
          className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border border-input bg-background p-1"
        />
        <Input
          id={`${id}-hex`}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          maxLength={7}
          spellCheck={false}
          autoComplete="off"
          className="font-mono"
          aria-invalid={!isValid || Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
        />
      </div>
      {(error || !isValid) && (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error ?? 'Use a 6-digit hex color such as #1a2b3c.'}
        </p>
      )}
    </div>
  );
}
