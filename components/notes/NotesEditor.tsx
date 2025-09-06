'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RichTextEditor } from './RichTextEditor';
import { 
  Save, 
  FileText, 
  Clock,
  Loader2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Note {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface NotesEditorProps {
  note: Note | null;
  onSave: (noteId: number | null, title: string, content: string) => Promise<void>;
  onClose: () => void;
}

export function NotesEditor({ note, onSave, onClose }: NotesEditorProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setHasChanges(false);
    } else {
      setTitle('');
      setContent('');
      setHasChanges(false);
    }
  }, [note]);

  useEffect(() => {
    if (note) {
      const hasChanged = title !== note.title || content !== note.content;
      setHasChanges(hasChanged);
    } else {
      setHasChanges(title.trim() !== '' || content.trim() !== '');
    }
  }, [title, content, note]);

  const handleSave = async () => {
    if (!title.trim()) {
      alert('Please enter a title for your note');
      return;
    }

    setIsSaving(true);
    try {
      await onSave(note?.id || null, title.trim(), content);
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving note:', error);
      alert('Failed to save note. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      if (hasChanges) {
        handleSave();
      }
    }
  };

  if (!note && title === '' && content === '') {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/10">
        <div className="text-center text-muted-foreground">
          <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No note selected</h3>
          <p className="text-sm">Select a note from the sidebar or create a new one</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full" onKeyDown={handleKeyDown}>
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1 mr-4">
            <Input
              placeholder="Note title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg font-medium border-none shadow-none px-0 focus-visible:ring-0"
              style={{ fontSize: '1.125rem' }}
            />
          </div>
          
          <div className="flex items-center gap-2">
            {hasChanges && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <div className="w-2 h-2 bg-orange-500 rounded-full" />
                Unsaved changes
              </span>
            )}
            
            <Button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              size="sm"
              className="flex items-center gap-2"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save
            </Button>
          </div>
        </div>

        {note && (
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Created {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
            </div>
            {note.updated_at !== note.created_at && (
              <div>
                Updated {formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Editor */}
      <div className="flex-1 p-4 overflow-hidden">
        <RichTextEditor
          content={content}
          onChange={setContent}
          placeholder="Start writing your note..."
        />
      </div>

      {/* Footer */}
      <div className="border-t p-2 text-xs text-muted-foreground text-center">
        Press Ctrl+S to save • Rich text formatting available in toolbar
      </div>
    </div>
  );
}
