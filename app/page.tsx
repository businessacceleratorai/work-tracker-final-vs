'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Trash2, Plus, Clock, Play, Pause, RotateCcw } from 'lucide-react'
import { AuthProvider, useAuth } from '@/lib/auth/AuthContext'
import { NotesPage } from "@/components/notes/NotesPage"
import AuthForm from '@/components/auth/AuthForm'
import UserHeader from '@/components/auth/UserHeader'

interface Task {
  id: number
  text: string
  status: 'pending' | 'completed'
  created_at: string
  completed_at?: string
}

interface Timer {
  id: number
  name: string
  duration: number // in seconds
  remaining: number
  is_running: boolean
  is_completed: boolean
}

interface Reminder {
  id: number
  name: string
  type: 'once' | 'recurring'
  interval_seconds: number
  next_trigger: string
  is_active: boolean
}

function WorkTrackerContent() {
  const { user, token, isLoading, login } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [currentTab, setCurrentTab] = useState("tasks")
  const [newTaskText, setNewTaskText] = useState('')
  const [sortBy, setSortBy] = useState<'all' | 'date'>('all')
  const [timers, setTimers] = useState<Timer[]>([])
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [newTimerName, setNewTimerName] = useState('')
  const [newTimerDuration, setNewTimerDuration] = useState('')
  const [newReminderName, setNewReminderName] = useState('')
  const [newReminderType, setNewReminderType] = useState<'once' | 'recurring'>('once')
  const [newReminderInterval, setNewReminderInterval] = useState('')
  const [newReminderUnit, setNewReminderUnit] = useState<'minutes' | 'hours'>('minutes')
  
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const reminderIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Load data from database when user is authenticated
  useEffect(() => {
    if (user && token) {
      fetchTasks()
      fetchTimers()
      fetchReminders()
    }
  }, [user, token, fetchTasks, fetchTimers, fetchReminders])

  // Timer interval effect
  useEffect(() => {
    if (!user) return

    timerIntervalRef.current = setInterval(() => {
      setTimers(prevTimers => 
        prevTimers.map(timer => {
          if (timer.is_running && timer.remaining > 0) {
            const newRemaining = timer.remaining - 1
            if (newRemaining === 0) {
              // Timer completed - play sound and update database
              playNotificationSound()
              updateTimer(timer.id, { remaining: 0, is_running: false, is_completed: true })
              return { ...timer, remaining: 0, is_running: false, is_completed: true }
            } else {
              // Update database with new remaining time
              updateTimer(timer.id, { remaining: newRemaining, is_running: true, is_completed: false })
              return { ...timer, remaining: newRemaining }
            }
          }
          return timer
        })
      )
    }, 1000)

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }
    }
  }, [user, updateTimer])

  // Reminder interval effect
  useEffect(() => {
    if (!user) return

    reminderIntervalRef.current = setInterval(() => {
      const now = new Date()
      setReminders(prevReminders => 
        prevReminders.map(reminder => {
          const nextTrigger = new Date(reminder.next_trigger)
          if (reminder.is_active && now >= nextTrigger) {
            // Reminder triggered - play sound
            playNotificationSound()
            
            if (reminder.type === 'recurring') {
              // Set next trigger time and update database
              const newNextTrigger = new Date(now.getTime() + reminder.interval_seconds * 1000)
              updateReminder(reminder.id, { next_trigger: newNextTrigger.toISOString(), is_active: true })
              return { ...reminder, next_trigger: newNextTrigger.toISOString() }
            } else {
              // One-time reminder - deactivate and update database
              updateReminder(reminder.id, { next_trigger: reminder.next_trigger, is_active: false })
              return { ...reminder, is_active: false }
            }
          }
          return reminder
        })
      )
    }, 1000)

    return () => {
      if (reminderIntervalRef.current) {
        clearInterval(reminderIntervalRef.current)
      }
    }
  }, [user, updateReminder])

  const playNotificationSound = () => {
    // Create audio context and play a beep sound
    const audioContext = new (window.AudioContext || (window as Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.frequency.value = 800
    oscillator.type = 'sine'
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.5)
  }

  // API functions with authentication headers
  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  })

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks', {
        headers: getAuthHeaders(),
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setTasks(data)
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
    }
  }

  const fetchTimers = async () => {
    try {
      const response = await fetch('/api/timers', {
        headers: getAuthHeaders(),
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setTimers(data)
      }
    } catch (error) {
      console.error('Error fetching timers:', error)
    }
  }

  const fetchReminders = async () => {
    try {
      const response = await fetch('/api/reminders', {
        headers: getAuthHeaders(),
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setReminders(data)
      }
    } catch (error) {
      console.error('Error fetching reminders:', error)
    }
  }

  const addTask = async () => {
    if (newTaskText.trim()) {
      try {
        const response = await fetch('/api/tasks', {
          method: 'POST',
          headers: getAuthHeaders(),
          credentials: 'include',
          body: JSON.stringify({ text: newTaskText.trim() })
        })
        if (response.ok) {
          const newTask = await response.json()
          setTasks([newTask, ...tasks])
          setNewTaskText('')
        }
      } catch (error) {
        console.error('Error adding task:', error)
      }
    }
  }

  const completeTask = async (taskId: number) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({ status: 'completed' })
      })
      if (response.ok) {
        const updatedTask = await response.json()
        setTasks(tasks.map(task => task.id === taskId ? updatedTask : task))
      }
    } catch (error) {
      console.error('Error completing task:', error)
    }
  }

  const deleteTask = async (taskId: number) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, { 
        method: 'DELETE',
        headers: getAuthHeaders(),
        credentials: 'include'
      })
      if (response.ok) {
        setTasks(tasks.filter(task => task.id !== taskId))
      }
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  const clearAllData = async () => {
    try {
      const response = await fetch('/api/clear-all', { 
        method: 'DELETE',
        headers: getAuthHeaders(),
        credentials: 'include'
      })
      if (response.ok) {
        setTasks([])
        setTimers([])
        setReminders([])
      }
    } catch (error) {
      console.error('Error clearing all data:', error)
    }
  }

  const addTimer = async () => {
    if (newTimerName.trim() && newTimerDuration) {
      const duration = parseInt(newTimerDuration) * 60 // convert minutes to seconds
      try {
        const response = await fetch('/api/timers', {
          method: 'POST',
          headers: getAuthHeaders(),
          credentials: 'include',
          body: JSON.stringify({ name: newTimerName.trim(), duration, remaining: duration })
        })
        if (response.ok) {
          const newTimer = await response.json()
          setTimers([newTimer, ...timers])
          setNewTimerName('')
          setNewTimerDuration('')
        }
      } catch (error) {
        console.error('Error adding timer:', error)
      }
    }
  }

  const updateTimer = async (timerId: number, updates: Partial<Timer>) => {
    try {
      await fetch(`/api/timers/${timerId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(updates)
      })
    } catch (error) {
      console.error('Error updating timer:', error)
    }
  }

  const toggleTimer = async (timerId: number) => {
    const timer = timers.find(t => t.id === timerId)
    if (timer) {
      const updates = { 
        remaining: timer.remaining, 
        is_running: !timer.is_running, 
        is_completed: false 
      }
      await updateTimer(timerId, updates)
      setTimers(timers.map(t => t.id === timerId ? { ...t, ...updates } : t))
    }
  }

  const resetTimer = async (timerId: number) => {
    const timer = timers.find(t => t.id === timerId)
    if (timer) {
      const updates = { 
        remaining: timer.duration, 
        is_running: false, 
        is_completed: false 
      }
      await updateTimer(timerId, updates)
      setTimers(timers.map(t => t.id === timerId ? { ...t, ...updates } : t))
    }
  }

  const deleteTimer = async (timerId: number) => {
    try {
      const response = await fetch(`/api/timers/${timerId}`, { 
        method: 'DELETE',
        headers: getAuthHeaders(),
        credentials: 'include'
      })
      if (response.ok) {
        setTimers(timers.filter(timer => timer.id !== timerId))
      }
    } catch (error) {
      console.error('Error deleting timer:', error)
    }
  }

  const addReminder = async () => {
    if (newReminderName.trim() && newReminderInterval) {
      const intervalInSeconds = parseInt(newReminderInterval) * (newReminderUnit === 'hours' ? 3600 : 60)
      const nextTrigger = new Date(Date.now() + intervalInSeconds * 1000).toISOString()
      
      try {
        const response = await fetch('/api/reminders', {
          method: 'POST',
          headers: getAuthHeaders(),
          credentials: 'include',
          body: JSON.stringify({ 
            name: newReminderName.trim(), 
            type: newReminderType, 
            interval_seconds: intervalInSeconds, 
            next_trigger: nextTrigger 
          })
        })
        if (response.ok) {
          const newReminder = await response.json()
          setReminders([newReminder, ...reminders])
          setNewReminderName('')
          setNewReminderInterval('')
        }
      } catch (error) {
        console.error('Error adding reminder:', error)
      }
    }
  }

  const updateReminder = async (reminderId: number, updates: Partial<Reminder>) => {
    try {
      await fetch(`/api/reminders/${reminderId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(updates)
      })
    } catch (error) {
      console.error('Error updating reminder:', error)
    }
  }

  const toggleReminder = async (reminderId: number) => {
    const reminder = reminders.find(r => r.id === reminderId)
    if (reminder) {
      const updates = { 
        next_trigger: reminder.next_trigger, 
        is_active: !reminder.is_active 
      }
      await updateReminder(reminderId, updates)
      setReminders(reminders.map(r => r.id === reminderId ? { ...r, ...updates } : r))
    }
  }

  const deleteReminder = async (reminderId: number) => {
    try {
      const response = await fetch(`/api/reminders/${reminderId}`, { 
        method: 'DELETE',
        headers: getAuthHeaders(),
        credentials: 'include'
      })
      if (response.ok) {
        setReminders(reminders.filter(reminder => reminder.id !== reminderId))
      }
    } catch (error) {
      console.error('Error deleting reminder:', error)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show auth form if not authenticated
  if (!user) {
    return <AuthForm onAuthSuccess={login} />
  }

  const pendingTasks = tasks.filter(task => task.status === 'pending')
  const completedTasks = tasks.filter(task => task.status === 'completed')

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <UserHeader />
        
        {currentTab !== "notes" && (
          <div className="flex justify-end mb-6">
            <Button 
              variant="destructive" 
              onClick={clearAllData}
              className="bg-red-500 hover:bg-red-600"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          </div>
        )}

        <Tabs defaultValue="tasks" className="w-full" onValueChange={setCurrentTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="timers">Timers</TabsTrigger>
            <TabsTrigger value="reminders">Reminders</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="space-y-4">
            <div className="flex gap-4 items-center">
              <div className="flex-1 flex gap-2">
                <Input
                  placeholder="Add a new task..."
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTask()}
                  className="flex-1"
                />
                <Button onClick={addTask}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Task
                </Button>
              </div>
              <Select value={sortBy} onValueChange={(value: 'all' | 'date') => setSortBy(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Show All</SelectItem>
                  <SelectItem value="date">Sort by Date</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pending Tasks */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Pending ({pendingTasks.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {pendingTasks.map(task => (
                    <div
                      key={task.id}
                      className="p-3 bg-yellow-100 border border-yellow-200 rounded-lg flex justify-between items-start"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{task.text}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          Created: {formatDate(task.created_at)}
                        </p>
                      </div>
                      <div className="flex gap-2 ml-3">
                        <Button
                          size="sm"
                          onClick={() => completeTask(task.id)}
                          className="bg-green-500 hover:bg-green-600"
                        >
                          Complete
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteTask(task.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {pendingTasks.length === 0 && (
                    <p className="text-gray-500 text-center py-8">No pending tasks</p>
                  )}
                </CardContent>
              </Card>

              {/* Completed Tasks */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Completed ({completedTasks.length})
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {completedTasks.map(task => (
                    <div
                      key={task.id}
                      className="p-3 bg-green-50 border border-green-200 rounded-lg flex justify-between items-start"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 line-through">{task.text}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          Created: {formatDate(task.created_at)}
                        </p>
                        {task.completed_at && (
                          <p className="text-sm text-green-600">
                            Completed: {formatDate(task.completed_at)}
                          </p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteTask(task.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  {completedTasks.length === 0 && (
                    <p className="text-gray-500 text-center py-8">No completed tasks</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="timers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Add New Timer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    placeholder="Timer name..."
                    value={newTimerName}
                    onChange={(e) => setNewTimerName(e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    placeholder="Minutes"
                    value={newTimerDuration}
                    onChange={(e) => setNewTimerDuration(e.target.value)}
                    className="w-24"
                  />
                  <Button onClick={addTimer}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {timers.map(timer => (
                <Card key={timer.id} className={timer.is_completed ? 'border-green-500' : ''}>
                  <CardHeader>
                    <CardTitle className="text-lg">{timer.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center mb-4">
                      <div className={`text-3xl font-mono ${timer.is_completed ? 'text-green-600' : 'text-gray-900'}`}>
                        {formatTime(timer.remaining)}
                      </div>
                      {timer.is_completed && (
                        <Badge className="mt-2 bg-green-500">Completed!</Badge>
                      )}
                    </div>
                    <div className="flex gap-2 justify-center">
                      <Button
                        size="sm"
                        onClick={() => toggleTimer(timer.id)}
                        disabled={timer.remaining === 0}
                      >
                        {timer.is_running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => resetTimer(timer.id)}
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteTimer(timer.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {timers.length === 0 && (
              <p className="text-gray-500 text-center py-8">No timers created</p>
            )}
          </TabsContent>

          <TabsContent value="reminders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Add New Reminder</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Input
                    placeholder="Reminder name..."
                    value={newReminderName}
                    onChange={(e) => setNewReminderName(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Select value={newReminderType} onValueChange={(value: 'once' | 'recurring') => setNewReminderType(value)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="once">One-time</SelectItem>
                        <SelectItem value="recurring">Recurring</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      placeholder="Interval"
                      value={newReminderInterval}
                      onChange={(e) => setNewReminderInterval(e.target.value)}
                      className="flex-1"
                    />
                    <Select value={newReminderUnit} onValueChange={(value: 'minutes' | 'hours') => setNewReminderUnit(value)}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="minutes">Min</SelectItem>
                        <SelectItem value="hours">Hr</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={addReminder}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reminders.map(reminder => (
                <Card key={reminder.id} className={reminder.is_active ? 'border-blue-500' : 'border-gray-300'}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{reminder.name}</span>
                      <Badge variant={reminder.is_active ? 'default' : 'secondary'}>
                        {reminder.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>Type: {reminder.type}</p>
                      <p>Interval: {reminder.interval_seconds >= 3600 ? `${reminder.interval_seconds / 3600}h` : `${reminder.interval_seconds / 60}m`}</p>
                      {reminder.is_active && (
                        <p>Next: {formatDate(reminder.next_trigger)}</p>
                      )}
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        size="sm"
                        variant={reminder.is_active ? 'secondary' : 'default'}
                        onClick={() => toggleReminder(reminder.id)}
                      >
                        {reminder.is_active ? 'Pause' : 'Resume'}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteReminder(reminder.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {reminders.length === 0 && (
              <p className="text-gray-500 text-center py-8">No reminders created</p>
            )}
          </TabsContent>

          <TabsContent value="notes" className="h-full">
            <NotesPage />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default function WorkTracker() {
  return (
    <AuthProvider>
      <WorkTrackerContent />
    </AuthProvider>
  )
}
