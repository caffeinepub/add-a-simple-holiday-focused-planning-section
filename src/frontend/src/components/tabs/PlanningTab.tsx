import { useState } from 'react';
import { useGetPlans, useAddPlan, useUpdatePlan, useDeletePlan } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { X, Plus, ExternalLink } from 'lucide-react';
import type { Plan } from '../../backend';

export default function PlanningTab() {
  const { data: plans, isLoading } = useGetPlans();
  const addPlan = useAddPlan();
  const updatePlan = useUpdatePlan();
  const deletePlan = useDeletePlan();

  const [selectedPlanId, setSelectedPlanId] = useState<bigint | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [newPlanTitle, setNewPlanTitle] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editLinks, setEditLinks] = useState<string[]>([]);
  const [newLink, setNewLink] = useState('');

  const selectedPlan = plans?.find((p) => p.id === selectedPlanId);

  const handleAddPlan = async () => {
    if (!newPlanTitle.trim()) {
      toast.error('Please enter a plan title');
      return;
    }

    try {
      const newPlan: Plan = {
        id: BigInt(Date.now()),
        title: newPlanTitle.trim(),
        notes: '',
        links: [],
        timestamp: BigInt(Date.now() * 1_000_000),
      };

      await addPlan.mutateAsync(newPlan);
      toast.success('Plan added successfully');
      setNewPlanTitle('');
      setSelectedPlanId(newPlan.id);
      setEditNotes('');
      setEditLinks([]);
    } catch (error) {
      toast.error('Failed to add plan');
      console.error(error);
    }
  };

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlanId(plan.id);
    setEditNotes(plan.notes);
    setEditLinks([...plan.links]);
    setNewLink('');
  };

  const handleSavePlan = async () => {
    if (!selectedPlan) return;

    try {
      const updatedPlan: Plan = {
        id: selectedPlan.id,
        title: selectedPlan.title,
        notes: editNotes,
        links: editLinks,
        timestamp: selectedPlan.timestamp,
      };

      await updatePlan.mutateAsync({ planId: selectedPlan.id, updatedPlan });
      toast.success('Plan saved successfully');
    } catch (error) {
      toast.error('Failed to save plan');
      console.error(error);
    }
  };

  const handleAddLink = () => {
    if (!newLink.trim()) return;
    
    let linkToAdd = newLink.trim();
    if (!linkToAdd.startsWith('http://') && !linkToAdd.startsWith('https://')) {
      linkToAdd = 'https://' + linkToAdd;
    }

    setEditLinks([...editLinks, linkToAdd]);
    setNewLink('');
  };

  const handleRemoveLink = (index: number) => {
    setEditLinks(editLinks.filter((_, i) => i !== index));
  };

  const openDeleteDialog = (planId: bigint) => {
    setSelectedPlanId(planId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeletePlan = async () => {
    if (selectedPlanId === null) return;

    try {
      await deletePlan.mutateAsync(selectedPlanId);
      toast.success('Plan deleted successfully');
      setIsDeleteDialogOpen(false);
      if (selectedPlan?.id === selectedPlanId) {
        setSelectedPlanId(null);
        setEditNotes('');
        setEditLinks([]);
      }
    } catch (error) {
      toast.error('Failed to delete plan');
      console.error(error);
    }
  };

  if (isLoading) {
    return <div className="text-center py-12">Loading plans...</div>;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Planning</h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">Create and organize your plans</p>
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-[300px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Plans</CardTitle>
            <CardDescription>Your plan list</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="newPlanTitle">New Plan</Label>
              <div className="flex gap-2">
                <Input
                  id="newPlanTitle"
                  placeholder="e.g., Dubai"
                  value={newPlanTitle}
                  onChange={(e) => setNewPlanTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddPlan();
                    }
                  }}
                />
                <Button
                  size="icon"
                  onClick={handleAddPlan}
                  disabled={addPlan.isPending}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {plans?.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-4">No plans yet</p>
            ) : (
              <div className="space-y-2">
                {plans?.map((plan) => (
                  <button
                    key={plan.id.toString()}
                    onClick={() => handleSelectPlan(plan)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedPlanId === plan.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted/50 hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium truncate">{plan.title}</span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className={`h-6 w-6 flex-shrink-0 ${
                          selectedPlanId === plan.id
                            ? 'hover:bg-primary-foreground/20 text-primary-foreground'
                            : 'hover:bg-background'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteDialog(plan.id);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">
              {selectedPlan ? selectedPlan.title : 'Plan Editor'}
            </CardTitle>
            <CardDescription>
              {selectedPlan ? 'Edit notes and add links' : 'Select a plan to edit'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedPlan ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Start typing your notes here..."
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    rows={8}
                    className="resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Links</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a link..."
                      value={newLink}
                      onChange={(e) => setNewLink(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleAddLink();
                        }
                      }}
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={handleAddLink}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {editLinks.length > 0 && (
                    <div className="space-y-2 mt-3">
                      {editLinks.map((link, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 p-2 rounded-lg bg-muted/50"
                        >
                          <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 text-sm text-primary hover:underline truncate flex items-center gap-1"
                          >
                            <ExternalLink className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{link}</span>
                          </a>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 flex-shrink-0"
                            onClick={() => handleRemoveLink(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleSavePlan}
                  className="w-full"
                  disabled={updatePlan.isPending}
                >
                  {updatePlan.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-12">
                <p>Select a plan from the list to start editing</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Plan</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this plan? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePlan} disabled={deletePlan.isPending}>
              {deletePlan.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
