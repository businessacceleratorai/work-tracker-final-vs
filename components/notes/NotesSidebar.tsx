'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Plus, 
  Search, 
  FileText, 
  Trash2,
  Edit3
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Note {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface NotesSidebarProps {
  notes: Note[];
  selectedNoteId: number | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNoteSelect: (note: Note) => void;
  onNewNote: () => void;
  onDeleteNote: (noteId: number) => void;
}

export function NotesSidebar({
  notes,
  selectedNoteId,
  searchQuery,
  onSearchChange,
  onNoteSelect,
  onNewNote,
  onDeleteNote
}: NotesSidebarProps) {
  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPreview = (content: string) => {
    // Strip HTML tags and get first 100 characters
    const text = content.replace(/<[^>]*>/g, '').trim();
    return text.length > 100 ? text.substring(0, 100) + '...' : text;
  };

  return (
    <div className="w-80 border-r bg-muted/20 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Notes
          </h2>
          <Button
            onClick={onNewNote}
            size="sm"
            className="h-8 w-8 p-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Notes List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredNotes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? 'No notes found' : 'No notes yet'}
              <div className="text-sm mt-1">
                {!searchQuery && 'Click + to create your first note'}
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredNotes.map((note) => (
                <div
                  key={note.id}
                  className={`group relative p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedNoteId === note.id
                      ? 'bg-primary/10 border border-primary/20'
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => onNoteSelect(note)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate mb-1">
                        {note.title}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {getPreview(note.content) || 'No content'}
                      </p>
                      <div className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })}
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteNote(note.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
