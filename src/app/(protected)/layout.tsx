import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import React from 'react';
interface ProtectedLayoutProps {
  children: React.ReactNode;
}
export default async function ProtectedLayout({
  children,
}: ProtectedLayoutProps) {
  const supabase = await createClient();
  // 세션정보가 있는지 없는지 기다립니다.
  const { data } = await supabase.auth.getSession();
  if (!data.session) redirect('/signin');

  return <>{children}</>;
}
