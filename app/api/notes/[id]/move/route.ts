import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db/connection';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  userId: number;
  email: string;
}

async function getUserFromToken(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) return null;
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    return decoded;
  } catch {
    return null;
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await context.params;
    const noteId = parseInt(params.id);
    const { folderId } = await request.json();

    if (!folderId) {
      return NextResponse.json({ error: 'Folder ID is required' }, { status: 400 });
    }

    // Verify the note belongs to the user
    const noteResult = await pool.query(
      'SELECT id FROM notes WHERE id = $1 AND user_id = $2',
      [noteId, user.userId]
    );

    if (noteResult.rows.length === 0) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    // Verify the folder belongs to the user
    const folderResult = await pool.query(
      'SELECT id FROM folders WHERE id = $1 AND user_id = $2',
      [folderId, user.userId]
    );

    if (folderResult.rows.length === 0) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
    }

    // Move the note to the new folder
    const result = await pool.query(
      'UPDATE notes SET folder_id = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3 RETURNING *',
      [folderId, noteId, user.userId]
    );

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Move note error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
