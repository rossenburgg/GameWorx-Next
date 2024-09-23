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
      .single()

    if (error) {
      console.error('Error fetching wallet balance:', error)
      toast({
        title: "Error",
        description: "Failed to fetch wallet balance",
        variant: "destructive",
      })
    } else {
      setBalance(data.balance)
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
        await fetchWalletBalance(user.id);
        await fetchTransactionsAndWithdrawals();
        toast({
          title: "Success",
          description: `Your wallet has been topped up with ${amount} Xcoin!`,
          variant: "default",
          duration: 5000,
        });
        setAmount('');
      } else {
        throw new Error(result.error || 'Failed to verify payment');
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      toast({
        title: "Error",
        description: "Failed to verify payment. Please try again.",
        variant: "destructive",
      });
    }
  }

  

  const SkeletonBalanceCard = () => (
    <Card>
      <CardHeader>
        <Skeleton className="h-8 w-[200px]" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-12 w-[150px]" />
        <div className="mt-4">
          <Skeleton className="h-10 w-[100px]" />
        </div>
      </CardContent>
    </Card>
  )

  const SkeletonTopUpCard = () => (
    <Card className="mt-4">
      <CardHeader>
        <Skeleton className="h-8 w-[150px]" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-[100px]" />
        </div>
      </CardContent>
    </Card>
  )

  const SkeletonTransactionTable = () => (
    <Card className="mt-4">
      <CardHeader>
        <Skeleton className="h-8 w-[200px]" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Your Wallet</h1>
        <SkeletonBalanceCard />
        <SkeletonTopUpCard />
        <SkeletonTransactionTable />
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
          <p className="text-4xl font-bold">{balance} XC</p>
          <div className="mt-4 flex space-x-2">
            <WithdrawButton balance={balance} onWithdraw={handleWithdraw} />
            <P2PTransferModal onTransfer={handleP2PTransfer} balance={balance} />

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
            <PaystackButton
              amount={Number(amount)}
              email={user?.email || ''}
              userId={user?.id || ''}
              onPaymentSuccess={handleTopUp}
              disabled={!user || !amount || Number(amount) <= 0}
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
                  <TableCell>{Math.abs(transaction.amount)} Xcoin</TableCell>
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
              <div className="col-span-3">{Math.abs(selectedTransaction?.amount)} Xcoin</div>
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