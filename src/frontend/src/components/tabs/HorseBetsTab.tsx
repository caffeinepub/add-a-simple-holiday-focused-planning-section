import { useState } from 'react';
import { useGetHorseBets, useAddHorseBet, useGetBetStats } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import type { HorseBet } from '../../backend';

export default function HorseBetsTab() {
  const { data: bets, isLoading } = useGetHorseBets();
  const { data: stats } = useGetBetStats();
  const addBet = useAddHorseBet();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [horseName, setHorseName] = useState('');
  const [amount, setAmount] = useState('');
  const [odds, setOdds] = useState('');
  const [isWin, setIsWin] = useState(false);

  const handleAddBet = async () => {
    if (!horseName || !amount || !odds) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const newBet: HorseBet = {
        id: BigInt(bets?.length || 0),
        horseName,
        amount: parseFloat(amount),
        odds: parseFloat(odds),
        isWin,
        timestamp: BigInt(Date.now() * 1_000_000),
      };

      await addBet.mutateAsync(newBet);
      toast.success('Bet added successfully');
      setIsAddDialogOpen(false);
      setHorseName('');
      setAmount('');
      setOdds('');
      setIsWin(false);
    } catch (error) {
      toast.error('Failed to add bet');
      console.error(error);
    }
  };

  if (isLoading) {
    return <div className="text-center py-12">Loading bets...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Horse Bets</h1>
          <p className="text-muted-foreground mt-1">Track your betting history</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add Bet</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Bet</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="horseName">Horse Name</Label>
                <Input
                  id="horseName"
                  placeholder="Enter horse name"
                  value={horseName}
                  onChange={(e) => setHorseName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Bet Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="odds">Odds</Label>
                <Input
                  id="odds"
                  type="number"
                  step="0.01"
                  placeholder="e.g., 2.5"
                  value={odds}
                  onChange={(e) => setOdds(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isWin"
                  checked={isWin}
                  onChange={(e) => setIsWin(e.target.checked)}
                  className="h-4 w-4"
                />
                <Label htmlFor="isWin">Won</Label>
              </div>

              <Button onClick={handleAddBet} className="w-full" disabled={addBet.isPending}>
                {addBet.isPending ? 'Adding...' : 'Add Bet'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Total Bets</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats?.totalBets.toString() || '0'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Total Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">€{stats?.totalAmount.toFixed(2) || '0.00'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Wins / Losses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {stats?.totalWins.toString() || '0'} / {stats?.totalLosses.toString() || '0'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profit / Loss</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-3xl font-bold ${(stats?.profitLoss || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              €{stats?.profitLoss.toFixed(2) || '0.00'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Betting History</CardTitle>
          <CardDescription>Your recent bets</CardDescription>
        </CardHeader>
        <CardContent>
          {bets?.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No bets yet</p>
          ) : (
            <div className="space-y-3">
              {bets?.map((bet) => (
                <div
                  key={bet.id.toString()}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                >
                  <div className="flex-1">
                    <p className="font-medium">{bet.horseName}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(Number(bet.timestamp) / 1_000_000).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">€{bet.amount.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">Odds: {bet.odds.toFixed(2)}</p>
                  </div>
                  <Badge className={bet.isWin ? 'bg-green-500 ml-4' : 'bg-red-500 ml-4'}>
                    {bet.isWin ? 'Win' : 'Loss'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
