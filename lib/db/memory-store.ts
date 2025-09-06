// Simple in-memory data store for serverless environments
// This will work reliably in any deployment environment

interface User {
  id: number
  email: string
  password_hash: string
  name?: string
  created_at: string
}

interface Note {
  id: number
  title: string
  content: string
  folder_id?: number
  user_id: number
  created_at: string
  updated_at: string
}

interface Folder {
  id: number
  name: string
  user_id: number
  created_at: string
}

// In-memory storage (will reset on each deployment, but works for demo)
let users: User[] = []
let notes: Note[] = []
let folders: Folder[] = []
let nextUserId = 1
let nextNoteId = 1
let nextFolderId = 1

export const memoryStore = {
  // User operations
  users: {
    findByEmail: (email: string): User | undefined => {
      return users.find(user => user.email.toLowerCase() === email.toLowerCase())
    },
    
    findById: (id: number): User | undefined => {
      return users.find(user => user.id === id)
    },
    
    create: (email: string, password_hash: string, name?: string): User => {
      const user: User = {
        id: nextUserId++,
        email: email.toLowerCase(),
        password_hash,
        name: name || undefined,
        created_at: new Date().toISOString()
      }
      users.push(user)
      return user
    },
    
    getAll: (): User[] => users
  },
  
  // Folder operations
  folders: {
    findByUserId: (userId: number): Folder[] => {
      return folders.filter(folder => folder.user_id === userId)
    },
    
    findById: (id: number): Folder | undefined => {
      return folders.find(folder => folder.id === id)
    },
    
    create: (name: string, userId: number): Folder => {
      const folder: Folder = {
        id: nextFolderId++,
        name,
        user_id: userId,
        created_at: new Date().toISOString()
      }
      folders.push(folder)
      return folder
    },
    
    delete: (id: number): boolean => {
      const index = folders.findIndex(folder => folder.id === id)
      if (index !== -1) {
        folders.splice(index, 1)
        return true
      }
      return false
    },
    
    update: (id: number, name: string): Folder | undefined => {
      const folder = folders.find(f => f.id === id)
      if (folder) {
        folder.name = name
        return folder
      }
      return undefined
    }
  },
  
  // Note operations
  notes: {
    findByUserId: (userId: number): Note[] => {
      return notes.filter(note => note.user_id === userId)
    },
    
    findByFolderId: (folderId: number): Note[] => {
      return notes.filter(note => note.folder_id === folderId)
    },
    
    findById: (id: number): Note | undefined => {
      return notes.find(note => note.id === id)
    },
    
    create: (title: string, content: string, userId: number, folderId?: number): Note => {
      const note: Note = {
        id: nextNoteId++,
        title,
        content,
        folder_id: folderId,
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      notes.push(note)
      return note
    },
    
    update: (id: number, title?: string, content?: string, folderId?: number): Note | undefined => {
      const note = notes.find(n => n.id === id)
      if (note) {
        if (title !== undefined) note.title = title
        if (content !== undefined) note.content = content
        if (folderId !== undefined) note.folder_id = folderId
        note.updated_at = new Date().toISOString()
        return note
      }
      return undefined
    },
    
    delete: (id: number): boolean => {
      const index = notes.findIndex(note => note.id === id)
      if (index !== -1) {
        notes.splice(index, 1)
        return true
      }
      return false
    },
    
    moveToFolder: (id: number, folderId?: number): Note | undefined => {
      const note = notes.find(n => n.id === id)
      if (note) {
        note.folder_id = folderId
        note.updated_at = new Date().toISOString()
        return note
      }
      return undefined
    }
  },
  
  // Debug operations
  debug: {
    getStats: () => ({
      users: users.length,
      folders: folders.length,
      notes: notes.length
    }),
    
    reset: () => {
      users = []
      notes = []
      folders = []
      nextUserId = 1
      nextNoteId = 1
      nextFolderId = 1
    }
  }
}

export default memoryStore
