import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret-key'

export interface User {
  id: number
  email: string
  name?: string
  created_at: string
}

export interface JWTPayload {
  id: number
  userId: number
  email: string
  iat?: number
  exp?: number
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return await bcrypt.hash(password, saltRounds)
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword)
}

// Generate JWT token
export function generateToken(user: User): string {
  const payload: JWTPayload = {
    id: user.id,
    userId: user.id,
    email: user.email
  }
  
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d' // Token expires in 7 days
  })
}

// Verify JWT token
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

// Extract token from Authorization header
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.substring(7) // Remove 'Bearer ' prefix
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validate password strength
export function isValidPassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters long' }
  }
  
  if (password.length > 128) {
    return { valid: false, message: 'Password must be less than 128 characters long' }
  }
  
  return { valid: true }
}

// Get user from request (extract from JWT token in cookies)
export async function getUserFromRequest(request: Request): Promise<User | null> {
  try {
    // Get token from cookies
    const cookieHeader = request.headers.get('cookie')
    if (!cookieHeader) {
      return null
    }

    // Parse cookies to find auth-token
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=')
      acc[key] = value
      return acc
    }, {} as Record<string, string>)

    const token = cookies['auth-token']
    if (!token) {
      return null
    }

    // Verify token
    const payload = verifyToken(token)
    if (!payload) {
      return null
    }

    // Return user object (you might want to fetch from database for fresh data)
    return {
      id: payload.userId || payload.id,
      email: payload.email,
      name: '', // You might want to fetch this from database
      created_at: new Date().toISOString() // You might want to fetch this from database
    }
  } catch (error) {
    console.error('Error getting user from request:', error)
    return null
  }
}
