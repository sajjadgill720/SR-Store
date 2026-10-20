import { Suspense } from 'react';
import AuthForm from '@/components/auth/AuthForm';
export const metadata = { title: 'Sign in — Knovera' };
export default function LoginPage() {
  return <Suspense fallback={<div className="storefront">Loading sign-in…</div>}><AuthForm /></Suspense>;
}
