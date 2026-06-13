'use client';

import dynamic from 'next/dynamic';

// Admin app - loads only the admin dashboard
const AdminApp = dynamic(() => import('@/components/aden-dot/admin-app'), { ssr: false });

export default function Home() {
  return <AdminApp />;
}
