import { useState } from 'react';
import { useGetHabits, useAddHabit, useUpdateHabitProgress } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import type { Habit } from '../../backend';

export default function HabitTrackerTab() {
  const { data: habits, isLoading } = useGetHabits();
  const addHabit = useAddHabit();
  const updateProgress = useUpdateHabitProgress();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');

  const handleAddHabit = async () => {
    if (!name || !goal) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const newHabit: Habit = {
        id: BigInt(habits?.length || 0),
        name,
        goal: BigInt(goal),
        progress: BigInt(0),
        streak: BigInt(0),
        lastUpdated: BigInt(Date.now() * 1_000_000),
      };

      await addHabit.mutateAsync(newHabit);
      toast.success('Habit added successfully');
      setIsAddDialogOpen(false);
      setName('');
      setGoal('');
    } catch (error) {
      toast.error('Failed to add habit');
      console.error(error);
    }
  };

  const handleUpdateProgress = async (habitId: bigint, currentProgress: bigint, goal: bigint) => {
    const newProgress = Number(currentProgress) + 1;
    
    try {
      await updateProgress.mutateAsync({
        habitId,
        progress: BigInt(newProgress),
      });
      
      if (newProgress >= Number(goal)) {
        toast.success('Goal reached! Congratulations');
      } else {
        toast.success('Progress updated');
      }
    } catch (error) {
      toast.error('Failed to update progress');
      console.error(error);
    }
  };

  if (isLoading) {
    return <div className="text-center py-12">Loading habits...</div>;
  }

  const totalHabits = habits?.length || 0;
  const activeHabits = habits?.filter(h => Number(h.progress) < Number(h.goal)).length || 0;
  const completedToday = habits?.filter(h => Number(h.progress) >= Number(h.goal)).length || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Habit Tracker</h1>
          <p className="text-muted-foreground mt-1">Build better habits, one day at a time</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add Habit</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Habit</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Habit Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Drink 8 glasses of water"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="goal">Daily Goal</Label>
                <Input
                  id="goal"
                  type="number"
                  placeholder="e.g., 8"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                />
              </div>

              <Button onClick={handleAddHabit} className="w-full" disabled={addHabit.isPending}>
                {addHabit.isPending ? 'Adding...' : 'Add Habit'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Total Habits</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalHabits}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{activeHabits}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Completed Today</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{completedToday}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6">
        {habits?.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <p className="text-center text-muted-foreground">No habits yet. Start building better habits today</p>
            </CardContent>
          </Card>
        ) : (
          habits?.map((habit) => {
            const progressPercent = (Number(habit.progress) / Number(habit.goal)) * 100;
            const isComplete = Number(habit.progress) >= Number(habit.goal);

            return (
              <Card key={habit.id.toString()}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {habit.name}
                        {isComplete && <Badge>Complete</Badge>}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        Progress: {habit.progress.toString()} / {habit.goal.toString()}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Streak</p>
                        <p className="text-2xl font-bold">{habit.streak.toString()}</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Progress value={progressPercent} className="h-3" />
                  <Button
                    onClick={() => handleUpdateProgress(habit.id, habit.progress, habit.goal)}
                    disabled={isComplete || updateProgress.isPending}
                    className="w-full"
                  >
                    {isComplete ? 'Goal Reached' : 'Update Progress'}
                  </Button>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
