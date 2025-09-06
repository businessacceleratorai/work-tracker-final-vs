'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Clock, Check, Trash2, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface Reminder {
  id: number;
  title: string;
  description: string;
  reminder_time: string;
  is_completed: boolean;
  created_at: string;
}

interface ReminderListProps {
  reminders: Reminder[];
  setReminders: React.Dispatch<React.SetStateAction<Reminder[]>>;
  onRefresh: () => void;
}

export function ReminderList({ reminders, setReminders, onRefresh }: ReminderListProps) {
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newReminderTime, setNewReminderTime] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddReminder = async () => {
    if (!newTitle.trim() || !newReminderTime) {
      toast.error('Please fill in title and reminder time');
      return;
    }

    try {
      const response = await fetch('/api/reminders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newTitle.trim(),
          description: newDescription.trim(),
          reminder_time: newReminderTime,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setReminders(prev => [data.reminder, ...prev]);
        setNewTitle('');
        setNewDescription('');
        setNewReminderTime('');
        setIsAdding(false);
        toast.success('Reminder added successfully');
      } else {
        toast.error('Failed to add reminder');
      }
    } catch (error) {
      console.error('Error adding reminder:', error);
      toast.error('Failed to add reminder');
    }
  };

  const handleCompleteReminder = async (id: number) => {
    try {
      const response = await fetch(`/api/reminders/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_completed: true }),
      });

      if (response.ok) {
        const data = await response.json();
        setReminders(prev => prev.map(reminder => 
          reminder.id === id ? data.reminder : reminder
        ));
        toast.success('Reminder completed');
      } else {
        toast.error('Failed to complete reminder');
      }
    } catch (error) {
      console.error('Error completing reminder:', error);
      toast.error('Failed to complete reminder');
    }
  };

  const handleDeleteReminder = async (id: number) => {
    if (!confirm('Are you sure you want to delete this reminder?')) {
      return;
    }

    try {
      const response = await fetch(`/api/reminders/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setReminders(prev => prev.filter(reminder => reminder.id !== id));
        toast.success('Reminder deleted');
      } else {
        toast.error('Failed to delete reminder');
      }
    } catch (error) {
      console.error('Error deleting reminder:', error);
      toast.error('Failed to delete reminder');
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const isOverdue = (reminderTime: string, isCompleted: boolean) => {
    if (isCompleted) return false;
    return new Date(reminderTime) < new Date();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Reminders</h2>
        <Button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Reminder
        </Button>
      </div>

      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Reminder</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Reminder title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <Textarea
              placeholder="Description (optional)"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
            />
            <Input
              type="datetime-local"
              value={newReminderTime}
              onChange={(e) => setNewReminderTime(e.target.value)}
            />
            <div className="flex gap-2">
              <Button onClick={handleAddReminder}>
                Add Reminder
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsAdding(false);
                  setNewTitle('');
                  setNewDescription('');
                  setNewReminderTime('');
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {reminders.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No reminders yet</p>
              <p className="text-sm text-muted-foreground">
                Click &quot;Add Reminder&quot; to create your first reminder
              </p>
            </CardContent>
          </Card>
        ) : (
          reminders.map((reminder) => (
            <Card key={reminder.id} className={`${
              reminder.is_completed ? 'opacity-60' : ''
            } ${isOverdue(reminder.reminder_time, reminder.is_completed) ? 'border-red-200 bg-red-50' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className={`font-medium ${
                        reminder.is_completed ? 'line-through text-muted-foreground' : ''
                      }`}>
                        {reminder.title}
                      </h3>
                      {reminder.is_completed && (
                        <Badge variant="secondary" className="text-xs">
                          <Check className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                      )}
                      {isOverdue(reminder.reminder_time, reminder.is_completed) && (
                        <Badge variant="destructive" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          Overdue
                        </Badge>
                      )}
                    </div>
                    
                    {reminder.description && (
                      <p className={`text-sm mb-2 ${
                        reminder.is_completed ? 'text-muted-foreground' : 'text-gray-600'
                      }`}>
                        {reminder.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDateTime(reminder.reminder_time)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 ml-4">
                    {!reminder.is_completed && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCompleteReminder(reminder.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteReminder(reminder.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
