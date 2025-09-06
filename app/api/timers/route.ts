import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db/connection'
import { getUserFromRequest } from '@/lib/auth/utils'

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await pool.query(
      'SELECT * FROM timers WHERE user_id = $1 ORDER BY created_at DESC',
      [user.userId]
    )
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Error fetching timers:', error)
    return NextResponse.json({ error: 'Failed to fetch timers' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, duration, remaining } = await request.json()
    const result = await pool.query(
      'INSERT INTO timers (name, duration, remaining, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, duration, remaining, user.userId]
    )
    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Error creating timer:', error)
    return NextResponse.json({ error: 'Failed to create timer' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await pool.query('DELETE FROM timers WHERE user_id = $1', [user.userId])
    return NextResponse.json({ message: 'All timers deleted' })
  } catch (error) {
    console.error('Error deleting timers:', error)
    return NextResponse.json({ error: 'Failed to delete timers' }, { status: 500 })
  }
}
