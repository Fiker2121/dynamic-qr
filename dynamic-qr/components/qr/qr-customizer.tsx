'use client';

import { useId } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ColorField } from '@/components/qr/color-field';
import { LogoUpload } from '@/components/qr/logo-upload';
import {
  CORNER_DOT_TYPES,
  CORNER_SQUARE_TYPES,
  DEFAULT_QR_STYLE,
  DOT_TYPES,
  ERROR_CORRECTION_LEVELS,
  QR_MARGIN_MAX,
  QR_SIZE_MAX,
  QR_SIZE_MIN,
} from '@/lib/qr/config';
import { contrastRatio } from '@/lib/qr/contrast';
import type {
  CornerDotType,
  CornerSquareType,
  DotType,
  ErrorCorrectionLevel,
  QRStyleConfig,
} from '@/types/database';

interface QrCustomizerProps {
  style: QRStyleConfig;
  onChange: (style: QRStyleConfig) => void;
  errors?: Record<string, string>;
}

export function QrCustomizer({ style, onChange, errors = {} }: QrCustomizerProps) {
  const id = useId();
  const update = <K extends keyof QRStyleConfig>(key: K, value: QRStyleConfig[K]) =>
    onChange({ ...style, [key]: value });
  const lowContrast = contrastRatio(style.foregroundColor, style.backgroundColor) < 3;

  return (
    <div className="space-y-4">
      <Tabs defaultValue="colors">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="colors">Colors</TabsTrigger>
          <TabsTrigger value="shapes">Shapes</TabsTrigger>
          <TabsTrigger value="logo">Logo</TabsTrigger>
          <TabsTrigger value="size">Size</TabsTrigger>
        </TabsList>

        <TabsContent value="colors" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <ColorField label="Foreground" value={style.foregroundColor} onChange={(v) => update('foregroundColor', v)} error={errors.foreground_color} />
            <ColorField label="Background" value={style.backgroundColor} onChange={(v) => update('backgroundColor', v)} error={errors.background_color} />
          </div>
          {lowContrast && (
            <p role="status" className="flex items-start gap-2 rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
              Low contrast. Scanners may not read this code. Use a dark foreground on a light background.
            </p>
          )}
        </TabsContent>

        <TabsContent value="shapes" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`${id}-dots`}>Dot style</Label>
            <Select value={style.dotType} onValueChange={(v) => update('dotType', v as DotType)}>
              <SelectTrigger id={`${id}-dots`}><SelectValue /></SelectTrigger>
              <SelectContent>
                {DOT_TYPES.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`${id}-corner-square`}>Corner frame</Label>
              <Select value={style.cornerSquareType} onValueChange={(v) => update('cornerSquareType', v as CornerSquareType)}>
                <SelectTrigger id={`${id}-corner-square`}><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CORNER_SQUARE_TYPES.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${id}-corner-dot`}>Corner dot</Label>
              <Select value={style.cornerDotType} onValueChange={(v) => update('cornerDotType', v as CornerDotType)}>
                <SelectTrigger id={`${id}-corner-dot`}><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CORNER_DOT_TYPES.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="logo" className="space-y-3">
          <LogoUpload value={style.logoData} onChange={(v) => update('logoData', v)} error={errors.logo_data} />
          {style.logoData && (
            <p className="text-xs text-muted-foreground">
              With a logo, the code uses the highest error correction so it stays scannable.
            </p>
          )}
        </TabsContent>

        <TabsContent value="size" className="space-y-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor={`${id}-size`}>Download size</Label>
              <span className="text-sm text-muted-foreground">{style.size} px</span>
            </div>
            <input id={`${id}-size`} type="range" min={QR_SIZE_MIN} max={QR_SIZE_MAX} step={8} value={style.size}
              onChange={(e) => update('size', Number(e.target.value))} className="w-full accent-[hsl(var(--primary))]" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor={`${id}-margin`}>Margin</Label>
              <span className="text-sm text-muted-foreground">{style.margin} px</span>
            </div>
            <input id={`${id}-margin`} type="range" min={0} max={QR_MARGIN_MAX} step={2} value={style.margin}
              onChange={(e) => update('margin', Number(e.target.value))} className="w-full accent-[hsl(var(--primary))]" />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${id}-ec`}>Error correction</Label>
            <Select value={style.errorCorrection} onValueChange={(v) => update('errorCorrection', v as ErrorCorrectionLevel)}>
              <SelectTrigger id={`${id}-ec`}><SelectValue /></SelectTrigger>
              <SelectContent>
                {ERROR_CORRECTION_LEVELS.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Higher levels survive more damage but make the pattern denser.</p>
          </div>
        </TabsContent>
      </Tabs>

      <Button type="button" variant="ghost" size="sm" onClick={() => onChange({ ...DEFAULT_QR_STYLE })}>
        <RotateCcw />
        Reset design
      </Button>
    </div>
  );
}
