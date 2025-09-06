// Simple authentication utilities that work in any serverless environment
// Using built-in Node.js crypto instead of external dependencies

import crypto from 'crypto'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export interface User {
  id: number
  email: string
  name?: string
  created_at: string
}

export interface JWTPayload {
  userId: number
  email: string
}

// Simple password hashing using built-in crypto
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex')
  return `${salt}:${hash}`
}

// Simple password verification using built-in crypto
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  try {
    const [salt, hash] = storedHash.split(':')
    const verifyHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex')
    return hash === verifyHash
  } catch {
    return false
  }
}

// Simple JWT generation using built-in crypto (no external dependencies)
export function generateToken(payload: JWTPayload): string {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  }
  
  const now = Math.floor(Date.now() / 1000)
  const jwtPayload = {
    ...payload,
    iat: now,
    exp: now + (7 * 24 * 60 * 60) // 7 days
  }
  
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url')
  const encodedPayload = Buffer.from(JSON.stringify(jwtPayload)).toString('base64url')
  
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url')
  
  return `${encodedHeader}.${encodedPayload}.${signature}`
}

// Simple JWT verification using built-in crypto
export function verifyToken(token: string): JWTPayload | null {
  try {
    const [encodedHeader, encodedPayload, signature] = token.split('.')
    
    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64url')
    
    if (signature !== expectedSignature) {
      return null
    }
    
    // Decode payload
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString())
    
    // Check expiration
    const now = Math.floor(Date.now() / 1000)
    if (payload.exp && payload.exp < now) {
      return null
    }
    
    return {
      userId: payload.userId,
      email: payload.email
    }
  } catch {
    return null
  }
}

export function extractTokenFromRequest(request: Request): string | null {
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  
  // Also check cookies for browser-based auth
  const cookieHeader = request.headers.get('cookie')
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=')
      acc[key] = value
      return acc
    }, {} as Record<string, string>)
    
    return cookies.auth_token || null
  }
  
  return null
}

export function getUserFromRequest(request: Request): JWTPayload | null {
  const token = extractTokenFromRequest(request)
  if (!token) return null
  
  return verifyToken(token)
}
