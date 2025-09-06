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

// GET /api/notes - Get all notes for user with folder info
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get('folderId');

    let query = `
      SELECT n.id, n.title, n.content, n.folder_id, n.created_at, n.updated_at,
             f.name as folder_name
      FROM notes n
      LEFT JOIN folders f ON n.folder_id = f.id
      WHERE n.user_id = $1
    `;
    
    const params: (number | string)[] = [user.userId];
    
    if (folderId) {
      query += ' AND n.folder_id = $2';
      params.push(parseInt(folderId));
    }
    
    query += ' ORDER BY n.updated_at DESC';

    const result = await pool.query(query, params);

    return NextResponse.json({ notes: result.rows });
  } catch (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/notes - Create new note
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, content = '', folderId } = await request.json();
    
    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // If no folderId provided, get or create default folder
    let finalFolderId = folderId;
    if (!finalFolderId) {
      const folderResult = await pool.query(
        'SELECT id FROM folders WHERE user_id = $1 AND name = $2 LIMIT 1',
        [user.userId, 'General']
      );
      
      if (folderResult.rows.length === 0) {
        // Create default folder
        const newFolderResult = await pool.query(
          'INSERT INTO folders (name, user_id) VALUES ($1, $2) RETURNING id',
          ['General', user.userId]
        );
        finalFolderId = newFolderResult.rows[0].id;
      } else {
        finalFolderId = folderResult.rows[0].id;
      }
    }

    const result = await pool.query(
      'INSERT INTO notes (title, content, folder_id, user_id) VALUES ($1, $2, $3, $4) RETURNING id, title, content, folder_id, created_at, updated_at',
      [title.trim(), content, finalFolderId, user.userId]
    );

    return NextResponse.json({ note: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating note:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
