'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface QrDetailTabsProps {
  settings: React.ReactNode;
  analytics: React.ReactNode;
}

export function QrDetailTabs({ settings, analytics }: QrDetailTabsProps) {
  return (
    <Tabs defaultValue="settings">
      <TabsList>
        <TabsTrigger value="settings">Settings</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
      </TabsList>
      <TabsContent value="settings" className="mt-6">{settings}</TabsContent>
      <TabsContent value="analytics" className="mt-6">{analytics}</TabsContent>
    </Tabs>
  );
}
