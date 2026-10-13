import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { AuthError, requireAdmin } from '@/lib/auth/server';
import Dashboard from './dashboard';

async function ProtectedDashboard() {
  try { await requireAdmin(); }
  catch (error) {
    if (error instanceof AuthError && error.status === 401) redirect('/admin/login');
    if (error instanceof AuthError && error.status === 403) redirect('/account/login?error=admin&next=/admin');
    throw error;
  }
  return <Dashboard />;
}
export default function AdminPage() {
  return <Suspense fallback={<div className="storefront" role="status">Checking administrator access…</div>}><ProtectedDashboard /></Suspense>;
}
