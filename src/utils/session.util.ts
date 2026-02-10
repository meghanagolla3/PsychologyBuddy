import { nanoid } from "nanoid";

// ===========================================
// SESSION STORE (Dev: In-memory, Prod: Replace with Redis)
// ===========================================
declare global {
  var sessionStore: Map<string, any> | undefined;
}

const sessionStore = global.sessionStore || new Map();
if (!global.sessionStore) global.sessionStore = sessionStore;

// TTL = 7 days
const SESSION_TTL = 1000 * 60 * 60 * 24 * 7;

export const SessionUtil = {
  generateSessionId: () => nanoid(),
  
  getExpirationTime: () => {
    return new Date(Date.now() + SESSION_TTL);
  },
  
  isExpired: (expiresAt: Date) => {
    return new Date() > expiresAt;
  }
};

// ===========================================
// CLIENT-SIDE SESSION HELPERS
// ===========================================

// Get session from cookies (client-side)
export function getClientSession() {
  if (typeof window === 'undefined') return null;
  
  const sessionId = document.cookie
    .split('; ')
    .find(row => row.startsWith('sessionId='))
    ?.split('=')[1];
    
  return sessionId ? sessionStore.get(sessionId) : null;
}

// Check if user is authenticated (client-side)
export function isClientAuthenticated() {
  const session = getClientSession();
  return session && !SessionUtil.isExpired(session.expiresAt);
}

// ===========================================
// SERVER-SIDE SESSION HELPERS (Server Components only)
// ===========================================

// Create session (server-side)
export async function createSession(userId: string, roleId: string) {
  const sessionId = nanoid();
  const sessionData = {
    userId,
    roleId,
    createdAt: new Date(),
    expiresAt: SessionUtil.getExpirationTime()
  };

  // Store in memory (replace with Redis in production)
  sessionStore.set(sessionId, sessionData);

  // Set cookie
  const cookieString = `sessionId=${sessionId}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_TTL / 1000}`;
  
  return {
    sessionId,
    cookie: cookieString,
    sessionData
  };
}

// Get session from cookies (server-side)
export async function getServerSession() {
  try {
    // Dynamic import to avoid client-side errors
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('sessionId')?.value;
    
    if (!sessionId) return null;
    
    const session = sessionStore.get(sessionId);
    if (!session) return null;
    
    if (SessionUtil.isExpired(session.expiresAt)) {
      sessionStore.delete(sessionId);
      await cookieStore.delete('sessionId');
      return null;
    }
    
    return session;
  } catch (error) {
    console.error('Error getting server session:', error);
    return null;
  }
}

// Delete session (server-side)
export async function deleteSession(sessionId: string) {
  sessionStore.delete(sessionId);
  
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    await cookieStore.delete('sessionId');
  } catch (error) {
    console.error('Error deleting session:', error);
  }
}
