import { useState } from 'react';
import { useGetBills, useAddBill, useEditBill, useAddPayment, useGetBillSummary } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import type { Bill, Payment } from '../../backend';

export default function FinancesTab() {
  const { data: bills, isLoading } = useGetBills();
  const { data: summary } = useGetBillSummary();
  const addBill = useAddBill();
  const editBill = useEditBill();
  const addPayment = useAddPayment();

  const [isAddBillDialogOpen, setIsAddBillDialogOpen] = useState(false);
  const [isEditBillDialogOpen, setIsEditBillDialogOpen] = useState(false);
  const [isAddPaymentDialogOpen, setIsAddPaymentDialogOpen] = useState(false);
  const [selectedBillId, setSelectedBillId] = useState<bigint | null>(null);

  const [billTitle, setBillTitle] = useState('');
  const [billAmount, setBillAmount] = useState('');
  const [billDescription, setBillDescription] = useState('');

  const [editBillTitle, setEditBillTitle] = useState('');
  const [editBillAmount, setEditBillAmount] = useState('');
  const [editBillDescription, setEditBillDescription] = useState('');

  const [paymentAmount, setPaymentAmount] = useState('');

  const handleAddBill = async () => {
    if (!billTitle || !billAmount) {
      toast.error('Please fill in title and amount');
      return;
    }

    try {
      const newBill: Bill = {
        id: BigInt(bills?.length || 0),
        title: billTitle,
        totalAmount: parseFloat(billAmount),
        description: billDescription,
        createdAt: BigInt(Date.now() * 1_000_000),
        isPaid: false,
        remainingBalance: parseFloat(billAmount),
      };

      await addBill.mutateAsync(newBill);
      toast.success('Bill added successfully');
      setIsAddBillDialogOpen(false);
      setBillTitle('');
      setBillAmount('');
      setBillDescription('');
    } catch (error) {
      toast.error('Failed to add bill');
      console.error(error);
    }
  };

  const openEditDialog = (bill: Bill) => {
    setSelectedBillId(bill.id);
    setEditBillTitle(bill.title);
    setEditBillAmount(bill.totalAmount.toString());
    setEditBillDescription(bill.description);
    setIsEditBillDialogOpen(true);
  };

  const handleEditBill = async () => {
    if (!editBillTitle || !editBillAmount || selectedBillId === null) {
      toast.error('Please fill in title and amount');
      return;
    }

    const selectedBill = bills?.find((b) => b.id === selectedBillId);
    if (!selectedBill) {
      toast.error('Bill not found');
      return;
    }

    try {
      const updatedBill: Bill = {
        id: selectedBill.id,
        title: editBillTitle,
        totalAmount: parseFloat(editBillAmount),
        description: editBillDescription,
        createdAt: selectedBill.createdAt,
        isPaid: selectedBill.isPaid,
        remainingBalance: selectedBill.remainingBalance,
      };

      await editBill.mutateAsync({ billId: selectedBillId, updatedBill });
      toast.success('Bill updated successfully');
      setIsEditBillDialogOpen(false);
      setSelectedBillId(null);
      setEditBillTitle('');
      setEditBillAmount('');
      setEditBillDescription('');
    } catch (error) {
      toast.error('Failed to update bill');
      console.error(error);
    }
  };

  const handleAddPayment = async () => {
    if (!paymentAmount || selectedBillId === null) {
      toast.error('Please enter payment amount');
      return;
    }

    const selectedBill = bills?.find((b) => b.id === selectedBillId);
    if (!selectedBill) {
      toast.error('Bill not found');
      return;
    }

    const amount = parseFloat(paymentAmount);
    if (amount > selectedBill.remainingBalance) {
      toast.error('Payment amount exceeds remaining balance');
      return;
    }

    try {
      const newPayment: Payment = {
        id: BigInt(Date.now()),
        billId: selectedBillId,
        amount,
        timestamp: BigInt(Date.now() * 1_000_000),
      };

      await addPayment.mutateAsync(newPayment);
      toast.success('Payment added successfully');
      setIsAddPaymentDialogOpen(false);
      setPaymentAmount('');
      setSelectedBillId(null);
    } catch (error) {
      toast.error('Failed to add payment');
      console.error(error);
    }
  };

  const openPaymentDialog = (billId: bigint) => {
    setSelectedBillId(billId);
    setIsAddPaymentDialogOpen(true);
  };

  const getProgressPercentage = (bill: Bill): number => {
    if (bill.totalAmount === 0) return 0;
    const paid = bill.totalAmount - bill.remainingBalance;
    return (paid / bill.totalAmount) * 100;
  };

  if (isLoading) {
    return <div className="text-center py-12">Loading bill data...</div>;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Bill Tracker</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">Manage your bills and track payments</p>
        </div>
        <Dialog open={isAddBillDialogOpen} onOpenChange={setIsAddBillDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              Add Bill
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Bill</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="billTitle">Title</Label>
                <Input
                  id="billTitle"
                  placeholder="e.g., Credit Card Payment"
                  value={billTitle}
                  onChange={(e) => setBillTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="billAmount">Total Amount Owed</Label>
                <Input
                  id="billAmount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={billAmount}
                  onChange={(e) => setBillAmount(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="billDescription">Description (Optional)</Label>
                <Textarea
                  id="billDescription"
                  placeholder="Add any additional details..."
                  value={billDescription}
                  onChange={(e) => setBillDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <Button onClick={handleAddBill} className="w-full" disabled={addBill.isPending}>
                {addBill.isPending ? 'Adding...' : 'Add Bill'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Total Owed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl sm:text-3xl font-bold break-words">€{summary?.totalOwed.toFixed(2) || '0.00'}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {summary?.numBills || 0} bill{summary?.numBills !== BigInt(1) ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Total Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl sm:text-3xl font-bold break-words">€{summary?.totalPaid.toFixed(2) || '0.00'}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {summary?.numPaid || 0} paid
            </p>
          </CardContent>
        </Card>

        <Card className="sm:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Remaining</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl sm:text-3xl font-bold break-words">€{summary?.totalRemaining.toFixed(2) || '0.00'}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {summary?.numUnpaid || 0} unpaid
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bills</CardTitle>
          <CardDescription>Track your bills and payments</CardDescription>
        </CardHeader>
        <CardContent>
          {bills?.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No bills yet. Add your first bill to get started</p>
          ) : (
            <div className="space-y-4">
              {bills?.map((bill) => {
                const progressPercentage = getProgressPercentage(bill);
                const paidAmount = bill.totalAmount - bill.remainingBalance;

                return (
                  <div
                    key={bill.id.toString()}
                    className="p-4 sm:p-5 rounded-lg bg-muted/50 hover:bg-muted transition-colors space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base sm:text-lg truncate">{bill.title}</h3>
                        {bill.description && (
                          <p className="text-sm text-muted-foreground mt-1 break-words">{bill.description}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          Added {new Date(Number(bill.createdAt) / 1_000_000).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-xl sm:text-2xl font-bold break-words">€{bill.totalAmount.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">Total</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{progressPercentage.toFixed(0)}%</span>
                      </div>
                      <Progress value={progressPercentage} className="h-3" />
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
                      <div className="flex gap-4 sm:gap-6 text-sm">
                        <div>
                          <p className="text-muted-foreground">Paid</p>
                          <p className="font-semibold break-words">€{paidAmount.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Remaining</p>
                          <p className="font-semibold break-words">€{bill.remainingBalance.toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(bill)}
                          className="flex-1 sm:flex-none"
                        >
                          Edit
                        </Button>
                        {!bill.isPaid && (
                          <Button
                            size="sm"
                            onClick={() => openPaymentDialog(bill.id)}
                            className="flex-1 sm:flex-none"
                          >
                            Add Payment
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditBillDialogOpen} onOpenChange={setIsEditBillDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Bill</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editBillTitle">Title</Label>
              <Input
                id="editBillTitle"
                placeholder="e.g., Credit Card Payment"
                value={editBillTitle}
                onChange={(e) => setEditBillTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editBillAmount">Total Amount Owed</Label>
              <Input
                id="editBillAmount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={editBillAmount}
                onChange={(e) => setEditBillAmount(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editBillDescription">Description (Optional)</Label>
              <Textarea
                id="editBillDescription"
                placeholder="Add any additional details..."
                value={editBillDescription}
                onChange={(e) => setEditBillDescription(e.target.value)}
                rows={3}
              />
            </div>

            <Button onClick={handleEditBill} className="w-full" disabled={editBill.isPending}>
              {editBill.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddPaymentDialogOpen} onOpenChange={setIsAddPaymentDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedBillId !== null && bills && (
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Bill</p>
                <p className="font-semibold break-words">
                  {bills.find((b) => b.id === selectedBillId)?.title}
                </p>
                <p className="text-sm text-muted-foreground mt-2">Remaining Balance</p>
                <p className="text-xl font-bold break-words">
                  €{bills.find((b) => b.id === selectedBillId)?.remainingBalance.toFixed(2)}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="paymentAmount">Payment Amount</Label>
              <Input
                id="paymentAmount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
              />
            </div>

            <Button onClick={handleAddPayment} className="w-full" disabled={addPayment.isPending}>
              {addPayment.isPending ? 'Adding...' : 'Add Payment'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
