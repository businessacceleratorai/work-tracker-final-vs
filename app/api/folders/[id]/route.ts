import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import jwt from 'jsonwebtoken';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

interface JWTPayload {
  userId: number;
  email: string;
}

function getUserFromToken(request: NextRequest): JWTPayload | null {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) return null;
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    return decoded;
  } catch {
    return null;
  }
}

// PUT /api/folders/[id] - Update folder (rename)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const folderId = parseInt(id);

    if (isNaN(folderId)) {
      return NextResponse.json({ error: 'Invalid folder ID' }, { status: 400 });
    }

    const { name } = await request.json();

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Folder name is required' }, { status: 400 });
    }

    const result = await pool.query(
      'UPDATE folders SET name = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND user_id = $3 RETURNING id, name, created_at, updated_at',
      [name.trim(), folderId, user.userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
    }

    return NextResponse.json({ folder: result.rows[0] });
  } catch (error) {
    console.error('Error updating folder:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/folders/[id] - Delete folder
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const folderId = parseInt(id);

    if (isNaN(folderId)) {
      return NextResponse.json({ error: 'Invalid folder ID' }, { status: 400 });
    }

    // Check if folder has notes
    const notesResult = await pool.query(
      'SELECT COUNT(*) as count FROM notes WHERE folder_id = $1 AND user_id = $2',
      [folderId, user.userId]
    );

    const noteCount = parseInt(notesResult.rows[0].count);
    
    if (noteCount > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete folder with notes. Please move or delete notes first.' 
      }, { status: 400 });
    }

    const result = await pool.query(
      'DELETE FROM folders WHERE id = $1 AND user_id = $2 RETURNING id',
      [folderId, user.userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Folder deleted successfully' });
  } catch (error) {
    console.error('Error deleting folder:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
