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

    const { next_trigger, is_active } = await request.json()
    
    const result = await pool.query(
      'UPDATE reminders SET next_trigger = $1, is_active = $2 WHERE id = $3 AND user_id = $4 RETURNING *',
      [next_trigger, is_active, params.id, user.userId]
    )
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Reminder not found' }, { status: 404 })
    }
    
    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Error updating reminder:', error)
    return NextResponse.json({ error: 'Failed to update reminder' }, { status: 500 })
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
      'DELETE FROM reminders WHERE id = $1 AND user_id = $2 RETURNING *',
      [params.id, user.userId]
    )
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Reminder not found' }, { status: 404 })
    }
    
    return NextResponse.json({ message: 'Reminder deleted' })
  } catch (error) {
    console.error('Error deleting reminder:', error)
    return NextResponse.json({ error: 'Failed to delete reminder' }, { status: 500 })
  }
}
