'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Folder, 
  FolderOpen, 
  Edit3, 
  Trash2, 
  Check, 
  X,
  ChevronDown,
  ChevronRight,
  Plus,
  Move,
  MoreHorizontal
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Note {
  id: number;
  title: string;
  content: string;
  folder_id: number;
  created_at: string;
  updated_at: string;
}

interface FolderData {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

interface FolderItemProps {
  folder: FolderData;
  folders: FolderData[];
  notes: Note[];
  isExpanded: boolean;
  selectedNoteId: number | null;
  onToggleExpand: (folderId: number) => void;
  onNoteSelect: (note: Note) => void;
  onRenameFolder: (folderId: number, newName: string) => void;
  onDeleteFolder: (folderId: number) => void;
  onDeleteNote: (noteId: number) => void;
  onNewNote: (folderId: number) => void;
  onMoveNote: (noteId: number, folderId: number) => void;
  getPreview: (content: string) => string;
}

export function FolderItem({
  folder,
  folders,
  notes,
  isExpanded,
  selectedNoteId,
  onToggleExpand,
  onNoteSelect,
  onRenameFolder,
  onDeleteFolder,
  onDeleteNote,
  onNewNote,
  onMoveNote,
  getPreview
}: FolderItemProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(folder.name);
  const [draggedNoteId, setDraggedNoteId] = useState<number | null>(null);

  const handleRename = () => {
    if (newName.trim() && newName.trim() !== folder.name) {
      onRenameFolder(folder.id, newName.trim());
    }
    setIsRenaming(false);
    setNewName(folder.name);
  };

  const handleCancelRename = () => {
    setIsRenaming(false);
    setNewName(folder.name);
  };

  const handleFolderRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Context menu will be handled by the dropdown menu
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const noteId = parseInt(e.dataTransfer.getData('text/plain'));
    if (noteId && noteId !== draggedNoteId) {
      onMoveNote(noteId, folder.id);
    }
    setDraggedNoteId(null);
  };

  const handleNoteDragStart = (e: React.DragEvent, noteId: number) => {
    e.dataTransfer.setData('text/plain', noteId.toString());
    setDraggedNoteId(noteId);
  };

  const folderNotes = notes.filter(note => note.folder_id === folder.id);
  const otherFolders = folders.filter(f => f.id !== folder.id);

  return (
    <div className="mb-2">
      {/* Folder Header */}
      <div 
        className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg group"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onContextMenu={handleFolderRightClick}
      >
        <div className="flex items-center flex-1 min-w-0">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 mr-1"
            onClick={() => onToggleExpand(folder.id)}
          >
            {isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </Button>
          
          {isExpanded ? (
            <FolderOpen className="h-4 w-4 mr-2 text-blue-500" />
          ) : (
            <Folder className="h-4 w-4 mr-2 text-blue-500" />
          )}
          
          {isRenaming ? (
            <div className="flex items-center gap-1 flex-1">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="h-6 text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRename();
                  if (e.key === 'Escape') handleCancelRename();
                }}
                autoFocus
              />
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={handleRename}
              >
                <Check className="h-3 w-3 text-green-600" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={handleCancelRename}
              >
                <X className="h-3 w-3 text-red-600" />
              </Button>
            </div>
          ) : (
            <span className="text-sm font-medium truncate">
              {folder.name} ({folderNotes.length})
            </span>
          )}
        </div>
        
        {/* Folder Actions */}
        {!isRenaming && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                >
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onNewNote(folder.id)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Note
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsRenaming(true)}>
                  <Edit3 className="h-4 w-4 mr-2" />
                  Rename Folder
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDeleteFolder(folder.id)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Folder
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* Notes in Folder */}
      {isExpanded && (
        <div className="ml-6 space-y-1">
          {folderNotes.map((note) => (
            <div
              key={note.id}
              className={`group relative p-3 rounded-lg cursor-pointer transition-colors ${
                selectedNoteId === note.id
                  ? 'bg-primary/10 border border-primary/20'
                  : 'hover:bg-muted/50'
              } ${draggedNoteId === note.id ? 'opacity-50' : ''}`}
              onClick={() => onNoteSelect(note)}
              draggable
              onDragStart={(e) => handleNoteDragStart(e, note.id)}
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
                    {new Date(note.updated_at).toLocaleDateString()}
                  </div>
                </div>
                
                {/* Note Actions */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {otherFolders.length > 0 && (
                        <>
                          <DropdownMenuItem disabled className="text-xs font-medium">
                            <Move className="h-3 w-3 mr-2" />
                            Move to:
                          </DropdownMenuItem>
                          {otherFolders.map((targetFolder) => (
                            <DropdownMenuItem
                              key={targetFolder.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                onMoveNote(note.id, targetFolder.id);
                              }}
                              className="pl-6"
                            >
                              <Folder className="h-3 w-3 mr-2" />
                              {targetFolder.name}
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuSeparator />
                        </>
                      )}
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteNote(note.id);
                        }}
                        className="text-destructive"
                      >
                        <Trash2 className="h-3 w-3 mr-2" />
                        Delete Note
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ))}
          
          {folderNotes.length === 0 && (
            <div className="text-center py-4 text-muted-foreground text-sm">
              No notes in this folder
              <div className="mt-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNewNote(folder.id)}
                  className="text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add first note
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
