import { useState } from 'react';
import { useGetTasks, useAddTask, useCompleteTask } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import type { Task } from '../../backend';

export default function TodoListTab() {
  const { data: tasks, isLoading } = useGetTasks();
  const addTask = useAddTask();
  const completeTask = useCompleteTask();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('2');

  const handleAddTask = async () => {
    if (!title || !category) {
      toast.error('Please fill in title and category');
      return;
    }

    try {
      const newTask: Task = {
        id: BigInt(tasks?.length || 0),
        title,
        description,
        isComplete: false,
        priority: BigInt(priority),
        category,
        timestamp: BigInt(Date.now() * 1_000_000),
      };

      await addTask.mutateAsync(newTask);
      toast.success('Task added successfully');
      setIsAddDialogOpen(false);
      setTitle('');
      setDescription('');
      setCategory('');
      setPriority('2');
    } catch (error) {
      toast.error('Failed to add task');
      console.error(error);
    }
  };

  const handleToggleComplete = async (taskId: bigint, isComplete: boolean) => {
    if (isComplete) return;
    
    try {
      await completeTask.mutateAsync(taskId);
      toast.success('Task completed');
    } catch (error) {
      toast.error('Failed to complete task');
      console.error(error);
    }
  };

  if (isLoading) {
    return <div className="text-center py-12">Loading tasks...</div>;
  }

  const activeTasks = tasks?.filter(t => !t.isComplete) || [];
  const completedTasks = tasks?.filter(t => t.isComplete) || [];

  const getPriorityLabel = (priority: bigint) => {
    const p = Number(priority);
    if (p === 1) return 'High';
    if (p === 2) return 'Medium';
    return 'Low';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">To-Do List</h1>
          <p className="text-muted-foreground mt-1">Manage your tasks and stay organized</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add Task</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Enter task title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Enter task description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="work">Work</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="shopping">Shopping</SelectItem>
                    <SelectItem value="health">Health</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">High</SelectItem>
                    <SelectItem value="2">Medium</SelectItem>
                    <SelectItem value="3">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleAddTask} className="w-full" disabled={addTask.isPending}>
                {addTask.isPending ? 'Adding...' : 'Add Task'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Total Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{tasks?.length || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{activeTasks.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{completedTasks.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Tasks</CardTitle>
          <CardDescription>Tasks that need your attention</CardDescription>
        </CardHeader>
        <CardContent>
          {activeTasks.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No active tasks</p>
          ) : (
            <div className="space-y-3">
              {activeTasks.map((task) => (
                <div
                  key={task.id.toString()}
                  className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <Checkbox
                    checked={task.isComplete}
                    onCheckedChange={() => handleToggleComplete(task.id, task.isComplete)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{task.title}</p>
                    {task.description && (
                      <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {task.category}
                      </Badge>
                      <Badge className="text-xs">
                        {getPriorityLabel(task.priority)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(Number(task.timestamp) / 1_000_000).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {completedTasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Completed Tasks</CardTitle>
            <CardDescription>Well done</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {completedTasks.map((task) => (
                <div
                  key={task.id.toString()}
                  className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 opacity-60"
                >
                  <div className="flex-1">
                    <p className="font-medium line-through">{task.title}</p>
                    {task.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-through">{task.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {task.category}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
