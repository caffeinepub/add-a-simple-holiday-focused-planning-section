import { useState } from 'react';
import { useGetFullNNSData, useUpdateNNSState, useUpdateNNSMaturity } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function NNSProgressTab() {
  const { data: nnsData, isLoading, refetch } = useGetFullNNSData();
  const updateState = useUpdateNNSState();
  const updateMaturity = useUpdateNNSMaturity();

  const [isStateDialogOpen, setIsStateDialogOpen] = useState(false);
  const [isMaturityDialogOpen, setIsMaturityDialogOpen] = useState(false);
  const [stakedICP, setStakedICP] = useState('');
  const [earned, setEarned] = useState('');
  const [earnedPerDay, setEarnedPerDay] = useState('');

  const handleUpdateState = async () => {
    if (!stakedICP) {
      toast.error('Please enter staked ICP amount');
      return;
    }

    try {
      await updateState.mutateAsync({
        stakedICP: parseFloat(stakedICP),
        lastUpdated: BigInt(Date.now() * 1_000_000),
      });
      toast.success('NNS state updated successfully');
      setIsStateDialogOpen(false);
      setStakedICP('');
    } catch (error) {
      toast.error('Failed to update NNS state');
      console.error(error);
    }
  };

  const handleUpdateMaturity = async () => {
    if (!earned || !earnedPerDay) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await updateMaturity.mutateAsync({
        earned: parseFloat(earned),
        earnedPerDay: parseFloat(earnedPerDay),
        lastUpdated: BigInt(Date.now() * 1_000_000),
      });
      toast.success('Maturity updated successfully');
      setIsMaturityDialogOpen(false);
      setEarned('');
      setEarnedPerDay('');
    } catch (error) {
      toast.error('Failed to update maturity');
      console.error(error);
    }
  };

  if (isLoading) {
    return <div className="text-center py-12">Loading NNS data...</div>;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">NNS Progress</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">Track your staked ICP and maturity</p>
        </div>
        <Button onClick={() => refetch()} variant="outline" className="w-full sm:w-auto">
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Staked ICP</CardTitle>
            <CardDescription>Total ICP staked in NNS</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-2xl sm:text-3xl font-bold break-words">{nnsData?.nnsState.stakedICP.toFixed(2) || '0.00'} ICP</p>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Last updated: {nnsData?.nnsState.lastUpdated ? new Date(Number(nnsData.nnsState.lastUpdated) / 1_000_000).toLocaleString() : 'Never'}
            </p>
            <Dialog open={isStateDialogOpen} onOpenChange={setIsStateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full">Update Staked ICP</Button>
              </DialogTrigger>
              <DialogContent className="max-w-[95vw] sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Update Staked ICP</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="stakedICP">Staked ICP Amount</Label>
                    <Input
                      id="stakedICP"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={stakedICP}
                      onChange={(e) => setStakedICP(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleUpdateState} className="w-full" disabled={updateState.isPending}>
                    {updateState.isPending ? 'Updating...' : 'Update'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Maturity</CardTitle>
            <CardDescription>Earned maturity and daily rate</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Earned</p>
              <p className="text-2xl sm:text-3xl font-bold break-words">{nnsData?.maturity.earned.toFixed(2) || '0.00'} ICP</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Earned Per Day</p>
              <p className="text-lg sm:text-xl font-semibold break-words">{nnsData?.maturity.earnedPerDay.toFixed(4) || '0.0000'} ICP</p>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Last updated: {nnsData?.maturity.lastUpdated ? new Date(Number(nnsData.maturity.lastUpdated) / 1_000_000).toLocaleString() : 'Never'}
            </p>
            <Dialog open={isMaturityDialogOpen} onOpenChange={setIsMaturityDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full">Update Maturity</Button>
              </DialogTrigger>
              <DialogContent className="max-w-[95vw] sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Update Maturity</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="earned">Total Earned (ICP)</Label>
                    <Input
                      id="earned"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={earned}
                      onChange={(e) => setEarned(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="earnedPerDay">Earned Per Day (ICP)</Label>
                    <Input
                      id="earnedPerDay"
                      type="number"
                      step="0.0001"
                      placeholder="0.0000"
                      value={earnedPerDay}
                      onChange={(e) => setEarnedPerDay(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleUpdateMaturity} className="w-full" disabled={updateMaturity.isPending}>
                    {updateMaturity.isPending ? 'Updating...' : 'Update'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
