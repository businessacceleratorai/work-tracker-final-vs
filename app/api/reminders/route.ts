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
      'SELECT * FROM reminders WHERE user_id = $1 ORDER BY created_at DESC',
      [user.id]
    )
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Error fetching reminders:', error)
    return NextResponse.json({ error: 'Failed to fetch reminders' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, type, interval_seconds, next_trigger } = await request.json()
    const result = await pool.query(
      'INSERT INTO reminders (name, type, interval_seconds, next_trigger, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, type, interval_seconds, next_trigger, user.id]
    )
    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Error creating reminder:', error)
    return NextResponse.json({ error: 'Failed to create reminder' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await pool.query('DELETE FROM reminders WHERE user_id = $1', [user.id])
    return NextResponse.json({ message: 'All reminders deleted' })
  } catch (error) {
    console.error('Error deleting reminders:', error)
    return NextResponse.json({ error: 'Failed to delete reminders' }, { status: 500 })
  }
}
