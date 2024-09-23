// components/PaystackButton.tsx
"use client"

import { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button"

interface PaystackButtonProps {
  amount: number
  email: string
  userId: string
  onPaymentSuccess: (reference: string) => void
  disabled: boolean
}

declare global {
  interface Window {
    PaystackPop: any;
  }
}

export default function PaystackButton({ amount, email, userId, onPaymentSuccess, disabled }: PaystackButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = useCallback(() => {
    setIsProcessing(true);
    console.log('PaystackButton: Initiating payment');

    const handler = window.PaystackPop.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
      email: email,
      amount: amount * 100, // Paystack expects amount in kobo
      currency: 'GHS',
      ref: '' + Math.floor((Math.random() * 1000000000) + 1),
      callback: function(response: any) {
        console.log('PaystackButton: Payment successful', response);
        setIsProcessing(false);
        onPaymentSuccess(response.reference);
      },
      onClose: function() {
        console.log('PaystackButton: Payment window closed');
        setIsProcessing(false);
      }
    });

    handler.openIframe();
  }, [amount, email, onPaymentSuccess]);

  return (
    <Button onClick={handlePayment} disabled={disabled || isProcessing}>
      {isProcessing ? 'Processing...' : 'Top Up'}
    </Button>
  );
}