'use client';
import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { usePathname } from 'next/navigation';

export type Executive = 'jordan' | 'don' | 'pam' | 'ben' | 'miranda' | 'ted' | 'jarvis' | 'zander';
export type PanelState = 'hidden' | 'open' | 'fullscreen';

export interface ExecutiveInfo {
  id: Executive;
  name: string;
  role: string;
  fullTitle: string;
  color: string;
  status: 'active' | 'upgrade' | 'coming_soon';
  requiredPlan?: 'starter' | 'pro' | 'business' | 'enterprise';
  apiRoute: string;
}

export const EXECUTIVES: ExecutiveInfo[] = [
  { id: 'jordan', name: 'Jordan', role: 'CRO', fullTitle: 'Chief Revenue Officer', color: '#00CCEE', status: 'active', requiredPlan: 'starter', apiRoute: '/api/cro/jordan' },
  { id: 'don', name: 'Don', role: 'CMO', fullTitle: 'Chief Marketing Officer', color: '#F57C00', status: 'active', requiredPlan: 'pro', apiRoute: '/api/cmo/don' },
  { id: 'pam', name: 'Pam', role: 'EA', fullTitle: 'Executive Assistant', color: '#C2185B', status: 'active', requiredPlan: 'starter', apiRoute: '/api/ea/pam' },
  { id: 'ben', name: 'Ben', role: 'CFO', fullTitle: 'Chief Financial Officer', color: '#2E7D32', status: 'coming_soon', apiRoute: '' },
  { id: 'miranda', name: 'Miranda', role: 'COO', fullTitle: 'Chief Operations Officer', color: '#5E35B1', status: 'coming_soon', apiRoute: '' },
  { id: 'ted', name: 'Ted', role: 'CPO', fullTitle: 'Chief People Officer', color: '#0288D1', status: 'coming_soon', apiRoute: '' },
  { id: 'jarvis', name: 'Jarvis', role: 'CIO', fullTitle: 'Chief Information Officer', color: '#455A64', status: 'coming_soon', apiRoute: '' },
];

// Zander - superadmin only
export const ZANDER: ExecutiveInfo = {
  id: 'zander',
  name: 'Zander',
  role: 'CEO',
  fullTitle: 'Platform AI',
  color: '#00CCEE',
  status: 'active',
  apiRoute: '/api/admin/zander',
};

// TODO: Unify PEP and executive page chat conversations to share the same thread per executive per tenant.
// Currently PEP uses sessionStorage (pep_chat_{executive}) while executive pages (/ai, /cmo/ai, /ea)
// use their own local state. These should share the same conversation thread so users see
// continuity whether they access an executive via the floating PEP button or the dedicated page.

// Module to executive mapping
// Order matters - more specific paths should come first
const MODULE_EXECUTIVE_MAP: [string, Executive][] = [
  // Jordan (CRO) - Sales & Revenue modules
  ['/ai', 'jordan'],           // Jordan's main chat page
  ['/cro', 'jordan'],          // CRO module
  ['/projects', 'jordan'],     // Projects/Deals
  ['/people', 'jordan'],       // People/Contacts
  ['/products', 'jordan'],     // Products
  ['/production', 'jordan'],   // Production dashboard
  ['/deals', 'jordan'],        // Deal details

  // Don (CMO) - Marketing module
  ['/cmo', 'don'],             // All CMO pages including /cmo/ai

  // Pam (EA) - Process & Admin
  ['/ea', 'pam'],              // Pam's main page
  ['/headquarters', 'pam'],    // HQ - Pam owns this
  ['/communication', 'pam'],   // Communication
  ['/schedule', 'pam'],        // Schedule
  ['/forms', 'pam'],           // Forms

  // Zander - Platform admin (superadmin only)
  ['/admin', 'zander'],        // Admin pages
];

interface PEPContextValue {
  // Panel state
  panelState: PanelState;
  openPanel: () => void;
  closePanel: () => void;
  togglePanel: () => void;
  enterFullscreen: () => void;
  exitFullscreen: () => void;

  // Active executive
  activeExecutive: Executive;
  setActiveExecutive: (exec: Executive) => void;
  isManualOverride: boolean;

  // Executive info helpers
  getExecutiveInfo: (id: Executive) => ExecutiveInfo | undefined;
  getAvailableExecutives: (userPlan: string, isSuperAdmin: boolean) => ExecutiveInfo[];
}

const PEPContext = createContext<PEPContextValue | undefined>(undefined);

export function PEPProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [panelState, setPanelState] = useState<PanelState>('hidden');
  const [activeExecutive, setActiveExecutiveState] = useState<Executive>('pam');
  const [isManualOverride, setIsManualOverride] = useState(false);
  const [lastAutoModule, setLastAutoModule] = useState<string>('');

  // Auto-select executive based on current module
  useEffect(() => {
    if (!pathname) return;

    // Find matching module (use array to maintain order)
    let matchedExec: Executive | null = null;
    let matchedPath: string = '';
    for (const [path, exec] of MODULE_EXECUTIVE_MAP) {
      if (pathname.startsWith(path)) {
        matchedExec = exec;
        matchedPath = path;
        break;
      }
    }

    // If no match, default to Pam
    if (!matchedExec) {
      matchedExec = 'pam';
      matchedPath = 'default';
    }

    // Only auto-switch if not manually overridden, or if navigating to a new module
    if (!isManualOverride || matchedPath !== lastAutoModule) {
      setActiveExecutiveState(matchedExec);
      setIsManualOverride(false);
      setLastAutoModule(matchedPath);
    }
  }, [pathname, isManualOverride, lastAutoModule]);

  // Panel state management
  const openPanel = useCallback(() => setPanelState('open'), []);
  const closePanel = useCallback(() => setPanelState('hidden'), []);
  const togglePanel = useCallback(() => {
    setPanelState(prev => prev === 'hidden' ? 'open' : 'hidden');
  }, []);
  const enterFullscreen = useCallback(() => setPanelState('fullscreen'), []);
  const exitFullscreen = useCallback(() => setPanelState('open'), []);

  // Manual executive selection
  const setActiveExecutive = useCallback((exec: Executive) => {
    setActiveExecutiveState(exec);
    setIsManualOverride(true);
  }, []);

  // Get executive info
  const getExecutiveInfo = useCallback((id: Executive): ExecutiveInfo | undefined => {
    if (id === 'zander') return ZANDER;
    return EXECUTIVES.find(e => e.id === id);
  }, []);

  // Get available executives based on plan
  const getAvailableExecutives = useCallback((userPlan: string, isSuperAdmin: boolean): ExecutiveInfo[] => {
    const planHierarchy = ['starter', 'pro', 'business', 'enterprise'];

    // Normalize plan names - handle various API formats
    // API may return: 'professional', 'Professional', 'PROFESSIONAL', 'pro', 'PRO', etc.
    let normalizedPlan = userPlan?.toLowerCase()?.trim() || '';
    if (normalizedPlan === 'professional') normalizedPlan = 'pro';

    // Any logged-in user gets at least 'pro' access (Jordan, Don, Pam all active)
    // Only gate higher tiers (business, enterprise) for actual plan checks
    const userPlanIndex = planHierarchy.indexOf(normalizedPlan);
    // Default to 'pro' (index 1) if plan is unknown, empty, or 'starter'
    // This ensures all core executives are accessible to any logged-in user
    const effectivePlanIndex = userPlanIndex >= 1 ? userPlanIndex : 1;

    const available = EXECUTIVES.map(exec => {
      if (exec.status === 'coming_soon') {
        return exec;
      }

      const requiredPlanIndex = planHierarchy.indexOf(exec.requiredPlan || 'starter');
      const hasAccess = effectivePlanIndex >= requiredPlanIndex;

      return {
        ...exec,
        status: hasAccess ? 'active' : 'upgrade',
      } as ExecutiveInfo;
    });

    // Add Zander for superadmins only
    if (isSuperAdmin) {
      available.push(ZANDER);
    }

    return available;
  }, []);

  // Handle escape key for fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && panelState === 'fullscreen') {
        exitFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [panelState, exitFullscreen]);

  return (
    <PEPContext.Provider value={{
      panelState,
      openPanel,
      closePanel,
      togglePanel,
      enterFullscreen,
      exitFullscreen,
      activeExecutive,
      setActiveExecutive,
      isManualOverride,
      getExecutiveInfo,
      getAvailableExecutives,
    }}>
      {children}
    </PEPContext.Provider>
  );
}

export function usePEP() {
  const context = useContext(PEPContext);
  if (!context) {
    throw new Error('usePEP must be used within a PEPProvider');
  }
  return context;
}
