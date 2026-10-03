'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BarChart3, Download, Loader2, Pencil, Plus, QrCode, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { EmptyState } from '@/components/empty-state';
import { LocalDate } from '@/components/local-date';
import { QRCodePreview } from '@/components/qr/qr-code-preview';
import { usePublicBaseUrl } from '@/components/qr/use-public-url';
import { downloadQrCode, type DownloadFormat } from '@/lib/qr/download';
import { buildPublicUrl } from '@/lib/qr/public-url';
import { rowToStyle } from '@/lib/qr/style';
import { formatNumber, slugify } from '@/lib/utils';
import type { ApiErrorBody, QRCodeRow } from '@/types/database';

export interface QrListItem {
  qr: QRCodeRow;
  scans: number;
}

export function QrList({ items }: { items: QrListItem[] }) {
  const router = useRouter();
  const baseUrl = usePublicBaseUrl();
  const [query, setQuery] = useState('');
  const [toDelete, setToDelete] = useState<QRCodeRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return items;
    return items.filter(({ qr }) =>
      [qr.name, qr.code, qr.destination_url].some((value) => value.toLowerCase().includes(term)),
    );
  }, [items, query]);

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      const response = await fetch(`/api/qr-codes/${toDelete.id}`, { method: 'DELETE' });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as ApiErrorBody | null;
        toast.error(body?.error ?? 'We couldn’t delete this QR code. Try again.');
        return;
      }
      toast.success('QR code deleted');
      setToDelete(null);
      router.refresh();
    } catch {
      toast.error('We couldn’t reach the server. Try again.');
    } finally {
      setDeleting(false);
    }
  }

  async function handleDownload(qr: QRCodeRow, format: DownloadFormat) {
    if (!baseUrl) return;
    try {
      await downloadQrCode({
        data: buildPublicUrl(qr.code, baseUrl),
        style: rowToStyle(qr),
        format,
        fileName: `${slugify(qr.name)}-${qr.code}`,
      });
      toast.success(`${format.toUpperCase()} download started`);
    } catch (error) {
      console.error('QR download failed', error);
      toast.error('We couldn’t create that file. Try again.');
    }
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={QrCode}
        title="No QR codes yet"
        description="Create your first dynamic QR code. You can change where it points at any time."
        action={
          <Button asChild>
            <Link href="/dashboard/qr-codes/new"><Plus />Create QR code</Link>
          </Button>
        }
      />
    );
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-4">
        <div className="relative max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name, code, or URL" className="pl-9" aria-label="Search QR codes" />
        </div>

        {filtered.length === 0 ? (
          <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            No QR codes match “{query}”.
          </p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map(({ qr, scans }) => (
              <li key={qr.id}>
                <Card className="flex h-full flex-col gap-4 p-4">
                  <div className="flex items-start gap-4">
                    <div className="shrink-0 overflow-hidden rounded-lg border">
                      <QRCodePreview data={baseUrl ? buildPublicUrl(qr.code, baseUrl) : null} style={rowToStyle(qr)} renderSize={88} label={`QR code for ${qr.name}`} />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <Link href={`/dashboard/qr-codes/${qr.id}`} className="block truncate font-medium hover:underline">{qr.name}</Link>
                      <Badge variant="secondary" className="font-mono">{qr.code}</Badge>
                      <p className="truncate text-sm text-muted-foreground" title={qr.destination_url}>{qr.destination_url}</p>
                    </div>
                  </div>

                  <dl className="mt-auto flex items-center justify-between text-sm">
                    <div>
                      <dt className="text-xs text-muted-foreground">Scans</dt>
                      <dd className="font-semibold tabular-nums">{formatNumber(scans)}</dd>
                    </div>
                    <div className="text-right">
                      <dt className="text-xs text-muted-foreground">Created</dt>
                      <dd><LocalDate iso={qr.created_at} /></dd>
                    </div>
                  </dl>

                  <div className="flex items-center gap-1 border-t pt-3">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button asChild variant="ghost" size="icon" aria-label={`Edit ${qr.name}`}>
                          <Link href={`/dashboard/qr-codes/${qr.id}`}><Pencil /></Link>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Edit</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button asChild variant="ghost" size="icon" aria-label={`View analytics for ${qr.name}`}>
                          <Link href={`/dashboard/analytics?qr=${qr.id}`}><BarChart3 /></Link>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Analytics</TooltipContent>
                    </Tooltip>
                    <DropdownMenu>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" aria-label={`Download ${qr.name}`}><Download /></Button>
                          </DropdownMenuTrigger>
                        </TooltipTrigger>
                        <TooltipContent>Download</TooltipContent>
                      </Tooltip>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem onSelect={() => handleDownload(qr, 'png')}>Download PNG</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleDownload(qr, 'svg')}>Download SVG</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="ml-auto text-destructive hover:text-destructive" onClick={() => setToDelete(qr)} aria-label={`Delete ${qr.name}`}>
                          <Trash2 />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Delete</TooltipContent>
                    </Tooltip>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Dialog open={toDelete !== null} onOpenChange={(open) => { if (!open && !deleting) setToDelete(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this QR code?</DialogTitle>
            <DialogDescription>
              “{toDelete?.name}” and all of its scan history will be deleted. Printed copies will stop working and show a “not found” page.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setToDelete(null)} disabled={deleting}>Keep QR code</Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleting}>
              {deleting && <Loader2 className="animate-spin" />}
              Delete QR code
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
