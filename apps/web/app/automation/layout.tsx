'use client';
import { AppShell } from '@/components/AppShell';
export default function AutomationLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
