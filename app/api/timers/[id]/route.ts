import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db/connection'
import { getUserFromRequest } from '@/lib/auth/utils'

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { remaining, is_running, is_completed } = await request.json()
    
    const result = await pool.query(
      'UPDATE timers SET remaining = $1, is_running = $2, is_completed = $3 WHERE id = $4 AND user_id = $5 RETURNING *',
      [remaining, is_running, is_completed, params.id, user.id]
    )
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Timer not found' }, { status: 404 })
    }
    
    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Error updating timer:', error)
    return NextResponse.json({ error: 'Failed to update timer' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await pool.query(
      'DELETE FROM timers WHERE id = $1 AND user_id = $2 RETURNING *',
      [params.id, user.id]
    )
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Timer not found' }, { status: 404 })
    }
    
    return NextResponse.json({ message: 'Timer deleted' })
  } catch (error) {
    console.error('Error deleting timer:', error)
    return NextResponse.json({ error: 'Failed to delete timer' }, { status: 500 })
  }
}
