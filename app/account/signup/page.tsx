import { Suspense } from 'react';
import AuthForm from '@/components/auth/AuthForm';
export const metadata = { title: 'Create an account — Knovera' };
export default function SignupPage() {
  return <Suspense fallback={<div className="storefront">Opening account signup…</div>}><AuthForm signup /></Suspense>;
}
