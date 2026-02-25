export type ClientRole = 'GUEST' | 'CUSTOMER' | 'ADMIN';

export type ClientSession = {
  role: ClientRole;
  name: string;
  userId?: string;
};

const SESSION_KEY = 'mvp-session';

const DEFAULT_SESSION: ClientSession = {
  role: 'GUEST',
  name: 'Guest',
};

export function getClientSession(): ClientSession {
  if (typeof window === 'undefined') return DEFAULT_SESSION;

  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return DEFAULT_SESSION;
    const parsed = JSON.parse(raw) as Partial<ClientSession>;

    const role: ClientRole =
      parsed.role === 'ADMIN' || parsed.role === 'CUSTOMER' || parsed.role === 'GUEST' ? parsed.role : 'GUEST';

    const name = typeof parsed.name === 'string' && parsed.name.trim() ? parsed.name.trim() : role === 'GUEST' ? 'Guest' : 'User';
    const userId = typeof parsed.userId === 'string' && parsed.userId.trim() ? parsed.userId.trim() : undefined;

    return { role, name, userId };
  } catch {
    return DEFAULT_SESSION;
  }
}

export function getClientRole(): ClientRole {
  return getClientSession().role;
}

export function setClientSession(session: ClientSession) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function logoutToGuest() {
  setClientSession({ role: 'GUEST', name: 'Guest' });
}
