'use client';

import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';

import { addToCart } from '@/features/cart';
import { useAppDispatch } from '@/store/hooks';

export function useAddToCart() {
  const dispatch = useAppDispatch();
  const [addingId, setAddingId] = useState<number | null>(null);

  const add = useCallback(
    async (productId: number, quantity = 1) => {
      setAddingId(productId);
      try {
        await dispatch(addToCart({ id: productId, quantity })).unwrap();
        toast.success('Product added to cart!');
      } catch {
        toast.error('Product could not be added to cart.');
      } finally {
        setAddingId(null);
      }
    },
    [dispatch],
  );

  return { add, isAdding: (id: number) => addingId === id };
}
