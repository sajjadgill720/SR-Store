import type { Metadata } from 'next';
import AdminSignIn from './sign-in';
import './sign-in.css';

export const metadata: Metadata = {
  title: 'Admin sign in — Knovera',
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return <AdminSignIn />;
}
