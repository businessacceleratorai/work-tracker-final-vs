import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db/connection'
import { getUserFromRequest } from '@/lib/auth/utils'

export async function DELETE(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Clear all data for the authenticated user only
    await pool.query('DELETE FROM tasks WHERE user_id = $1', [user.userId])
    await pool.query('DELETE FROM timers WHERE user_id = $1', [user.userId])
    await pool.query('DELETE FROM reminders WHERE user_id = $1', [user.userId])
    
    return NextResponse.json({ message: 'All data cleared successfully' })
  } catch (error) {
    console.error('Error clearing all data:', error)
    return NextResponse.json({ error: 'Failed to clear all data' }, { status: 500 })
  }
}
