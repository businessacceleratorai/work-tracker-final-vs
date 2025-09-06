'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FolderItem } from './FolderItem';
import { 
  Plus, 
  Search, 
  FileText, 
  FolderPlus
} from 'lucide-react';

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

interface NotesWithFoldersProps {
  notes: Note[];
  folders: Folder[];
  selectedNoteId: number | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNoteSelect: (note: Note) => void;
  onNewNote: (folderId?: number) => void;
  onNewFolder: () => void;
  onRenameFolder: (folderId: number, newName: string) => void;
  onDeleteFolder: (folderId: number) => void;
  onDeleteNote: (noteId: number) => void;
  onMoveNote: (noteId: number, folderId: number) => void;
}

export function NotesWithFolders({
  notes,
  folders,
  selectedNoteId,
  searchQuery,
  onSearchChange,
  onNoteSelect,
  onNewNote,
  onNewFolder,
  onRenameFolder,
  onDeleteFolder,
  onDeleteNote,
  onMoveNote
}: NotesWithFoldersProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(new Set());

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFolders = folders.filter(folder => {
    if (searchQuery === '') return true;
    
    // Show folder if it has matching notes or if folder name matches
    const hasMatchingNotes = filteredNotes.some(note => note.folder_id === folder.id);
    const folderNameMatches = folder.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    return hasMatchingNotes || folderNameMatches;
  });

  const getPreview = (content: string) => {
    // Strip HTML tags and get first 100 characters
    const text = content.replace(/<[^>]*>/g, '').trim();
    return text.length > 100 ? text.substring(0, 100) + '...' : text;
  };

  const handleToggleExpand = (folderId: number) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  // Expand folders that have matching notes when searching
  React.useEffect(() => {
    if (searchQuery) {
      const foldersWithMatches = new Set<number>();
      filteredNotes.forEach(note => {
        if (note.folder_id) {
          foldersWithMatches.add(note.folder_id);
        }
      });
      setExpandedFolders(foldersWithMatches);
    }
  }, [searchQuery, filteredNotes]);

  return (
    <div className="w-80 border-r bg-muted/20 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Notes
          </h2>
          <div className="flex items-center gap-1">
            <Button
              onClick={onNewFolder}
              size="sm"
              variant="outline"
              className="h-8 w-8 p-0"
              title="New Folder"
            >
              <FolderPlus className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => onNewNote()}
              size="sm"
              className="h-8 w-8 p-0"
              title="New Note (in General folder)"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notes and folders..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Folders and Notes List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredFolders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? 'No folders or notes found' : 'No folders yet'}
              <div className="text-sm mt-1">
                {!searchQuery && 'Click + to create your first folder and note'}
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredFolders.map((folder) => (
                <FolderItem
                  key={folder.id}
                  folder={folder}
                  folders={folders}
                  notes={filteredNotes}
                  isExpanded={expandedFolders.has(folder.id)}
                  selectedNoteId={selectedNoteId}
                  onToggleExpand={handleToggleExpand}
                  onNoteSelect={onNoteSelect}
                  onRenameFolder={onRenameFolder}
                  onDeleteFolder={onDeleteFolder}
                  onDeleteNote={onDeleteNote}
                  onNewNote={onNewNote}
                  onMoveNote={onMoveNote}
                  getPreview={getPreview}
                />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
