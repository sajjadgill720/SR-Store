import { Suspense } from 'react';
import Confirm from './confirm';
export default function ConfirmPage() {
  return <Suspense fallback={<div className="storefront">Loading confirmation…</div>}><Confirm /></Suspense>;
}
