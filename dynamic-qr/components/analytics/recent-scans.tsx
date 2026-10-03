import Link from 'next/link';
import { ScanLine } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EmptyState } from '@/components/empty-state';
import { LocalDate } from '@/components/local-date';
import { countryFlag, countryName } from '@/lib/qr/location';
import type { RecentScan } from '@/types/database';

interface RecentScansProps {
  scans: RecentScan[];
  showQrName?: boolean;
}

export function RecentScans({ scans, showQrName = true }: RecentScansProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Scans</CardTitle>
        <CardDescription>The latest scans, shown in your local time.</CardDescription>
      </CardHeader>
      <CardContent>
        {scans.length === 0 ? (
          <EmptyState icon={ScanLine} title="No scans yet" description="Share your QR code to start collecting analytics." />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                {showQrName && <TableHead>QR code</TableHead>}
                <TableHead>Location</TableHead>
                <TableHead>Device</TableHead>
                <TableHead>Browser</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scans.map((scan) => (
                <TableRow key={scan.id}>
                  <TableCell className="whitespace-nowrap"><LocalDate iso={scan.scanned_at} withTime /></TableCell>
                  {showQrName && (
                    <TableCell className="max-w-[10rem] truncate">
                      {scan.qr_codes ? (
                        <Link href={`/dashboard/qr-codes/${scan.qr_code_id}`} className="hover:underline">{scan.qr_codes.name}</Link>
                      ) : '—'}
                    </TableCell>
                  )}
                  <TableCell className="whitespace-nowrap">
                    <span aria-hidden="true">{countryFlag(scan.country)} </span>{countryName(scan.country)}
                  </TableCell>
                  <TableCell><Badge variant="secondary" className="capitalize">{scan.device_type}</Badge></TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">{scan.browser ?? '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
