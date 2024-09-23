"use client"

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import PaystackButton from '@/components/PaystackButton'
import WithdrawButton from '@/components/WithdrawButton'
import { P2PTransferModal } from '@/components/P2PTransferModal'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

export default function WalletPage() {
  const [balance, setBalance] = useState(0)
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 10
  const { toast } = useToast()

  useEffect(() => {
    fetchUserAndWalletBalance()
  }, [])

  useEffect(() => {
    if (user) {
      fetchTransactionsAndWithdrawals()
    }
  }, [user, currentPage])

  async function fetchUserAndWalletBalance() {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setUser(user)
      await fetchWalletBalance(user.id)
    }
    setLoading(false)
  }

  async function fetchWalletBalance(userId: string) {
    const { data, error } = await supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', userId)
      .single();
  
    if (error) {
      console.error('Error fetching wallet balance:', error);
      toast({
        title: "Error",
        description: "Failed to fetch wallet balance",
        variant: "destructive",
      });
    } else if (data && typeof data.balance === 'number') {
      setBalance(data.balance);
      console.log('Wallet balance updated:', data.balance);
    } else {
      console.warn('Unexpected wallet data:', data);
      setBalance(null);
    }
  }

  const fetchTransactionsAndWithdrawals = useCallback(async () => {
    // Fetch total count of transactions and withdrawal requests
    const [transactionCount, withdrawalCount] = await Promise.all([
      supabase.from('transactions').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('withdrawal_requests').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
    ]);

    const totalCount = (transactionCount.count || 0) + (withdrawalCount.count || 0);
    setTotalPages(Math.ceil(totalCount / itemsPerPage));

    // Fetch transactions and withdrawal requests
    const [{ data: transactionData }, { data: withdrawalData }] = await Promise.all([
      supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1),
      supabase
        .from('withdrawal_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1)
    ]);

    // Combine and sort transactions and withdrawal requests
    const combinedData = [
      ...(transactionData || []).map(t => ({ ...t, isTransaction: true })),
      ...(withdrawalData || []).map(w => ({ 
        ...w, 
        isTransaction: false, 
        type: 'withdrawal',
        amount: -w.amount // Use negative amount for withdrawals
      }))
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
     .slice(0, itemsPerPage);

    setTransactions(combinedData);
  }, [user, currentPage]);

  const handleTransactionClick = (transaction) => {
    setSelectedTransaction(transaction)
  }

  const handleWithdraw = async (amount: number) => {
    try {
      const { data, error } = await supabase
        .from('withdrawal_requests')
        .insert({
          user_id: user.id,
          amount: amount,
          status: 'pending'
        })

      if (error) throw error

      toast({
        title: "Success",
        description: `Withdrawal request of ${amount} Xcoin submitted for review.`,
        variant: "default",
        duration: 5000,
      })
      fetchTransactionsAndWithdrawals()
    } catch (error) {
      console.error('Error submitting withdrawal request:', error)
      toast({
        title: "Error",
        description: "Failed to submit withdrawal request. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleP2PTransfer = async (recipientEmail: string, amount: number) => {
    try {
      const response = await fetch('/api/p2p-transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientEmail,
          amount,
          senderId: user.id,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        await fetchWalletBalance(user.id);
        await fetchTransactionsAndWithdrawals();
        toast({
          title: "Success",
          description: `You have transferred ${amount} Xcoin to ${recipientEmail}!`,
          variant: "default",
          duration: 5000,
        });
      } else {
        throw new Error(result.error || 'Failed to transfer Xcoin');
      }
    } catch (error) {
      console.error('Error transferring Xcoin:', error);
      toast({
        title: "Error",
        description: "Failed to transfer Xcoin. Please try again.",
        variant: "destructive",
      });
    }
  };

  const calculateXC = (ghs: number) => {
    if (ghs < 10) {
      return 0;
    }
    
    const conversionTable = [
      { ghs: 10, xc: 100 },
      { ghs: 20, xc: 210 },
      { ghs: 50, xc: 550 },
      { ghs: 100, xc: 1200 },
      { ghs: 200, xc: 2600 },
      { ghs: 500, xc: 6500 }
    ];
  
    let lower = conversionTable[0];
    let upper = conversionTable[conversionTable.length - 1];
  
    for (let i = 0; i < conversionTable.length - 1; i++) {
      if (ghs >= conversionTable[i].ghs && ghs < conversionTable[i + 1].ghs) {
        lower = conversionTable[i];
        upper = conversionTable[i + 1];
        break;
      }
    }
  
    const ratio = (ghs - lower.ghs) / (upper.ghs - lower.ghs);
    const xc = lower.xc + ratio * (upper.xc - lower.xc);
  
    return Math.round(xc);
  };

  const handleTopUp = async (reference: string) => {
    try {
      const response = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reference,
          amount: Number(amount),
          userId: user.id,
        }),
      });
  
      const result = await response.json();
  
      if (response.ok && result.success) {
        if (result.newBalance !== undefined) {
          const newBalance = typeof result.newBalance === 'number' ? result.newBalance : parseFloat(result.newBalance);
          
          if (!isNaN(newBalance)) {
            setBalance(newBalance);
          } else {
            console.warn('Received non-numeric balance:', result.newBalance);
            await fetchWalletBalance(user.id);
          }
        } else {
          console.log('Balance not received in API response, fetching latest balance...');
          await fetchWalletBalance(user.id);
        }
  
        await fetchTransactionsAndWithdrawals();
  
        const xcAmount = result.xcAmount || calculateXC(Number(amount));
  
        toast({
          title: "Success",
          description: `Your wallet has been topped up with ${xcAmount.toFixed(2)} Xcoin!`,
          variant: "default",
          duration: 5000,
        });
        setAmount('');
      } else {
        throw new Error(result.message || 'Failed to verify payment');
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to verify payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatBalance = (value: number | null | undefined) => {
    if (value === null || value === undefined) {
      return 'Loading...';
    }
    return `${value.toFixed(2)} XC`;
  };



  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Your Wallet</h1>
        <Skeleton className="h-32 w-full mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Your Wallet</h1>
      <Card>
        <CardHeader>
          <CardTitle>Xcoin Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">
            {formatBalance(balance)}
          </p>
          <div className="mt-4 flex space-x-2">
          <WithdrawButton balance={balance ?? 0} onWithdraw={handleWithdraw} />
          <P2PTransferModal onTransfer={handleP2PTransfer} balance={balance ?? 0} />
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Top Up Xcoin</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="amount">Amount (GHS)</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </div>
            {amount && Number(amount) >= 10 ? (
                <p>You will receive approximately {calculateXC(parseFloat(amount))} XC</p>
              ) : (
                <p>Minimum deposit amount is 10 GHS</p>
              )}
            <PaystackButton
              amount={Number(amount)}
              email={user?.email || ''}
              userId={user?.id || ''}
              onPaymentSuccess={handleTopUp}
              disabled={!user || !amount || Number(amount) < 10}
            />
          </div>
        </CardContent>
      </Card>
      
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Amount</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow 
                  key={transaction.id} 
                  onClick={() => handleTransactionClick(transaction)}
                  className="cursor-pointer hover:bg-gray-600"
                >
                  <TableCell>{Math.abs(transaction.amount).toFixed(2)} Xcoin</TableCell>
                  <TableCell>{transaction.type}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      transaction.status === 'success' ? 'bg-green-200 text-green-800' :
                      transaction.status === 'failed' ? 'bg-red-200 text-red-800' :
                      'bg-yellow-200 text-yellow-800'
                    }`}>
                      {transaction.status}
                    </span>
                  </TableCell>
                  <TableCell>{new Date(transaction.created_at).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pagination className="mt-4 hover:cursor-pointer">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                />
              </PaginationItem>
              {[...Array(totalPages)].map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink 
                    onClick={() => setCurrentPage(i + 1)}
                    isActive={currentPage === i + 1}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </CardContent>
      </Card>

      <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{selectedTransaction?.isTransaction ? 'Transaction' : 'Withdrawal Request'} Details</DialogTitle>
            <DialogDescription>
              Details of the {selectedTransaction?.isTransaction ? 'transaction' : 'withdrawal request'} made on {selectedTransaction && new Date(selectedTransaction.created_at).toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">Amount</Label>
              <div className="col-span-3">{Math.abs(selectedTransaction?.amount).toFixed(2)} Xcoin</div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">Type</Label>
              <div className="col-span-3">{selectedTransaction?.type}</div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">Status</Label>
              <div className="col-span-3">{selectedTransaction?.status}</div>
            </div>
            {selectedTransaction?.isTransaction && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="reference" className="text-right">Reference</Label>
                <div className="col-span-3">{selectedTransaction?.reference}</div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}