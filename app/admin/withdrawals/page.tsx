// app/admin/withdrawals/page.tsx
"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface Withdrawal {
  id: string;
  user_id: string;
  amount: number;
  status: string;
  created_at: string;
}

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
    const { toast } = useToast()

  useEffect(() => {
    fetchWithdrawals()
  }, [])

  async function fetchWithdrawals() {
    const { data, error } = await supabase
      .from('withdrawal_requests')
      .select('*')
      .order('created_at', { ascending: false })
  
    if (error) {
      console.error('Error fetching withdrawals:', error)
    } else {
      setWithdrawals(data as Withdrawal[])
    }
  }

  async function handleApprove(id: string) {
    const { error } = await supabase
      .from('withdrawal_requests')
      .update({ status: 'approved' })
      .eq('id', id)

    if (error) {
      console.error('Error approving withdrawal:', error)
      toast({
        title: "Error",
        description: "Failed to approve withdrawal.",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Withdrawal approved.",
        variant: "default",
      })
      fetchWithdrawals()
    }
  }

  async function handleReject(id: string) {
    const { error } = await supabase
      .from('withdrawal_requests')
      .update({ status: 'rejected' })
      .eq('id', id)

    if (error) {
      console.error('Error rejecting withdrawal:', error)
      toast({
        title: "Error",
        description: "Failed to reject withdrawal.",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Withdrawal rejected.",
        variant: "default",
      })
      fetchWithdrawals()
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Withdrawal Requests</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User ID</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {withdrawals.map((withdrawal) => (
            <TableRow key={withdrawal.id}>
              <TableCell>{withdrawal.user_id}</TableCell>
              <TableCell>{withdrawal.amount} Xcoin</TableCell>
              <TableCell>{withdrawal.status}</TableCell>
              <TableCell>{new Date(withdrawal.created_at).toLocaleString()}</TableCell>
              <TableCell>
                <Button onClick={() => handleApprove(withdrawal.id)} disabled={withdrawal.status !== 'pending'}>
                  Approve
                </Button>
                <Button onClick={() => handleReject(withdrawal.id)} disabled={withdrawal.status !== 'pending'}>
                  Reject
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}