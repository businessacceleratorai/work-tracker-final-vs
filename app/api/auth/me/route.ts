import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db/connection'
import { getUserFromRequest } from '@/lib/auth/utils'

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get fresh user data from database
    const result = await pool.query(
      'SELECT id, email, name, created_at FROM users WHERE id = $1',
      [user.id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userData = result.rows[0]

    return NextResponse.json({
      user: userData,
      token: request.cookies.get('auth_token')?.value
    })
  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
