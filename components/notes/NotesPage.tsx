'use client';

import React, { useState, useEffect } from 'react';
import { NotesWithFolders } from './NotesWithFolders';
import { NotesEditor } from './NotesEditor';
import { toast } from 'sonner';

interface Note {
  id: number;
  title: string;
  content: string;
  folder_id: number;
  folder_name?: string;
  created_at: string;
  updated_at: string;
}

interface Folder {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch folders
  const fetchFolders = async () => {
    try {
      const response = await fetch('/api/folders', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setFolders(data.folders);
      } else {
        console.error('Failed to fetch folders');
      }
    } catch (error) {
      console.error('Error fetching folders:', error);
    }
  };

  // Fetch notes
  const fetchNotes = async () => {
    try {
      const response = await fetch('/api/notes', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setNotes(data.notes);
      } else {
        console.error('Failed to fetch notes');
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFolders();
    fetchNotes();
  }, []);

  // Create new folder
  const handleNewFolder = async () => {
    try {
      const response = await fetch('/api/folders', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'New Folder'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const newFolder = data.folder;
        setFolders(prev => [...prev, newFolder]);
        toast.success('New folder created');
      } else {
        toast.error('Failed to create folder');
      }
    } catch (error) {
      console.error('Error creating folder:', error);
      toast.error('Failed to create folder');
    }
  };

  // Rename folder
  const handleRenameFolder = async (folderId: number, newName: string) => {
    try {
      const response = await fetch(`/api/folders/${folderId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newName }),
      });

      if (response.ok) {
        const data = await response.json();
        const updatedFolder = data.folder;
        
        setFolders(prev => prev.map(folder => 
          folder.id === folderId ? updatedFolder : folder
        ));
        toast.success('Folder renamed');
      } else {
        toast.error('Failed to rename folder');
      }
    } catch (error) {
      console.error('Error renaming folder:', error);
      toast.error('Failed to rename folder');
    }
  };

  // Delete folder
  const handleDeleteFolder = async (folderId: number) => {
    if (!confirm('Are you sure you want to delete this folder? It must be empty.')) {
      return;
    }

    try {
      const response = await fetch(`/api/folders/${folderId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setFolders(prev => prev.filter(folder => folder.id !== folderId));
        toast.success('Folder deleted');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to delete folder');
      }
    } catch (error) {
      console.error('Error deleting folder:', error);
      toast.error('Failed to delete folder');
    }
  };

  // Create new note
  const handleNewNote = async (folderId?: number) => {
    try {
      // If no folderId provided, use the first folder or create a default one
      let targetFolderId = folderId;
      if (!targetFolderId && folders.length > 0) {
        targetFolderId = folders[0].id;
      }

      const response = await fetch('/api/notes', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Untitled Note',
          content: '',
          folderId: targetFolderId
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const newNote = data.note;
        setNotes(prev => [newNote, ...prev]);
        setSelectedNote(newNote);
        toast.success('New note created');
      } else {
        toast.error('Failed to create note');
      }
    } catch (error) {
      console.error('Error creating note:', error);
      toast.error('Failed to create note');
    }
  };

  // Move note to different folder
  const handleMoveNote = async (noteId: number, folderId: number) => {
    try {
      const response = await fetch(`/api/notes/${noteId}/move`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ folderId }),
      });

      if (response.ok) {
        const data = await response.json();
        
        setNotes(prev => prev.map(note => 
          note.id === noteId ? { ...note, folder_id: folderId } : note
        ));
        
        // Update selected note if it's the one being moved
        if (selectedNote?.id === noteId) {
          setSelectedNote(prev => prev ? { ...prev, folder_id: folderId } : null);
        }
        
        const targetFolder = folders.find(f => f.id === folderId);
        toast.success(`Note moved to ${targetFolder?.name || 'folder'}`);
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to move note');
      }
    } catch (error) {
      console.error('Error moving note:', error);
      toast.error('Failed to move note');
    }
  };

  // Save note (create or update)
  const handleSaveNote = async (noteId: number | null, title: string, content: string) => {
    try {
      if (noteId) {
        // Update existing note
        const response = await fetch(`/api/notes/${noteId}`, {
          method: 'PUT',
        credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ title, content }),
        });

        if (response.ok) {
          const data = await response.json();
          
          setNotes(prev => prev.map(note => 
            note.id === noteId ? { ...note, content, title } : note
          ));
          setSelectedNote(prev => prev ? { ...prev, content, title } : null);
          toast.success('Note saved');
        } else {
          throw new Error('Failed to update note');
        }
      } else {
        // This shouldn't happen as we create notes immediately, but handle it
        await handleNewNote();
      }
    } catch (error) {
      console.error('Error saving note:', error);
      throw error;
    }
  };

  // Delete note
  const handleDeleteNote = async (noteId: number) => {
    if (!confirm('Are you sure you want to delete this note?')) {
      return;
    }

    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setNotes(prev => prev.filter(note => note.id !== noteId));
        
        // If the deleted note was selected, clear selection
        if (selectedNote?.id === noteId) {
          setSelectedNote(null);
        }
        
        toast.success('Note deleted');
      } else {
        toast.error('Failed to delete note');
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
    }
  };

  // Select note
  const handleNoteSelect = (note: Note) => {
    setSelectedNote(note);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-background">
      <NotesWithFolders
        notes={notes}
        folders={folders}
        selectedNoteId={selectedNote?.id || null}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onNoteSelect={handleNoteSelect}
        onNewNote={handleNewNote}
        onNewFolder={handleNewFolder}
        onRenameFolder={handleRenameFolder}
        onDeleteFolder={handleDeleteFolder}
        onDeleteNote={handleDeleteNote}
        onMoveNote={handleMoveNote}
      />
      
      <NotesEditor
        note={selectedNote}
        onSave={handleSaveNote}
        onClose={() => setSelectedNote(null)}
      />
    </div>
  );
}
