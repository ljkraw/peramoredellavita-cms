import { cookies } from 'next/headers';
import { createHmac, timingSafeEqual } from 'crypto';
import { prisma } from './db';

export interface AdminSession {
  id: string;
  email: string;
  username: string;
  role: string;
}

const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds
const SESSION_SECRET =
  process.env.ADMIN_SESSION_SECRET ||
  (process.env.NODE_ENV !== 'production'
    ? 'dev-session-secret-min-32-znakow-dla-localhost'
    : undefined);

if (!SESSION_SECRET || SESSION_SECRET.length < 32) {
  console.warn(
    '[AUTH] ADMIN_SESSION_SECRET is not set or too short (min. 32 characters).'
  );
}

/**
 * Create HMAC-signed session token
 * Format: adminId:timestamp:signature
 */
export function createAdminSessionToken(adminId: string): string {
  if (!SESSION_SECRET) {
    throw new Error('ADMIN_SESSION_SECRET is not configured');
  }

  const timestamp = Date.now().toString();
  const payload = `${adminId}:${timestamp}`;
  
  const hmac = createHmac('sha256', SESSION_SECRET);
  hmac.update(payload);
  const signature = hmac.digest('hex');
  
  const token = `${payload}:${signature}`;
  return Buffer.from(token).toString('base64');
}

/**
 * Verify and parse session token
 * Returns null if token is invalid or expired
 */
function verifyAdminSessionToken(token: string): { adminId: string; timestamp: number } | null {
  if (!SESSION_SECRET) {
    return null;
  }

  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const parts = decoded.split(':');

    if (parts.length !== 3) {
      return null;
    }

    const [adminId, timestamp, signature] = parts;
    
    // Verify signature
    const payload = `${adminId}:${timestamp}`;
    const hmac = createHmac('sha256', SESSION_SECRET);
    hmac.update(payload);
    const expectedSignature = hmac.digest('hex');
    
    // Use timing-safe comparison
    if (signature.length !== expectedSignature.length) {
      return null;
    }
    
    const signatureBuffer = Buffer.from(signature, 'hex');
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');
    
    if (!timingSafeEqual(signatureBuffer, expectedBuffer)) {
      console.warn('[AUTH] Invalid token signature');
      return null;
    }
    
    // Check expiration
    const tokenTimestamp = parseInt(timestamp, 10);
    if (isNaN(tokenTimestamp)) {
      return null;
    }
    
    const now = Date.now();
    const age = (now - tokenTimestamp) / 1000;
    
    if (age < 0 || age > SESSION_MAX_AGE) {
      console.warn('[AUTH] Token expired');
      return null;
    }
    
    return { adminId, timestamp: tokenTimestamp };
  } catch {
    return null;
  }
}

/**
 * Get admin session from cookies
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('admin_session')?.value;

    if (!sessionToken) {
      return null;
    }

    const verified = verifyAdminSessionToken(sessionToken);
    
    if (!verified) {
      return null;
    }

    const { adminId } = verified;

    // Fetch admin from database
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        isActive: true,
      },
    });

    if (!admin || !admin.isActive) {
      return null;
    }

    return {
      id: admin.id,
      email: admin.email,
      username: admin.username,
      role: admin.role,
    };
  } catch (error) {
    console.error('Error checking admin session:', error);
    return null;
  }
}

/**
 * Require logged-in admin; throws if no session
 */
export async function requireAdmin(): Promise<AdminSession> {
  const admin = await getAdminSession();
  if (!admin) {
    const error = new Error('Unauthorized') as Error & { status: number };
    error.status = 401;
    throw error;
  }
  return admin;
}

/**
 * Require admin role (not just editor)
 */
export async function requireAdminRole(): Promise<AdminSession> {
  const admin = await requireAdmin();
  if (admin.role !== 'admin') {
    const error = new Error('Forbidden') as Error & { status: number };
    error.status = 403;
    throw error;
  }
  return admin;
}

/**
 * Require developer role
 */
export async function requireDeveloper(): Promise<AdminSession> {
  const admin = await requireAdmin();
  if (admin.role !== 'developer') {
    const error = new Error('Forbidden - tylko rola Developer') as Error & { status: number };
    error.status = 403;
    throw error;
  }
  return admin;
}

/**
 * Set session cookie
 */
export async function setSessionCookie(adminId: string): Promise<void> {
  const token = createAdminSessionToken(adminId);
  const cookieStore = await cookies();
  
  // In development: use sameSite: 'lax' (works for localhost across ports)
  // In production: use sameSite: 'lax' and secure: true
  const isSecure = process.env.NODE_ENV === 'production' && process.env.FORCE_SECURE_COOKIES === 'true';
  
  cookieStore.set('admin_session', token, {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });
}

/**
 * Clear session cookie
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('admin_session');
}
