// app/store/page.tsx
"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { PurchaseConfirmDialog } from '@/components/PurchaseConfirmDialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface StoreItem {
  id: string
  name: string
  description: string
  price: number
  image_url: string
}

interface PurchaseHistory {
  id: string
  item_id: string
  purchased_at: string
  store_items: StoreItem
}

export default function StorePage() {
  const [items, setItems] = useState<StoreItem[]>([])
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [balance, setBalance] = useState(0)
  const [selectedItem, setSelectedItem] = useState<StoreItem | null>(null)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchItems()
    fetchUserAndBalance()
    fetchPurchaseHistory()
  }, [])

  async function fetchItems() {
    const { data, error } = await supabase
      .from('store_items')
      .select('*')
    
    if (error) {
      console.error('Error fetching items:', error)
    } else {
      setItems(data)
    }
    setLoading(false)
  }

  async function fetchUserAndBalance() {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setUser(user)
      const { data, error } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', user.id)
        .single()
      
      if (error) {
        console.error('Error fetching balance:', error)
      } else {
        setBalance(data.balance)
      }
    }
  }

  async function fetchPurchaseHistory() {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data, error } = await supabase
        .from('user_items')
        .select(`
          id,
          item_id,
          purchased_at,
          store_items (
            id,
            name,
            description,
            price,
            image_url
          )
        `)
        .eq('user_id', user.id)
        .order('purchased_at', { ascending: false })
      
      if (error) {
        console.error('Error fetching purchase history:', error)
      } else {
        setPurchaseHistory(data)
      }
    }
  }

  function handlePurchaseClick(item: StoreItem) {
    setSelectedItem(item)
    setIsConfirmDialogOpen(true)
  }

  async function handlePurchaseConfirm() {
    if (!selectedItem) return

    if (balance < selectedItem.price) {
      toast({
        title: "Insufficient balance",
        description: "You don't have enough Xcoin to purchase this item.",
        variant: "destructive",
      })
      setIsConfirmDialogOpen(false)
      return
    }

    const response = await fetch('/api/purchase-item', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        itemId: selectedItem.id,
        userId: user.id,
      }),
    })

    const result = await response.json()

    if (result.success) {
      toast({
        title: "Purchase successful",
        description: "Item has been added to your inventory.",
        variant: "default",
      })
      setBalance(balance - selectedItem.price)
      fetchPurchaseHistory()
    } else {
      toast({
        title: "Purchase failed",
        description: result.error,
        variant: "destructive",
      })
    }
    setIsConfirmDialogOpen(false)
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Store</h1>
      <p className="mb-4">Your balance: {balance} Xcoin</p>
      <Tabs defaultValue="store">
        <TabsList>
          <TabsTrigger value="store">Store</TabsTrigger>
          <TabsTrigger value="history">Purchase History</TabsTrigger>
        </TabsList>
        <TabsContent value="store">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <CardTitle>{item.name}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <img src={item.image_url} alt={item.name} className="w-full h-48 object-cover" />
                </CardContent>
                <CardFooter className="flex justify-between">
                  <span>{item.price} Xcoin</span>
                  <Button onClick={() => handlePurchaseClick(item)}>Purchase</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="history">
          <div className="space-y-4">
            {purchaseHistory.map((purchase) => (
              <Card key={purchase.id}>
                <CardHeader>
                  <CardTitle>{purchase.store_items.name}</CardTitle>
                  <CardDescription>Purchased on: {new Date(purchase.purchased_at).toLocaleString()}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>{purchase.store_items.description}</p>
                  <p className="font-bold mt-2">Price: {purchase.store_items.price} Xcoin</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
      {selectedItem && (
        <PurchaseConfirmDialog
          isOpen={isConfirmDialogOpen}
          onClose={() => setIsConfirmDialogOpen(false)}
          onConfirm={handlePurchaseConfirm}
          item={selectedItem}
        />
      )}
    </div>
  )
}