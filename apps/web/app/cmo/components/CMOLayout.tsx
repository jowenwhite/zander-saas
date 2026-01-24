'use client';
import { ReactNode } from 'react';
import NavBar from '../../components/NavBar';
import AuthGuard from '../../components/AuthGuard';
import CMOSidebar from './CMOSidebar';

interface CMOLayoutProps {
  children: ReactNode;
}

export default function CMOLayout({ children }: CMOLayoutProps) {
  return (
    <AuthGuard>
      <div style={{ minHeight: '100vh', background: 'var(--zander-off-white)' }}>
        <NavBar activeModule="cmo" />
        <CMOSidebar />
        <main style={{
          marginLeft: '240px',
          marginTop: '64px',
          padding: '2rem',
          transition: 'margin-left 0.3s ease'
        }}>
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
