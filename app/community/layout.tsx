import './community.css';
import { MemberPanel } from '../../components/community/MemberPanel';
export default function Layout({children}: {children: React.ReactNode}) { return <><div className="community-shell community-account-shell"><MemberPanel /></div>{children}</>; }

