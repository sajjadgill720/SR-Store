'use client';
import { MemberPanel } from './MemberPanel';

export function CommunityFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="storefront community-workspace">
      <MemberPanel />
      {children}
    </div>
  );
}
