// Auth utilities for Zander

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('zander_token');
}

export function getUser(): any | null {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem('zander_user');
  return user ? JSON.parse(user) : null;
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function logout(): void {
  localStorage.removeItem('zander_token');
  localStorage.removeItem('zander_user');
  window.location.href = '/login';
}

export function requireAuth(): boolean {
  if (typeof window === 'undefined') return true;
  
  if (!isAuthenticated()) {
    window.location.href = '/login';
    return false;
  }
  return true;
}
