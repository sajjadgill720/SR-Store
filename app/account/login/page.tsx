import { Suspense } from 'react';
import AuthForm from '@/components/auth/AuthForm';
export default function LoginPage() {
  return <Suspense fallback={<div className="storefront">Loading sign-in…</div>}><AuthForm /></Suspense>;
}
