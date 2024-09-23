"use client"
import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const BalanceContext = createContext<{
  balance: number;
  updateBalance: (newBalance: number) => void;
}>({
  balance: 0,
  updateBalance: () => {},
});

export const useBalance = () => useContext(BalanceContext);

export const BalanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [balance, setBalance] = useState(0);

  const updateBalance = (newBalance: number) => {
    setBalance(newBalance);
  };

  useEffect(() => {
    const fetchInitialBalance = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('wallets')
          .select('balance')
          .eq('user_id', user.id)
          .single();

        if (data && !error) {
          setBalance(data.balance);
        }
      }
    };

    fetchInitialBalance();

    const balanceSubscription = supabase
      .channel('balance_changes')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'wallets',
        filter: `user_id=eq.${supabase.auth.getUser()?.id}`,
      }, (payload) => {
        setBalance(payload.new.balance);
      })
      .subscribe();

    return () => {
      balanceSubscription.unsubscribe();
    };
  }, []);

  return (
    <BalanceContext.Provider value={{ balance, updateBalance }}>
      {children}
    </BalanceContext.Provider>
  );
};