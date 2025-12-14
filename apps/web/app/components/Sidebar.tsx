'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  collapsed?: boolean;
}

export default function Sidebar({ collapsed = false }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  const salesRevenueItems = [
    { label: 'Dashboard', href: '/' },
    { label: 'Pipeline', href: '/pipeline' },
    { label: 'Contacts', href: '/contacts' },
    { label: 'Analytics', href: '/analytics' },
  ];

  const toolsItems = [
    { label: 'Email Automation', href: '/automation' },
    { label: 'Forms', href: '/forms' },
    { label: 'AI Assistant', href: '/ai' },
  ];

  const hqItems = [
    { label: 'My Campaign', href: '/headquarters/my-campaign' },
    { label: 'Headwinds', href: '/headquarters/headwinds', badge: 3 },
    { label: 'Assembly', href: '/headquarters/assembly' },
    { label: 'Quarterly Campaigns', href: '/headquarters/campaigns/quarterly' },
    { label: 'Annual Campaign', href: '/headquarters/campaigns/annual' },
    { label: 'The Ledger', href: '/headquarters/ledger' },
    { label: 'Founding Principles', href: '/headquarters/founding-principles' },
    { label: 'The Legacy', href: '/headquarters/legacy' },
  ];

  const keystones = [
    { module: 'CRO', label: 'Pipeline', value: '$139K', trend: 'up' },
    { module: 'CFO', label: 'Cash', value: '$47K', trend: 'down' },
    { module: 'COO', label: 'On-Time', value: '94%', trend: 'flat' },
    { module: 'CMO', label: 'Leads', value: '12', trend: 'up' },
    { module: 'CPO', label: 'Team', value: '4.2', trend: 'up' },
    { module: 'CIO', label: 'Uptime', value: '99%', trend: 'flat' },
    { module: 'EA', label: 'Tasks', value: '23/28', trend: 'up' },
  ];

  return (
    <aside style={{
      width: collapsed ? 64 : 260,
      background: "white",
      borderRight: "2px solid var(--zander-border-gray)",
      height: "calc(100vh - 64px)",
      position: "fixed",
      top: 64,
      left: 0,
      overflowY: "auto",
      zIndex: 900,
      display: "flex",
      flexDirection: "column"
    }}>
      <div style={{ padding: "1.5rem 1rem 1rem" }}>
        <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--zander-gray)", textTransform: "uppercase", marginBottom: "0.75rem" }}>
          Sales and Revenue
        </div>
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {salesRevenueItems.map((item) => (
            <li key={item.label} style={{ marginBottom: "0.25rem" }}>
              <a href={item.href} style={{ display: "flex", padding: "0.75rem 1rem", borderRadius: 8, textDecoration: "none", color: isActive(item.href) ? "var(--zander-red)" : "var(--zander-navy)", background: isActive(item.href) ? "rgba(191,10,48,0.1)" : "transparent", fontWeight: isActive(item.href) ? 600 : 400 }}>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div style={{ padding: "0 1rem" }}>
        <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--zander-gray)", textTransform: "uppercase", marginBottom: "0.75rem" }}>
          Tools
        </div>
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {toolsItems.map((item) => (
            <li key={item.label} style={{ marginBottom: "0.25rem" }}>
              <a href={item.href} style={{ display: "flex", padding: "0.75rem 1rem", borderRadius: 8, textDecoration: "none", color: isActive(item.href) ? "var(--zander-red)" : "var(--zander-navy)", background: isActive(item.href) ? "rgba(191,10,48,0.1)" : "transparent", fontWeight: isActive(item.href) ? 600 : 400 }}>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div style={{ flex: 1 }} />

      <div style={{ padding: "1rem", borderTop: "2px solid var(--zander-border-gray)", background: "rgba(12,35,64,0.03)" }}>
        <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--zander-navy)", textTransform: "uppercase", marginBottom: "0.75rem" }}>
          Headquarters
        </div>

        <div style={{ background: "white", borderRadius: 8, padding: "0.75rem", marginBottom: "0.75rem", border: "1px solid var(--zander-border-gray)" }}>
          <div style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--zander-gray)", marginBottom: "0.5rem" }}>Keystones</div>
          {keystones.map((k) => (
            <div key={k.module} style={{ display: "flex", justifyContent: "space-between", padding: "0.25rem 0", fontSize: "0.75rem" }}>
              <span style={{ color: "var(--zander-red)", fontWeight: 600 }}>{k.module}</span>
              <span style={{ color: "var(--zander-navy)", fontWeight: 600 }}>{k.value}</span>
            </div>
          ))}
        </div>

        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {hqItems.map((item) => (
            <li key={item.label} style={{ marginBottom: "0.125rem" }}>
              <a href={item.href} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0.75rem", borderRadius: 6, textDecoration: "none", color: isActive(item.href) ? "var(--zander-red)" : "var(--zander-navy)", background: isActive(item.href) ? "rgba(191,10,48,0.1)" : "transparent", fontSize: "0.8rem" }}>
                <span>{item.label}</span>
                {item.badge && <span style={{ background: "var(--zander-red)", color: "white", fontSize: "0.65rem", padding: "0.1rem 0.4rem", borderRadius: 10 }}>{item.badge}</span>}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
