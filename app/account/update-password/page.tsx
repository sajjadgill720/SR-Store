import { Suspense } from 'react';
import AuthForm from '@/components/auth/AuthForm';
export default function UpdatePasswordPage() {
  return <Suspense fallback={<div className="storefront">Loading password form…</div>}><AuthForm update /></Suspense>;
}
