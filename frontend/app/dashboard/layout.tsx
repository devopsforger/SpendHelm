'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/hooks/use-auth';
import { navItems, publicPages } from '@/lib/data/navigation';
import Sidebar from '@/components/dashboard/sidebar';
import MobileHeader from '@/components/dashboard/mobile-header';
import MobileMenu from '@/components/dashboard/mobile-menu';
import LoadingSpinner from '@/components/dashboard/loading-spinner';
import { DashboardLayoutProps } from '@/lib/types/dashboard';

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const currentPageName = getPageNameFromPath(pathname);

  const { user, loading, logout, isAuthenticated } = useAuth(true);

  // Get current page name from path
  function getPageNameFromPath(path: string): string {
    const segment = path.split('/').pop() || 'dashboard';
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  }

  // Check if current page is public
  const isPublicPage = publicPages.includes(pathname);

  // For public pages, don't wrap in dashboard layout
  if (isPublicPage) {
    return <>{children}</>;
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return null; // Will redirect via useAuth hook
  }

  return (
    <DashboardLayoutContent
      user={user}
      currentPageName={currentPageName}
      onLogout={logout}
    >
      {children}
    </DashboardLayoutContent>
  );
}

interface DashboardLayoutContentProps {
  children: React.ReactNode;
  user: any;
  currentPageName: string;
  onLogout: () => void;
}

function DashboardLayoutContent({
  children,
  user,
  currentPageName,
  onLogout
}: DashboardLayoutContentProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar user={user} currentPageName={currentPageName} onLogout={onLogout} />
      <MobileHeader />
      <MobileMenu
        user={user}
        currentPageName={currentPageName}
        onLogout={onLogout}
      />

      {/* Main Content */}
      <main className="lg:pl-64 pt-14 lg:pt-0 min-h-screen">
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}