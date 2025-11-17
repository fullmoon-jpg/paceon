'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

export default function MainWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  return (
    <main className={isHomePage ? '' : 'pt-14 lg:pt-16'}>
      {children}
    </main>
  );
}